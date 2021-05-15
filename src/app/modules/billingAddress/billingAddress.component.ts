import { Component, EventEmitter, Output, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { countryList } from './country';
import { stateList } from './state';
import { BillingAddressService } from './billingAddress.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { LocalStorageService } from 'ngx-webstorage';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import CONSTANTS from '../../config/constants';
import { Step } from '@utils/validators/step.validate';
import { GlobalLoaderService } from '@services/global-loader.service';

declare let $: any;

@Component({
    selector: 'billing-address',
    templateUrl: './billingAddress.html',
    styleUrls: ['./billingAddress.scss']
})

export class BillingAddressComponent implements OnInit, AfterViewInit, OnDestroy {

    // acou : Address Created Or Updated
    @Output() acou$: EventEmitter<{}> = new EventEmitter<{}>();
    @Input() isCheckoutButtonVisible: boolean = true;
    @Input() address = null;
    @Input() buttonText: string;
    @Input() addressType: number;
    @Input() isGstEnable: boolean = false;
    @Input() invoiceType: string = null;

    addressHeading: string;
    isShowInvoiceGst:boolean=false;
    nti:boolean = false;// nti= needs tax invoice
    globalConstants: {};
    addressForm: FormGroup;
    stateList: Array<{ 'idState': number, 'idCountry': number, 'name': string }>;
    countryList: Array<{ 'idCountry': number, 'name': string }>;
    user: { authenticated: string };
    cartSession: any;
    itemsList: Array<any> = [];
    isServer: boolean = typeof window !== 'undefined' ? false : true;
    isBusinessDetailExist:boolean;
    isPincodeBusy:boolean=false;
    lastSearchedPincode = null;
    isPinCodeApiValid: boolean
    //10766
    verifiedGSTINDetails = null;
    isGSTINVerified = false;
    addressLineKeys = ['bno', 'flno', 'bnm', 'st', 'loc'];
    gstinSubscriber: Subscription;

    set showLoader(status: boolean) {
        this._loaderService.setLoaderState(status)
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private _billingAddressService: BillingAddressService,
        private _cartService: CartService,
        private _localAuthService: LocalAuthService,
        private _addressService: BillingAddressService,
        private _commonService: CommonService,
        private _loaderService: GlobalLoaderService,
        private formBuilder: FormBuilder,
        private tms: ToastMessageService) {

        this.isBusinessDetailExist = false;
        this.globalConstants = CONSTANTS.GLOBAL;
        this.user = this._localAuthService.getUserSession();
        this.countryList = countryList['dataList'];
        this.stateList = stateList['dataList'];
    }

    checkQuantityCode(event) {
        return event.charCode >= 48 && event.charCode <= 57;
    }
    
    ngOnInit() {
        this.nti = this.invoiceType === 'retail' ? false : true;
        const data = {customerId: this.user['userId'], userType: this.user['userType']};
        this.addressForm = this.createBillingFormBuilder(this.address);
        if (this.address) {
            this.isPinCodeApiValid = true;
            this.isPincodeBusy = false;
            this.isGSTINVerified = this.address['gstinVerified']?true:false;
            this.addSubscribers();
            this.companyName.markAsDirty();
            this.addressLine.markAsDirty();
        } else {
            this.isPincodeBusy = false;
            this.isPinCodeApiValid = false;
            // valueChanges is subcribed two times once when valid is filled and second time on lost focus making two API calls
            // lastSearchedPincode is implemented to avoid similar API calls
            this._billingAddressService.getBusinessDetail(data).subscribe((res) =>
            {
                if (res['status'] && res['statusCode'] === 200) {
                    this.isBusinessDetailExist = true;
                    this.addressForm.controls.businessDetail['controls']['companyName'].setValue(res['data']['companyName']);
                    this.addressForm.controls.businessDetail['controls']['gstin'].setValue(res['data']['gstin']);
                    this.companyName.markAsDirty();
                    if (!this.address) {
                        this.addressForm.controls.businessDetail['controls']['email'].setValue(res['data']['email']);
                    }
                    this.addressForm.controls.businessDetail['controls']['phone'].setValue(res['data']['phone']);
                    this.addSubscribers();
                }
            });
        }
        this.cartSession = this._cartService.getCartSession();
        this.itemsList = (this.cartSession['itemsList']) ? this.cartSession['itemsList'] : [];
    }

    ngAfterViewInit() {
        this.addressForm.controls.billingAddress['controls']['postCode'].valueChanges.subscribe(
            data => {
                if (this.addressForm.controls.billingAddress['controls']['postCode'].valid && data && data.toString().length == 6 && data != this.lastSearchedPincode) {
                    this.getCityByPincode();
                }
            }
        );
        this.gstinSubscriber = this.addressForm.controls.businessDetail['controls']['gstin'].valueChanges.subscribe(
            (value) => 
            {
                    this.isGSTINVerified = false;
            }
        );

        

    }

    getCityByPincode() {
        this.isPincodeBusy = true;
        this.isPinCodeApiValid = false;
        if (this.addressForm.controls.billingAddress['controls']['postCode']) {
            this.lastSearchedPincode = this.addressForm.controls.billingAddress['controls']['postCode'].value;
            this._addressService.getCityByPinCode(this.addressForm.controls.billingAddress['controls']['postCode'].value).subscribe(res => {
                if (res['status']) {
                    this.isPinCodeApiValid = true;
                    this.isPincodeBusy=false;
                    this.addressForm.controls.billingAddress['controls']['city'].setValue(res['dataList'][0]['city']);
                    this.stateList.forEach(element => {
                        if (element.idState === parseInt(res['dataList'][0]['state'])) {
                            this.addressForm.controls.billingAddress['controls']['idState'].setValue(element.idState);
                        }
                    });
                }else{
                    this.isPinCodeApiValid = false;
                    this.isPincodeBusy=false;
                }
            });
        }

    }

    onSubmit(data, isValid) {
        if (!this.isPincodeBusy && this.isPinCodeApiValid ) {
            let bad = data['billingAddress'];
            bad['idCustomer'] = this.user['userId'];
            bad['idAddressType'] = 2;
            bad['active'] = true;
            bad['invoiceType'] = this.invoiceType;
            bad['isGstInvoice'] = 1; 

            bad['addressCustomerName'] = data['businessDetail']['companyName'];
            bad['gstin'] = data['businessDetail']['gstin'];
            bad['email'] = data['businessDetail']['email'];
            bad['phone'] = data['businessDetail']['phone'];

            let bdd = Object.assign({}, data['businessDetail'], {
                customerId: this.user['userId'],
                isGstInvoice: 1,
            }, {address: bad});

            //Address created
            let aType = this.globalConstants['created'];
            //Address updated
            if (data['billingAddress']['idAddress'] != undefined && data['billingAddress']['idAddress'] != null) {
                aType = this.globalConstants['updated'];
            }
            
            if(!this.isServer){
                let user = this._localStorageService.retrieve('user');
                let fjData = [this._addressService.postAddress(bad).pipe(map(res=>res))];
                if(!this.isBusinessDetailExist && (data['billingAddress']['idAddress'] == undefined || data['billingAddress']['idAddress'] == null)){
                    bdd['postCode'] = bdd['address']['postCode'];
                    fjData = [...fjData, this._billingAddressService.setBusinessDetail(bdd).pipe(map(res=>res))]; 
                }

                    forkJoin(fjData)
                    .subscribe((results)=>{
                        let response1 = results[0];
                        if (response1['status'] == false && response1['statusDescription'] != null) {
                            this.tms.show({ type: 'error', text: response1['statusDescription'] });
                        }else{
                            let successCount: number = 0;
                            for (let i = 0; i < results.length; i++) {
                                if (results[i]['status'] && results[i]['statusCode'] == 200) {
                                    successCount++;
                                }
                            }
                            if (results.length == successCount) {
                                if (!this.isBusinessDetailExist && (data['billingAddress']['idAddress'] == undefined || data['billingAddress']['idAddress'] == null)) {
                                    user['userType'] = 'business';
                                    this._localStorageService.store('user', user);
                                }
                                this.acou$.emit({ aType: aType, addressList: results[0]['addressList'] });
                            }
                        }
                    });
            }
        }

    }

    createBillingFormBuilder(address) {
        return this.formBuilder.group({
            businessDetail: this.formBuilder.group({
                companyName: [address && address.addressCustomerName ? address.addressCustomerName : null, [Validators.required]],
                gstin: [
                    (address && address.gstin) ? address.gstin : null,
                    [
                        Validators.required,
                        Validators.minLength(15)
                        //Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')
                    ]
                ],
                email: [(address && address.email) ? address.email : null, [Step.validateEmail]],
                phone: [(address && address.phone) ? address.phone : null, [Validators.required, Step.validatePhone]],
            }),
            billingAddress: this.formBuilder.group({
                'idAddress': (this.address && this.address['idAddress']) ? this.address['idAddress'] : null,
                'postCode': [
                    (address && address.postCode) ? address.postCode : null,
                    [Validators.required, Step.validatePostCode]
                ],
                'landmark': [(address && address.landmark) ? address.landmark : null],
                // 'addressLine': [(address && address.addressLine) ? address.addressLine : null, 
                //     [Validators.required,Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]
                // ],
                'addressLine': [(address && address.addressLine) ? address.addressLine : null,
                    [Validators.required, Validators.pattern(/^[a-zA-Z0-9._;, \/()-]*$/)]
                ],
                'city': [(address && address.city) ? address.city : null, [Validators.required,Validators.pattern('^([a-zA-Z0-9_]*[ \t\r\n\f]*[\-\,\/\.\(\)]*)+')]],            
                'idCountry': [this.getCountry(address, 'idCountry'), [Validators.required]],
                'idState': [this.getState(address, 'idState'), [Validators.required]],
            })
        });
    }

    getState(address, key) {
        if (address && address['state'] && address['state'][key] !== undefined) {
            return parseInt(address['state'][key]);
        } else {
            return this.stateList[0]['idState'];
        }
    }

    getCountry(address, key) {
        if (address && address['country'] && address['country'][key] !== undefined) {
            return parseInt(address['country'][key]);
        } else {
            return this.countryList[0]['idCountry'];
        }
    }

    onCountryChange($event) {
        if(!this.isServer){
            let countryId = $event.target.value;
            this._commonService.getStateList(countryId).subscribe((rd) => {
                if (rd["statusCode"] == 200) {
                    this.stateList = rd["dataList"];
                } else if (rd["statusCode"] == 500) {//Error in api

                }
            });
        }
    }
    
    //10766
    verifyGSTIN()
    {
        this._commonService.showLoader = true;
        this._billingAddressService.getGSTINDetails(this.gstin.value).subscribe(
            (response) =>
            {
                if (response['statusCode'] == 200 && response['taxpayerDetails'] != null) {
                    this.verifiedGSTINDetails = response['taxpayerDetails'];
                    this.isGSTINVerified = response['valid'];
                    this.postGSTINVerification();
                } else {
                    this.resetGSTINVarification(response['message']);
                }
                this._commonService.showLoader = false;
            },
            (error) => { this._commonService.showLoader = false; }
        );
    }

    postGSTINVerification()
    {
        let billingAddress = this.verifiedGSTINDetails['billing_address']['addr'];
        this.postCode.setValue(billingAddress['pncd']);
        this.companyName.markAsDirty();
        this.companyName.setValue(this.verifiedGSTINDetails['legal_name_of_business']);
        let temp = '';
        this.addressLineKeys.forEach((name) => { 
            let key = (billingAddress[name] as string).trim();
            if (key && key.length > 0) {
                temp = temp + key + ', ';
            }
        });
        this.addressLine.markAsDirty();
        this.addressLine.setValue(temp.substring(0, temp.lastIndexOf(',')));
        this.getCityByPincode();
    }

    resetGSTINVarification(message)
    {
        this.isGSTINVerified = false;
        this.verifiedGSTINDetails = {};
        this.showBEMsgs('error', message);
    }

    get canSave()
    {
        return this.isPinCodeApiValid == true && this.addressForm.valid && this.isGSTINVerified;
    }

    showBEMsgs(type, message)
    {
        this.tms.show({ type: type, text: message });
    }

    addSubscribers()
    {
        this.gstinSubscriber = this.gstin.valueChanges.subscribe((value: string) =>
        {
            this.isGSTINVerified = false;
        })
    }

    //getters
    get gstin() { return this.addressForm.get('businessDetail').get('gstin'); }
    get companyName() { return this.addressForm.get('businessDetail').get('companyName'); }
    get email() { return this.addressForm.get('businessDetail').get('email'); }
    get phone() { return this.addressForm.get('businessDetail').get('phone'); }
    get postCode() { return this.addressForm.get('billingAddress').get('postCode'); }
    get addressLine() { return this.addressForm.get('billingAddress').get('addressLine'); }
    get city() { return this.addressForm.get('billingAddress').get('city'); }
    get idState() { return this.addressForm.get('billingAddress').get('idState'); }

    ngOnDestroy()
    {
        if (this.gstinSubscriber) {
            this.gstinSubscriber.unsubscribe();
        }
    }
}
