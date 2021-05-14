import { Component, EventEmitter, Output, Input, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '../../config/constants';
import { countryList } from './country';
import { ShippingAddressService } from './shippingAddress.service';
import { stateList } from './state';
import { Step } from '../../utils/validators/step.validate';


@Component({
    selector: 'shipping-address',
    templateUrl: './shippingAddress.html',
    styleUrls: ['./shippingAddress.scss']
})

export class ShippingAddressComponent implements OnInit, AfterViewInit {

    // acou : Address Created Or Updated
    @Output() acou$: EventEmitter<{}> = new EventEmitter<{}>();
    @Input() isCheckoutButtonVisible: boolean;
    @Input() address = null;
    @Input() buttonText: string;
    @Input() addressType: number;
    @Input() isGstEnable: boolean;
    @Input() invoiceType: string;
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
    isPincodeBusy: boolean;
    specials=/[*|\":<>[\]{}`\\()';@&$]/;
    isPinCodeApiValid: boolean;

    constructor(
        private _cartService: CartService,
        private _localAuthService: LocalAuthService,
        private _addressService: ShippingAddressService,
        private _commonService: CommonService,
        private formBuilder: FormBuilder) {

        this.isCheckoutButtonVisible = true;
        this.nti = false;
        this.isShowInvoiceGst = false;
        this.isGstEnable = false;
        this.globalConstants = CONSTANTS.GLOBAL;
        this.user = this._localAuthService.getUserSession();
        this.countryList = countryList['dataList'];
        this.stateList = stateList['dataList'];
    }
    
    ngOnInit() {
        this.nti = this.invoiceType === 'retail' ? false : true;
        if(this.address){
            this.isPinCodeApiValid = true;
            this.isPincodeBusy = false;
        }else{
            this.isPincodeBusy = false;
            this.isPinCodeApiValid = false;
        }
        this.addressForm = this.createFormBuilder(this.address);
        this.cartSession = this._cartService.getCartSession();
        this.itemsList = (this.cartSession['itemsList'] !== undefined && this.cartSession['itemsList'] !== null) ? this.cartSession['itemsList'] : [];
    }

    ngAfterViewInit() {
        // valueChanges is subcribed two times once when valid is filled and second time on lost focus making two API calls
        // lastSearchedPincode is implemented to avoid similar API calls
        this.addressForm.controls['postCode'].valueChanges.subscribe(
            data => {
                if (this.addressForm.controls['postCode'].valid && data && data.toString().length == 6 && data != this.lastSearchedPincode) {
                    this.getCityByPincode();
                }
            }
        );
    }

    // called only on valuechange on pincode
    getCityByPincode() {
        this.isPincodeBusy = true;
        this.isPinCodeApiValid = false;
        if (this.addressForm.controls['postCode'].valid) {
            this.lastSearchedPincode = this.addressForm.controls['postCode'].value;
            this._addressService.getCityByPinCode(this.addressForm.controls['postCode'].value).subscribe(res => {
                if (res['status']) {
                    this.isPinCodeApiValid = true;
                    this.isPincodeBusy=false;
                    this.addressForm.controls['city'].setValue(res['dataList'][0]['city']);
                    this.stateList.forEach(element => {
                        if (element.idState == parseInt(res['dataList'][0]['state'])) {
                            this.addressForm.controls['idState'].setValue(element.idState);
                        }
                    })
                }else {
                    this.isPinCodeApiValid = false;
                    this.isPincodeBusy=false;
                }
            })
        }
    }

    onSubmit(data, isValid) {

        if (!this.isPincodeBusy && this.isPinCodeApiValid ) {

            console.log('onSubmit isPincodeBusy', 'calling API add address');

            data.idCustomer = this.user['userId'];
            data.idAddressType = 1;
            data.active = true;

            // Address created
            let aType = this.globalConstants['created'];
            // Address updated
            if (data['idAddress'] !== undefined && data['idAddress'] !== null) {
                aType = this.globalConstants['updated'];
            }

            data['invoiceType'] = this.invoiceType;
            if (this.nti) {
                data['isGstInvoice'] = true;
            }

            if (!this.isServer) {
                this._addressService.postAddress(data).subscribe((rd) => {
                    if (rd['statusCode'] === 200) {
                        this.acou$.emit({ aType: aType, addressList: rd['addressList'] });
                    } else if (rd['statusCode'] === 500) {// Error in api

                    }
                });
            }
        }
    }

    createFormBuilder(address) {

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
                [Validators.required,Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]
            ],
            'city': [(address && address.city) ? address.city : null, [Validators.required,Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\#\-\,\/\.\(\)]*)+')]],
            'idCountry': [this.getCountry(address, 'idCountry'), [Validators.required]],
            'idState': [this.getState(address, 'idState'), [Validators.required]],
            'email': [address ? address.email : this.user['email'], [Step.validateEmail]],
            // 'isGstInvoice':[address.isGstInvoice==null?false:address.isGstInvoice,[]]
        };
        return this.formBuilder.group(sFileds);
    }

    getState(address, key) {
        if (address && address['state'] && address['state'][key]) {
            return parseInt(address['state'][key]);
        } else {
            return this.stateList[0]['idState'];
        }
    }

    getCountry(address, key) {
        if (address && address['country'] && address['country'][key]) {
            return parseInt(address['country'][key]);
        } else {
            return this.countryList[0]['idCountry'];
        }
    }

    onCountryChange($event) {
        if(!this.isServer){
            let countryId = $event.target.value;
            this._commonService.getStateList(countryId).subscribe((rd) => {
                if (rd['statusCode'] == 200) {
                    this.stateList = rd['dataList'];
                } else if (
                    rd['statusCode'] == 500) {
                }
            });
        }
    }

    checkQuantityCode(event) {
        return event.charCode >= 48 && event.charCode <= 57;
    }
}
