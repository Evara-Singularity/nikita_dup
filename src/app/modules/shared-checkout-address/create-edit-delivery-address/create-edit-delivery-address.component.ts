import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OtpPopupComponent } from '@app/components/otp-popup/otp-popup.component';
import { ModalService } from '@app/modules/modal/modal.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { CountryListModel, StateListModel } from '@app/utils/models/shared-checkout.models';
import { AddressService } from '@app/utils/services/address.service';
import { CommonService } from '@app/utils/services/common.service';
import { Step } from '@app/utils/validators/step.validate';
import { LocalAuthService } from '@services/auth.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from './../../../config/constants';
import { PopUpVariant2Module } from './../../pop-up-variant2/pop-up-variant2.module';

@Component({
    selector: 'create-edit-delivery-address',
    templateUrl: './create-edit-delivery-address.component.html',
    styleUrls: ['../common-checkout.scss']
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
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<any> = new EventEmitter<any>();

    addressForm: FormGroup = null;
    userSesssion = null;
    lastSearchedPostcode = null;

    countryList = [];
    stateList = [];

    isVerifyingPostcode = false;
    isPostcodeValid = false;
    isSubmitted = false;

    phoneSubscription: Subscription = null;
    postCodeSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService, private _formBuilder: FormBuilder,
        private _commonService: CommonService, private _modalService: ModalService, private _toastMessage: ToastMessageService,)
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
            (phone: string) =>
            {
                if (phone.length === 10) { this.verifyPhone(phone); }
            }
        );
    }

    createAddressForm(address)
    {
        this.addressForm = this._formBuilder.group({
            'idAddress': address && address.idAddress ? address.idAddress : null,
            'addressCustomerName': [(address && address.addressCustomerName) ? address.addressCustomerName : this.userSesssion['userName'], [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
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
        if (this.postCode.value) { this.isPostcodeValid = true;}
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
            this._addressService.getCityByPostcode(this.postCode.value).subscribe((dataList: any[]) =>
            {
                if (dataList && dataList.length) {
                    this.isPostcodeValid = true;
                    this.isVerifyingPostcode = false;
                    this.city.patchValue(dataList[0]['city']);
                    this.stateList.forEach(element =>
                    {
                        if (element.idState == parseInt(dataList[0]['state'])) {
                            this.idState.patchValue(element.idState);
                        }
                    })
                } else {
                    this.isPostcodeValid = false;
                    this.isVerifyingPostcode = false;
                }
            })
        }
    }

    updateAddressForm()
    {
        const COUNTRY_ID = this._addressService.getCountry(this.countryList, null);
        const STATE_ID = this._addressService.getState(this.stateList, null);
        this.idCountry.patchValue(COUNTRY_ID);
        this.idState.patchValue(STATE_ID);
    }

    saveOrUpdateAddress()
    {
        this.isSubmitted = true;
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

    displayOTPPopup(phone)
    {
        let modalData = { component: OtpPopupComponent, inputs: { phone: phone, source: 'address' }, outputs: {} };
        this._modalService.show_v1(modalData).subscribe((cInstance) =>
        {
            cInstance.instance['phone'] = this.phone.value;
            (cInstance.instance['phoneValidation$'] as EventEmitter<any>).subscribe((validatedPhone) =>
            {
                if (validatedPhone === phone) {
                    this.phoneVerified.patchValue(true);
                    this.verifiedPhones.push(phone);
                    this._toastMessage.show({ type: 'success', text: "Phone number verified successfully." });
                }
            });
        })
    }

    saveAddress(address)
    {
        const A_TYPE = (this.idAddress.value) ? this.globalConstants['updated'] : this.globalConstants['created'];
        this._addressService.postAddress(this.getRequestData(address)).subscribe((addressList: any[]) =>
        {
            if (addressList.length) {
                this._toastMessage.show({ type: "success", text: `${this.ADDRESS_TYPE} saved successfully`})
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
    get canSubmit() { return this.addressForm.valid && this.isPostcodeValid && !(this.isVerifyingPostcode) }
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

