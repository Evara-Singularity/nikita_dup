import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import CONSTANTS from '@app/config/constants';
import { PopUpVariant2Module } from '@app/modules/pop-up-variant2/pop-up-variant2.module';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { CountryListModel, StateListModel } from '@app/utils/models/shared-checkout.models';
import { AddressService } from '@app/utils/services/address.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalStorageService } from 'ngx-webstorage';
import { forkJoin, Subscription } from 'rxjs';
import { SharedCheckoutAddressUtil } from '../shared-checkout-address-util';

@Component({
    selector: 'create-edit-billing-address',
    templateUrl: './create-edit-billing-address.component.html',
    styleUrls: ['../common-checkout.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateEditBillingAddressComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly ADDRESS_TYPE = "Billing";
    readonly globalConstants = CONSTANTS.GLOBAL;
    readonly addressLineKeys = ['bno', 'flno', 'bnm', 'st', 'loc'];

    @Input("displayCreateEditPopup") displayCreateEditPopup = false;
    @Input("isAddMode") isAddMode = true;
    @Input("invoiceType") invoiceType = "tax";
    @Input("address") address = null;
    @Input("countryList") countryList = [];
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<any> = new EventEmitter<any>();

    businessForm: FormGroup = null;
    userSesssion = null;
    lastSearchedPostcode = null;
    verifiedGSTINDetails = null;

    stateList = [];

    isVerifyingPostcode = false;
    isPostcodeValid = false;
    isGSTINVerified = false;
    isBusinessDetailExists = false;
    isSubmitted = false;

    gstingSubscription: Subscription = null;
    postCodeSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService, private _localStorageService: LocalStorageService,
        private _commonService: CommonService, private _toastMessageService: ToastMessageService, private _formBuilder: FormBuilder,)
    {
        this.userSesssion = this._localAuthService.getUserSession();
    }


    ngOnInit() 
    {
        this.createBusinessForm(this.address);
        this.fetchStateList(this.countryList[0]['idCountry']);
    }

    ngAfterViewInit()
    {
        if (this.address) {
            this.isPostcodeValid = true;
            this.isGSTINVerified = this.address['gstinVerified'] ? true : false;
            this.companyName.markAsDirty();
            this.addressLine.markAsDirty();
            return;
        }
    }

    fetchBusinessDetails()
    {
        const data = { customerId: this.userSesssion['userId'], userType: this.userSesssion['userType'] };
        this._addressService.getBusinessDetail(data).subscribe((response) =>
        {
            if (response) {
                this.isBusinessDetailExists = true;
                this.companyName.patchValue(response['companyName']);
                this.gstin.patchValue(response['gstin']);
                this.phone.patchValue(response['phone']);
                this.email.patchValue(response['email']);
                this.companyName.markAsDirty();
            }
        });
    }

    fetchStateList(countryId)
    {
        this._addressService.getStateList(countryId).subscribe((stateList: StateListModel[]) =>
        {
            this.stateList = stateList;
            const COUNTRY_ID = SharedCheckoutAddressUtil.getCountry(this.countryList, null);
            const STATE_ID = SharedCheckoutAddressUtil.getState(this.stateList, null);
            this.idCountry.patchValue(COUNTRY_ID);
            this.idState.patchValue(STATE_ID);
        })
        this.addSubscribers()
    }

    addSubscribers()
    {
        this.gstingSubscription = this.gstin.valueChanges.subscribe((value: string) =>
        {
            this.isGSTINVerified = false;
        })
        this.postCodeSubscription = this.postCode.valueChanges.subscribe(
            (data) =>
            {
                if (this.postCode.valid && data && data.toString().length == 6 && data != this.lastSearchedPostcode) {
                    this.getCityByPostcode();
                }
            }
        );
    }

    getCityByPostcode()
    {
        this.isVerifyingPostcode = true;
        this.isPostcodeValid = false;
        if (this.postCode) {
            this.lastSearchedPostcode = this.postCode.value;
            this._addressService.getCityByPostcode(this.lastSearchedPostcode).subscribe(
                (cityList: any[]) =>
                {
                    if (cityList.length) {
                        this.isPostcodeValid = true;
                        this.isVerifyingPostcode = false;
                        this.city.patchValue(cityList[0]['city']);
                        const ID_STATE = SharedCheckoutAddressUtil.getStateId(this.stateList, cityList[0]['state']);
                        this.idState.patchValue(ID_STATE);
                        return;
                    }
                    this.isVerifyingPostcode = false;
                }
            )
        }
    }

    verifyGSTIN($event)
    {
        $event.stopPropagation();
        this._addressService.getGSTINDetails(this.gstin.value).subscribe(
            (response) =>
            {
                if (response && response['taxpayerDetails'] != null) {
                    this.verifiedGSTINDetails = response['taxpayerDetails'];
                    this.isGSTINVerified = response['valid'];
                    this.postGSTINVerification();
                } else {
                    this.resetGSTINVarification(response['message']);
                }
            },
        );
    }

    postGSTINVerification()
    {
        const billingAddress = this.verifiedGSTINDetails['billing_address']['addr'];
        this.companyName.markAsDirty();
        this.companyName.patchValue(this.verifiedGSTINDetails['legal_name_of_business']);
        this.addressLine.markAsDirty();
        const ADDRESS_LINE = SharedCheckoutAddressUtil.getFormattedAddressLine(this.addressLineKeys, billingAddress);
        this.addressLine.patchValue(ADDRESS_LINE)
        this.postCode.patchValue(billingAddress['pncd']);
    }

    resetGSTINVarification(message)
    {
        this.isGSTINVerified = false;
        this.verifiedGSTINDetails = {};
        this._toastMessageService.show({ type: "error", text: message });
    }

    createBusinessForm(address)
    {
        this.businessForm = this._formBuilder.group({
            businessDetail: this._formBuilder.group({
                companyName: [address && address.addressCustomerName ? address.addressCustomerName : null, [Validators.required]],
                gstin: [(address && address.gstin) ? address.gstin : null, [Validators.required, Validators.minLength(15)]],
                email: [(address && address.email) ? address.email : null, [Step.validateEmail]],
                phone: [(address && address.phone) ? address.phone : null, [Validators.required, Step.validatePhone]],
            }),
            billingAddress: this._formBuilder.group({
                idAddress: (this.address && this.address['idAddress']) ? this.address['idAddress'] : null,
                postCode: [(address && address.postCode) ? address.postCode : null, [Validators.required, Step.validatePostCode]],
                landmark: [(address && address.landmark) ? address.landmark : null],
                addressLine: [(address && address.addressLine) ? address.addressLine : null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._;, \/()-]*$/)]],
                city: [(address && address.city) ? address.city : null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]],
                idCountry: [{ value: null, disabled: true }, [Validators.required]],
                idState: [{ value: null, disabled: true }, [Validators.required]],
            })
        });
    }

    onSubmit()
    {
        this.isSubmitted = true;
        let data = this.businessForm.getRawValue();
        if (!(this.canSubmit)) return;
        const BILLING_DETAILS = data['billingAddress'];
        const BUSINESS_DETAILS = data['businessDetail'];
        const IS_IDADDRESSEXITS = BILLING_DETAILS['idAddress'] ? true : false;
        BILLING_DETAILS['idCustomer'] = this.userSesssion['userId'];
        BILLING_DETAILS['idAddressType'] = 2;
        BILLING_DETAILS['active'] = true;
        BILLING_DETAILS['invoiceType'] = this.invoiceType;
        BILLING_DETAILS['isGstInvoice'] = 1;
        BILLING_DETAILS['addressCustomerName'] = BUSINESS_DETAILS['companyName'];
        BILLING_DETAILS['gstin'] = BUSINESS_DETAILS['gstin'];
        BILLING_DETAILS['email'] = BUSINESS_DETAILS['email'];
        BILLING_DETAILS['phone'] = BUSINESS_DETAILS['phone'];
        let request = Object.assign(
            {},
            BUSINESS_DETAILS,
            { customerId: this.userSesssion['userId'], isGstInvoice: 1, },
            { address: BILLING_DETAILS }
        );
        const A_TYPE = IS_IDADDRESSEXITS ? this.globalConstants['updated'] : this.globalConstants['created'];
        if (this._commonService.isBrowser) {
            let fjData = [this._addressService.postAddress(BILLING_DETAILS)];
            if (!this.isBusinessDetailExists && !(IS_IDADDRESSEXITS)) {
                request['postCode'] = request['address']['postCode'];
                fjData = [...fjData, this._addressService.setBusinessDetail(request)];
            }
            forkJoin(fjData).subscribe((responses) =>
            {
                debugger;
                let response1: any[] = responses[0];
                let response2: any[] = responses[1] ? responses[1] : true;
                if (response1.length) {
                    this._toastMessageService.show({ type: "success", text: `${this.ADDRESS_TYPE} address saved successfully` });
                    if (response2) {
                        if (!this.isBusinessDetailExists && !(IS_IDADDRESSEXITS)) {
                            this.userSesssion['userType'] = 'business';
                            this._localStorageService.store('user', this.userSesssion);
                        }
                        this.closeAddressPopUp$.emit({ aType: A_TYPE, action: this.modeType, addresses: responses[0] });
                    }
                    return;
                }
                this._toastMessageService.show({ type: 'error', text: response1['statusDescription'] || "Unable to save address" });
            });
        }
    }

    get modeType() { return this.isAddMode ? "Add" : "Edit"; }
    handlePopup($event) { this.closeAddressPopUp$.emit({ aType: null, action: null, addresses: null }); }
    get canSubmit() { return this.businessForm.valid && this.isPostcodeValid && !(this.isVerifyingPostcode) && this.isGSTINVerified }
    isBusinessFieldFocus(control: string)
    {
        const VALUE = this.businessForm.get('businessDetail').get(control).value;
        return VALUE ? true : false;
    }
    isBillingFieldFocus(control: string)
    {
        const VALUE = this.businessForm.get('billingAddress').get(control).value
        return VALUE ? true : false;
    }

    //getters
    get gstin() { return this.businessForm.get('businessDetail').get('gstin') as FormControl; }
    get companyName() { return this.businessForm.get('businessDetail').get('companyName') as FormControl; }
    get email() { return this.businessForm.get('businessDetail').get('email') as FormControl; }
    get phone() { return this.businessForm.get('businessDetail').get('phone') as FormControl; }
    get postCode() { return this.businessForm.get('billingAddress').get('postCode') as FormControl; }
    get addressLine() { return this.businessForm.get('billingAddress').get('addressLine') as FormControl; }
    get city() { return this.businessForm.get('billingAddress').get('city') as FormControl; }
    get idState() { return this.businessForm.get('billingAddress').get('idState') as FormControl; }
    get idCountry() { return this.businessForm.get('billingAddress').get('idCountry') as FormControl; }
    get displayError() { return (this.isGSTINVerified && this.isSubmitted) ? true : false }

    ngOnDestroy(): void
    {
        this.gstingSubscription.unsubscribe();
        this.postCodeSubscription.unsubscribe();
    }
}

@NgModule({
    declarations: [CreateEditBillingAddressComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PopUpVariant2Module, NumberDirectiveModule],
    exports: [CreateEditBillingAddressComponent]
})
export class CreateEditDeliveryAddressModule { }
