import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { SharedPhoneVerificationComponent } from './../../shared-phone-verification/shared-phone-verification.component';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Compiler, Component, ComponentRef, EventEmitter, Injector, Input, NgModule, NgModuleRef, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtpPopupComponent } from '@app/components/otp-popup/otp-popup.component';
import { ModalService } from '@app/modules/modal/modal.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { StateListModel } from '@app/utils/models/shared-checkout.models';
import { AddressService } from '@app/utils/services/address.service';
import { CommonService } from '@app/utils/services/common.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalAuthService } from '@services/auth.service';
import { Subscription } from 'rxjs';
import { SharedCheckoutAddressUtil } from '../shared-checkout-address-util';
import { CONSTANTS } from './../../../config/constants';
import { SharedPhoneVerificationModule } from './../../../modules/shared-phone-verification/shared-phone-verification.module';
import { PopUpVariant2Module } from './../../pop-up-variant2/pop-up-variant2.module';

@Component({
    selector: 'create-edit-delivery-address',
    templateUrl: './create-edit-delivery-address.component.html',
    styleUrls: ['../common-checkout.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CreateEditDeliveryAddressComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly ADDRESS_TYPE = "Delivery";
    readonly globalConstants = CONSTANTS.GLOBAL;

    @Input("displayCreateEditPopup") displayCreateEditPopup = false;
    @Input("isAddMode") isAddMode = true;
    @Input("invoiceType") invoiceType = "retail";
    @Input("address") address = null;
    @Input("verifiedPhones") verifiedPhones: string[];
    @Input("countryList") countryList = [];
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<any> = new EventEmitter<any>();

    addressForm: FormGroup = null;
    userSesssion = null;
    lastSearchedPostcode = null;

    stateList = [];

    isVerifyingPostcode = false;
    isPostcodeValid = false;

    phoneSubscription: Subscription = null;
    postCodeSubscription: Subscription = null;

    phoneVerificationInstance: ComponentRef<SharedPhoneVerificationComponent> = null;
    @ViewChild("phoneVerification", { read: ViewContainerRef })
    phoneVerificationContainerRef: ViewContainerRef;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService, private _formBuilder: FormBuilder,
        private _commonService: CommonService, private _modalService: ModalService, private _toastMessage: ToastMessageService, private _compiler: Compiler,
        private _injector: Injector, private _globalLoader:GlobalLoaderService)
    {
        this.userSesssion = this._localAuthService.getUserSession();
    }

    ngOnInit() 
    {
        this.createAddressForm(this.address);
        this.fetchStateList(this.countryList[0]['idCountry']);
    }

    ngAfterViewInit()
    {
        // valueChanges is subcribed two times once when valid is filled and second time on lost focus making two API calls
        // lastSearchedPostcode is implemented to avoid similar API calls
        this.postCodeSubscription = this.postCode.valueChanges.subscribe(
            (postCode: string) =>
            {
                if (postCode && postCode.length === 6 && postCode != this.lastSearchedPostcode) {
                    this.getCityByPostcode();
                }
            }
        );
        this.phoneSubscription = this.phone.valueChanges.subscribe(
            (phone: string) => { if (phone.length === 10) { this.verifyPhone(phone); } }
        );
    }

    createAddressForm(address)
    {
        this.addressForm = this._formBuilder.group({
            'idAddress': address && address.idAddress ? address.idAddress : null,
            'addressCustomerName': [(address && address.addressCustomerName) ? address.addressCustomerName : (this.userSesssion['userName'] && (this.userSesssion['userName']!=CONSTANTS.DEFAULT_USER_NAME_PLACE_HOLDER )? this.userSesssion['userName']:""), [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
            'phone': [(address && address.phone) ? address.phone : this.userSesssion['phone'], [Validators.required, Step.validatePhone]],
            'alternatePhone': [(address && address.alternatePhone) ? address.alternatePhone : this.userSesssion['alternatePhone'], [Validators.pattern("[0-9]{10}")]],
            'postCode': [(address && address.postCode) ? address.postCode : null, [Validators.required, Step.validatePostCode]],
            'landmark': [(address && address.landmark) ? address.landmark : null, [Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]],
            'addressLine': [(address && address.addressLine) ? address.addressLine : null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]],
            'city': [(address && address.city) ? address.city : null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\#\-\,\/\.\(\)]*)+')]],
            'idCountry': [{ value: null, disabled: true }, [Validators.required]],
            'idState': [{ value: null, disabled: true }, [Validators.required]],
            'email': [address ? address.email : this.userSesssion['email'], [Step.validateEmail]],
            'phoneVerified': [(address && address.phoneVerified) ? address.phoneVerified : false]
        });
        if (this.phone.value) { this.verifyPhone(this.phone.value); }
        if (this.postCode.value) { this.isPostcodeValid = true; }
    }

    fetchStateList(countryId)
    {
        this._addressService.getStateList(countryId).subscribe((stateList: StateListModel[]) =>
        {
            this.stateList = stateList;
            this.updateAddressForm();
        })
    }

    // called only on valuechange on Postcode
    getCityByPostcode()
    {
        this.isVerifyingPostcode = true;
        this.isPostcodeValid = false;
        if (this.postCode.valid) {
            this.lastSearchedPostcode = this.postCode.value;
            this._addressService.getCityByPostcode(this.postCode.value).subscribe((cityList: any[]) =>
            {
                if (cityList && cityList.length) {
                    this.isPostcodeValid = true;
                    this.isVerifyingPostcode = false;
                    this.city.patchValue(cityList[0]['city']);
                    const ID_STATE = SharedCheckoutAddressUtil.getStateId(this.stateList, cityList[0]['state']);
                    this.idState.patchValue(ID_STATE);
                } else {
                    this.isPostcodeValid = false;
                    this.isVerifyingPostcode = false;
                }
            })
        }
    }

    updateAddressForm()
    {
        const COUNTRY_ID = SharedCheckoutAddressUtil.getCountry(this.countryList, null);
        this.idCountry.patchValue(COUNTRY_ID);
        const STATE_ID = (this.address) ? this.address['state']['idState']: SharedCheckoutAddressUtil.getState(this.stateList, null);
        this.idState.patchValue(STATE_ID);
    }

    saveOrUpdateAddress()
    {
        if (!this.canSubmit) return;
        if (this.phoneVerified.value) { this.saveAddress(this.addressForm.getRawValue()); return }
        const request = { device: 'mobile', email: '', phone: this.phone.value, type: 'p', source: "address", userId: this.userSesssion["userId"] };
        this._commonService.sendOtp(request).subscribe((response) =>
        {
            if (response['statusCode'] === 200) {
                this.displayOTPPopup(this.phone.value);
            } else {
                this._toastMessage.show({ type: 'error', text: response['message'] });
            }
        })
    }

    async displayOTPPopup(phone)
    {
        const phoneVerificationModule = await import('./../../../modules/shared-phone-verification/shared-phone-verification.module').then(m => m.SharedPhoneVerificationModule);
        const moduleFactory = await this._compiler.compileModuleAsync(phoneVerificationModule);
        const phoneVerificationModuleRef: NgModuleRef<SharedPhoneVerificationModule> = moduleFactory.create(this._injector);
        const componentFactory = phoneVerificationModuleRef.instance.resolveComponent();
        this.phoneVerificationInstance = this.phoneVerificationContainerRef.createComponent(componentFactory, null, phoneVerificationModuleRef.injector);
        this.phoneVerificationInstance.instance.displayPopup = true;
        this.phoneVerificationInstance.instance.phone = this.phone.value;
        (this.phoneVerificationInstance.instance["phoneValidation$"] as EventEmitter<boolean>).subscribe((validatedPhone) =>
        {
            this.phoneVerificationInstance.instance.displayPopup = false;
            this.phoneVerificationInstance = null;
            this.phoneVerificationContainerRef.remove();
            if (validatedPhone === phone) {
                this.phoneVerified.patchValue(true);
                this.verifiedPhones.push(phone);
                this._toastMessage.show({ type: 'success', text: "Phone number verified successfully." });
            }
        });
    }

    saveAddress(address)
    {
        const A_TYPE = (this.idAddress.value) ? this.globalConstants['updated'] : this.globalConstants['created'];
        this._addressService.postAddress(this.getRequestData(address)).subscribe((addressList: any[]) =>
        {
            if (addressList.length) {
                this._toastMessage.show({ type: "success", text: `${this.ADDRESS_TYPE} address saved successfully` });
                this.closeAddressPopUp$.emit({ aType: A_TYPE, action: this.modeType, addresses: addressList });
            }
        });
    }

    getRequestData(address)
    {
        let aRquest = { idCustomer: this.userSesssion['userId'], idAddressType: 1, active: true, invoiceType: this.invoiceType };
        let request = { ...address, ...aRquest };
        return request;
    }

    handlePopup($event) { this.closeAddressPopUp$.emit({ aType: null, action: null, addresses: null }); }
    get canSubmit() { return this.isPostcodeValid && !(this.isVerifyingPostcode) }
    get modeType() { return this.isAddMode ? "Add" : "Edit"; }
    displayFocus(control: string) { return this.addressForm.get(control).value ? true : false }
    verifyPhone(phone: string) { this.phoneVerified.patchValue(this.verifiedPhones.includes(phone)); }

    //getters
    get idAddress() { return this.addressForm.get('idAddress'); };
    get addressCustomerName() { return this.addressForm.get('addressCustomerName'); };
    get phone() { return this.addressForm.get('phone'); };
    get alternatePhone() { return this.addressForm.get('alternatePhone'); };
    get postCode() { return this.addressForm.get('postCode'); };
    get landmark() { return this.addressForm.get('landmark'); };
    get addressLine() { return this.addressForm.get('addressLine'); };
    get city() { return this.addressForm.get('city'); };
    get idCountry() { return this.addressForm.get('idCountry'); };
    get idState() { return this.addressForm.get('idState'); };
    get email() { return this.addressForm.get('email'); };
    get phoneVerified() { return this.addressForm.get('phoneVerified'); };

    ngOnDestroy(): void
    {
        this.postCodeSubscription.unsubscribe();
        this.phoneSubscription.unsubscribe();
    }
}
@NgModule({
    declarations: [CreateEditDeliveryAddressComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PopUpVariant2Module, NumberDirectiveModule],
    exports: [CreateEditDeliveryAddressComponent]
})
export class CreateEditDeliveryAddressModule { }

