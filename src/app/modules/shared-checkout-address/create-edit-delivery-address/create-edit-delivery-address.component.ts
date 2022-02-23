import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    @Input("address") address = null;
    @Input("verifiedPhones") verifiedPhones: string[];
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<any> = new EventEmitter<any>();

    addressForm: FormGroup = null;
    userSesssion = null;
    lastSearchedPincode = null;

    countryList = [];
    stateList = [];

    isVerifyingPincode = false;
    isPincodeValid = false;

    phoneSubscription: Subscription = null;
    postCodeSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService,
        private _commonService: CommonService, private _modalService: ModalService, private _toastMessage: ToastMessageService,)
    {
        this.userSesssion = this._localAuthService.getUserSession();
    }

    ngOnInit() 
    {
        this.createAddressForm();
        this._addressService.getCountryList().subscribe((countryList: CountryListModel[]) =>
        {
            this.countryList = countryList;
            this.fetchStateList(this.countryList[0]['idCountry']);
        })
    }

    ngAfterViewInit()
    {

        // valueChanges is subcribed two times once when valid is filled and second time on lost focus making two API calls
        // lastSearchedPincode is implemented to avoid similar API calls
        this.postCodeSubscription = this.postCode.valueChanges.subscribe(
            data =>
            {
                if (this.postCode.valid && data && data.toString().length == 6 && data != this.lastSearchedPincode) {
                    this.getCityByPincode();
                }
            }
        );
        this.phoneSubscription = this.phone.valueChanges.subscribe(
            (phone: string) =>
            {
                const isPhoneVerfied = ((phone.length === 10) && (this.verifyPhone(phone, this.verifiedPhones)));
                this.phoneVerified.setValue(isPhoneVerfied);
            }
        );
    }

    fetchStateList(countryId)
    {
        this._addressService.getStateList(countryId).subscribe((stateList: StateListModel[]) =>
        {
            this.stateList = stateList;
            this.updateAddressForm();
        })
    }

    // called only on valuechange on pincode
    getCityByPincode()
    {
        this.isVerifyingPincode = true;
        this.isPincodeValid = false;
        if (this.postCode.valid) {
            this.lastSearchedPincode = this.postCode.value;
            this._addressService.getCityByPinCode(this.postCode.value).subscribe(res =>
            {
                if (res['status']) {
                    this.isPincodeValid = true;
                    this.isVerifyingPincode = false;
                    this.city.setValue(res['dataList'][0]['city']);
                    this.stateList.forEach(element =>
                    {
                        if (element.idState == parseInt(res['dataList'][0]['state'])) {
                            this.idState.setValue(element.idState);
                        }
                    })
                } else {
                    this.isPincodeValid = false;
                    this.isVerifyingPincode = false;
                }
            })
        }
    }

    createAddressForm()
    {
        this.addressForm = new FormGroup({
            idAddress: new FormControl(null),
            addressCustomerName: new FormControl(this.userSesssion['userName'], [Validators.required, Validators.pattern('[a-zA-Z ]*')]),
            phone: new FormControl(this.userSesssion['phone'], [Validators.required, Step.validatePhone]),
            alternatePhone: new FormControl(this.userSesssion['alternatePhone'], [Validators.pattern("[0-9]{10}")]),
            postCode: new FormControl(null, [Validators.required, Step.validatePostCode]),
            landmark: new FormControl(null, [Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]),
            addressLine: new FormControl(null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]),
            city: new FormControl(null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\#\-\,\/\.\(\)]*)+')]),
            idCountry: new FormControl(null, [Validators.required]),
            idState: new FormControl(null, [Validators.required]),
            email: new FormControl(this.userSesssion['email'], [Step.validateEmail]),
            phoneVerified: new FormControl(this.verifyPhone(this.userSesssion['phone'], this.verifiedPhones))
        });
    }

    updateAddressForm()
    {
        const COUNTRY_ID = this._addressService.getCountry(this.countryList, null);
        const STATE_ID = this._addressService.getState(this.stateList, null);
        this.idCountry.patchValue(COUNTRY_ID);
        this.idState.patchValue(STATE_ID);
        if (this.address) {
            const ADDRESS = this._addressService.getCreateEditDeliveryAddressType(this.address, this.countryList, this.stateList);
            Object.keys(ADDRESS).forEach((key) => { this.addressForm.get(key).patchValue(ADDRESS[key]) });
        }
    }
    
    saveOrUpdateAddress(address)
    {
        if (this.disableAction) return;
        if (this.phoneVerified.value) { this.saveAddress(address); return }
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
                    this.phoneVerified.setValue(true);
                    this.verifiedPhones.push(phone);
                    this._toastMessage.show({ type: 'success', text: "Phone number verified successfully." });
                }
            });
        })
    }

    saveAddress(address)
    {
        const aType = (address && address['idAddress']) ? this.globalConstants['updated'] : this.globalConstants['created'];
        this._addressService.postAddress(this.getRequestData(address)).subscribe((addressList:any[]) =>
        {
            if (addressList.length) {
                this.closeAddressPopUp$.emit({ aType: aType, action: this.modeType, addresses: addressList });
            }
        });
    }

    getRequestData(address)
    {
        let aRquest = { idCustomer: this.userSesssion['userId'], idAddressType: 1, active: true, invoiceType:"retail" };
        let request = { ...address, ...aRquest};
        return request;
    }

    handlePopup($event) { this.closeAddressPopUp$.emit({ action: null, address: null }); }
    get modeType() { return this.isAddMode ? "Add" : "Edit"; }
    get disableAction() { return this.addressForm.invalid || !(this.isPincodeValid) }
    verifyPhone(phone: string, verifiedPhones: string[]) { return verifiedPhones.includes(phone); }

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

