import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtpPopupComponent } from '@app/components/otp-popup/otp-popup.component';
import CONSTANTS from '../../config/constants';
import { ModalService } from '../../modules/modal/modal.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { CommonService } from '../../utils/services/common.service';
import { Step } from '../../utils/validators/step.validate';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { countryList } from './country';
import { ShippingAddressService } from './shippingAddress.service';
import { stateList } from './state';

@Component({
    selector: 'shipping-address',
    templateUrl: './shippingAddress.html',
    styleUrls: ['./shippingAddress.scss']
})

export class ShippingAddressComponent implements OnInit, AfterViewInit
{

    // acou : Address Created Or Updated
    @Output() acou$: EventEmitter<{}> = new EventEmitter<{}>();
    @Input() isCheckoutButtonVisible: boolean;
    @Input() address = null;
    @Input() buttonText: string;
    @Input() addressType: number;
    @Input() isGstEnable: boolean;
    @Input() invoiceType: string;
    //To verify phone across list of validated phones.
    @Input("verifiedPhones") verifiedPhones: string[];
    addressHeading: string;
    isShowInvoiceGst: boolean;
    nti: boolean; // nti= needs tax invoice
    lastSearchedPincode = null;


    globalConstants: {};
    addressForm: FormGroup;
    stateList: Array<{ 'idState': number, 'idCountry': number, 'name': string }>;
    countryList: Array<{ 'idCountry': number, 'name': string }>;
    user: { authenticated: string };
    cartSession: any;
    itemsList: Array<any> = [];
    isServer: boolean = typeof window !== 'undefined' ? false : true;
    isPincodeBusy = false;
    specials = /[*|\":<>[\]{}`\\()';@&$]/;
    isPinCodeApiValid = false;

    constructor(
        private _cartService: CartService,
        private _localAuthService: LocalAuthService,
        private _addressService: ShippingAddressService,
        private _commonService: CommonService,
        private _formBuilder: FormBuilder,
        private _modalService: ModalService,
        private _tms: ToastMessageService,
    )
    {
        this.isCheckoutButtonVisible = true;
        this.nti = false;
        this.isShowInvoiceGst = false;
        this.isGstEnable = false;
        this.globalConstants = CONSTANTS.GLOBAL;
        this.user = this._localAuthService.getUserSession();
        this.countryList = countryList['dataList'];
        this.stateList = stateList['dataList'];
    }

    ngOnInit()
    {
        this.nti = (this.invoiceType === 'retail') ? false : true;
        if (this.address) {
            this.isPinCodeApiValid = true;
        }
        this.addressForm = this.createFormBuilder(this.address);
        this.cartSession = this._cartService.getCartSession();
        this.itemsList = (this.cartSession['itemsList'] !== undefined && this.cartSession['itemsList'] !== null) ? this.cartSession['itemsList'] : [];
    }

    ngAfterViewInit()
    {
        // valueChanges is subcribed two times once when valid is filled and second time on lost focus making two API calls
        // lastSearchedPincode is implemented to avoid similar API calls
        this.postCode.valueChanges.subscribe(
            data =>
            {
                if (this.postCode.valid && data && data.toString().length == 6 && data != this.lastSearchedPincode) {
                    this.getCityByPincode();
                }
            }
        );
    }

    // called only on valuechange on pincode
    getCityByPincode()
    {
        this.isPincodeBusy = true;
        this.isPinCodeApiValid = false;
        if (this.postCode.valid) {
            this.lastSearchedPincode = this.postCode.value;
            this._addressService.getCityByPinCode(this.postCode.value).subscribe(res =>
            {
                if (res['status']) {
                    this.isPinCodeApiValid = true;
                    this.isPincodeBusy = false;
                    this.city.setValue(res['dataList'][0]['city']);
                    this.stateList.forEach(element =>
                    {
                        if (element.idState == parseInt(res['dataList'][0]['state'])) {
                            this.idState.setValue(element.idState);
                        }
                    })
                } else {
                    this.isPinCodeApiValid = false;
                    this.isPincodeBusy = false;
                }
            })
        }
    }

    /**
     * @description:
     * verifies pincode availability.
     * verifies phone is verified or not & process for phone validation accordingly
     * save address accordingly after phone validation
     * @param:address form data to save
     */
    onSubmit(data)
    {
        if (!this.isPincodeBusy && this.isPinCodeApiValid) {
            const phone = this.phone.value;
            const isPhoneVerified = this.verifyPhone(phone, this.verifiedPhones);
            if (isPhoneVerified) {
                this.saveAddress(data);
            } else {
                const mobile = { device: 'mobile', email: '', phone: phone, type: 'p', source: 'phone_verify', userId: this.user["userId"] };
                this._commonService.sendOtp(mobile).subscribe((response) =>
                {
                    if (response['statusCode'] === 200) {
                        this.displayOTPPopup(this.phone.value);
                    } else {
                        this._tms.show({ type: 'error', text: response['message'] });
                    }
                })
            }
        }
    }

    /**
     * @description:to save address
     * @param address 
     */
    saveAddress(address)
    {
        address.idCustomer = this.user['userId'];
        address.idAddressType = 1;
        address.active = true;
        address['invoiceType'] = this.invoiceType;
        // Address created
        let aType = this.globalConstants['created'];
        // Address updated
        if (address['idAddress'] !== undefined && address['idAddress'] !== null) {
            aType = this.globalConstants['updated'];
        }
        if (this.nti) {
            address['isGstInvoice'] = true;
        }
        if (!this.isServer) {
            this._addressService.postAddress(address).subscribe((rd) =>
            {
                if (rd['statusCode'] === 200) {
                    this.acou$.emit({ aType: aType, addressList: rd['addressList'] });
                } else if (rd['statusCode'] === 500) {// Error in api

                }
            });
        }
    }

    createFormBuilder(address)
    {
        const sFileds = {
            'idAddress': address && address.idAddress ? address.idAddress : null,
            'addressCustomerName': [
                (address && address.addressCustomerName) ? address.addressCustomerName : this.user['userName'],
                [
                    Validators.required, Validators.pattern('[a-zA-Z ]*')
                ]
            ],
            'phone': [
                (address && address.phone) ? address.phone : this.user['phone'],
                [
                    Validators.required, Step.validatePhone
                ]
            ],
            'altPhone': [
                (address && address.altPhone) ? address.altPhone : this.user['altPhone'],
                [
                    Step.validatePhone
                ]
            ],
            'postCode': [
                (address && address.postCode) ? address.postCode : null,
                [
                    Validators.required, Step.validatePostCode
                ]
            ],
            'landmark': [(address && address.landmark) ? address.landmark : null,
            [
                Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')
            ]
            ],
            'addressLine': [(address && address.addressLine) ? address.addressLine : null,
            [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]
            ],
            'city': [(address && address.city) ? address.city : null, [Validators.required, Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\#\-\,\/\.\(\)]*)+')]],
            'idCountry': [this.getCountry(address, 'idCountry'), [Validators.required]],
            'idState': [this.getState(address, 'idState'), [Validators.required]],
            'email': [address ? address.email : this.user['email'], [Step.validateEmail]],
        };
        return this._formBuilder.group(sFileds);
    }

    getState(address, key)
    {
        if (address && address['state'] && address['state'][key]) {
            return parseInt(address['state'][key]);
        } else {
            return this.stateList[0]['idState'];
        }
    }

    getCountry(address, key)
    {
        if (address && address['country'] && address['country'][key]) {
            return parseInt(address['country'][key]);
        } else {
            return this.countryList[0]['idCountry'];
        }
    }

    onCountryChange($event)
    {
        if (!this.isServer) {
            let countryId = $event.target.value;
            this._commonService.getStateList(countryId).subscribe((rd) =>
            {
                if (rd['statusCode'] == 200) {
                    this.stateList = rd['dataList'];
                } 
            });
        }
    }


    displayOTPPopup(phone)
    {
        let modalData = { component: OtpPopupComponent, inputs: { data: { phone: phone } }, outputs: {} };
        this._modalService.show_v1(modalData).subscribe((cInstance) =>
        {
            cInstance.instance['phone'] = this.phone.value;
            (cInstance.instance['phoneValidation$'] as EventEmitter<any>).subscribe((validated: boolean) =>
            {
                if (validated) {
                    this.saveAddress(this.addressForm.value);
                }
            });
        })
    }

    checkNumeric(event) { return event.charCode >= 48 && event.charCode <= 57; }
    verifyPhone(phone: string, verifiedPhones: string[]) { return verifiedPhones.includes(phone); }
    //getters for form control
    get idAddress() { return this.addressForm.get('idAddress'); };
    get addressCustomerName() { return this.addressForm.get('addressCustomerName'); };
    get phone() { return this.addressForm.get('phone'); };
    get altPhone() { return this.addressForm.get('altPhone'); };
    get postCode() { return this.addressForm.get('postCode'); };
    get landmark() { return this.addressForm.get('landmark'); };
    get addressLine() { return this.addressForm.get('addressLine'); };
    get city() { return this.addressForm.get('city'); };
    get idCountry() { return this.addressForm.get('idCountry'); };
    get idState() { return this.addressForm.get('idState'); };
    get email() { return this.addressForm.get('email'); };
}
