import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CountryListModel, StateListModel } from '@app/utils/models/shared-checkout.models';
import { AddressService } from '@app/utils/services/address.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalStorageService } from 'ngx-webstorage';
import { forkJoin, Subscription } from 'rxjs';

@Component({
    selector: 'create-edit-billing-address',
    templateUrl: './create-edit-billing-address.component.html',
    styleUrls: ['./create-edit-billing-address.component.scss']
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
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<any> = new EventEmitter<any>();

    addressForm = null;
    userSesssion = null;
    lastSearchedPostcode = null;
    verifiedGSTINDetails = null;

    countryList = [];
    stateList = [];

    isVerifyingPostcode = false;
    isPostcodeValid = false;
    isGSTINVerified = false;
    isBusinessDetailExists = false;

    gstingSubscription: Subscription = null;
    postCodeSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService, private _localStorageService: LocalStorageService,
        private _commonService: CommonService, private _toastMessageService: ToastMessageService, private _formBuilder: FormBuilder,)
    {
        this.userSesssion = this._localAuthService.getUserSession();
    }


    ngOnInit() 
    {
        this.createAddressForm(this.address);
        this._addressService.getCountryList().subscribe((countryList: CountryListModel[]) =>
        {
            this.countryList = countryList;
            this.fetchStateList(this.countryList[0]['idCountry']);
        })
    }

    ngAfterViewInit()
    {
        if (this.address) {
            this.isPostcodeValid = true;
            this.isGSTINVerified = this.address['gstinVerified'] ? true : false;
            this.companyName.markAsDirty();
            this.addressLine.markAsDirty();
            this.addSubscribers();
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
                this.addSubscribers();
            }
        });
    }

    fetchStateList(countryId)
    {
        this._addressService.getStateList(countryId).subscribe((stateList: StateListModel[]) =>
        {
            this.stateList = stateList;
            const COUNTRY_ID = this._addressService.getCountry(this.countryList, null);
            const STATE_ID = this._addressService.getState(this.stateList, null);
            this.idCountry.patchValue(COUNTRY_ID);
            this.idState.patchValue(STATE_ID);
        })
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
                        const ID_STATE = this._addressService.getStateId(this.stateList, cityList['state']);
                        this.idState.patchValue(ID_STATE);
                        return;
                    }
                    this.isVerifyingPostcode = false;
                }
            )
        }
    }

    verifyGSTIN()
    {
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
        const ADDRESS_LINE = this._addressService.getFormattedAddressLine(this.addressLineKeys, billingAddress);
        this.addressLine.patchValue(ADDRESS_LINE)
        this.postCode.patchValue(billingAddress['pncd']);
        //this.getCityByPostcode();//TODO:not required as subscriber should do job
    }

    resetGSTINVarification(message)
    {
        this.isGSTINVerified = false;
        this.verifiedGSTINDetails = {};
        this._toastMessageService.show({ type: "error", text: message });
    }

    createAddressForm(address)
    {
        this.addressForm = this._formBuilder.group({
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
                idCountry: [null, [Validators.required]],
                idState: [null, [Validators.required]],
            })
        });
    }

    onSubmit(data)
    {
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
                let response1: any[] = responses[0];
                if (response1.length) {
                    let successCount: number = this._addressService.getSuccessCount(responses);
                    if (responses.length == successCount) {
                        if (!this.isBusinessDetailExists && !(IS_IDADDRESSEXITS)) {
                            this.userSesssion['userType'] = 'business';
                            this._localStorageService.store('user', this.userSesssion);
                        }
                        this.closeAddressPopUp$.emit({ aType: A_TYPE, action: this.modeType, addresses: responses[0] });
                    }
                    return;
                }
                this._toastMessageService.show({ type: 'error', text: response1['statusDescription'] });
            });
        }
    }

    get modeType() { return this.isAddMode ? "Add" : "Edit"; }
    handlePopup($event) { this.closeAddressPopUp$.emit({ aType: null, action: null, addresses: null }); }
    get canSubmit() { return this.addressForm.valid && this.isPostcodeValid && !(this.isVerifyingPostcode) && this.isGSTINVerified }

    //getters
    get gstin() { return this.addressForm.get('businessDetail').get('gstin'); }
    get companyName() { return this.addressForm.get('businessDetail').get('companyName'); }
    get email() { return this.addressForm.get('businessDetail').get('email'); }
    get phone() { return this.addressForm.get('businessDetail').get('phone'); }
    get postCode() { return this.addressForm.get('billingAddress').get('postCode'); }
    get addressLine() { return this.addressForm.get('billingAddress').get('addressLine'); }
    get city() { return this.addressForm.get('billingAddress').get('city'); }
    get idState() { return this.addressForm.get('billingAddress').get('idState'); }
    get idCountry() { return this.addressForm.get('billingAddress').get('idCountry'); }

    ngOnDestroy(): void
    {
        this.gstingSubscription.unsubscribe();
        this.postCodeSubscription.unsubscribe();
    }
}
