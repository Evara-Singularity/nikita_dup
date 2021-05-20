import { Component, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { countryList } from "./country";
import { stateList } from "./state";
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ShippingBillingAddressService } from './shippingBillingAddress.service';
import { LocalStorageService } from 'ngx-webstorage';
import { map } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import { Step } from '../../utils/validators/step.validate';

declare let $: any;


@Component({
    selector: 'shipping-billing-address',
    templateUrl: './shippingBillingAddress.html',
    styleUrls: ['./shippingBillingAddress.scss']
})

export class ShippingBillingAddressComponent {

    //acou : Address Created Or Updated
    @Output() acou$: EventEmitter<{}> = new EventEmitter<{}>();
    @Input() isCheckoutButtonVisible: boolean = true;
    @Input() address = {};
    @Input() buttonText: string;
    @Input() addressType: number;
    @Input() isGstEnable: boolean = false;
    @Input() invoiceType: string;
    addressHeading: string;
    isShowInvoiceGst:boolean=false;
    nti:boolean = false;//nti= needs tax invoice


    globalConstants: {};
    addressForm: FormGroup;
    stateList: Array<{ "idState": number, "idCountry": number, "name": string }>;
    countryList: Array<{ "idCountry": number, "name": string }>;
    user: { authenticated: string };
    cartSession: any;
    itemsList: Array<any> = [];
    isServer: boolean = typeof window !== "undefined" ? false : true;
    isBusinessDetailExist: boolean;

    constructor(
        private _localStorageService: LocalStorageService,
        private _cartService: CartService,
        private _localAuthService: LocalAuthService,
        private _addressService: ShippingBillingAddressService,
        private _shippingBillingAddressService: ShippingBillingAddressService,
        private _commonService: CommonService,
        private formBuilder: FormBuilder) {
        this.isBusinessDetailExist = false;
        //console.log("constructor", this.address);
        this.globalConstants = CONSTANTS.GLOBAL;
        this.user = this._localAuthService.getUserSession();

        this.countryList = countryList["dataList"];
        this.stateList = stateList["dataList"];

        let data = { customerId: this.user['userId'], userType: this.user['userType'] };
        let address: { shippingAddress: {}, billingAddress: {}, businessDetail: {} } = { shippingAddress: {}, billingAddress: {}, businessDetail: {} };
        this.addressForm = this.createFormBuilder(address);

        this._shippingBillingAddressService.getBusinessDetail(data).subscribe((res) => {
            if (res['status'] && res['statusCode'] == 200) {
                this.isBusinessDetailExist = true;
                this.addressForm.controls.businessDetail["controls"]['companyName'].setValue(res['data']['companyName']);
                this.addressForm.controls.businessDetail["controls"]['gstin'].setValue(res['data']['gstin']);
                this.addressForm.controls.businessDetail["controls"]['email'].setValue(res['data']['email']);
                this.addressForm.controls.businessDetail["controls"]['phone'].setValue(res['data']['phone']);
            }
        });

    }

    ngOnChanges(changes: SimpleChanges) {     
    }

    checkQuantityCode(event) {
        return event.charCode >= 48 && event.charCode <= 57;
    }
    ngOnInit() {
        // alert(this.invoiceType);
        this.cartSession = this._cartService.getCartSession();
        //this._cartService.orderSummary.next(cartSession);
        // this.cart = this.cartSession["cart"];
        this.itemsList = (this.cartSession["itemsList"] != undefined && this.cartSession["itemsList"] != null) ? this.cartSession["itemsList"] : [];
        //console.log("ngOnInit Called");
    }

    ngAfterViewInit() {

        this.addressForm.controls.shippingAddress["controls"]['postCode'].valueChanges.subscribe(
            data=>
            {
                if(data.length == 6)
                    this.getCityByPincode('shipping');
            }
        )

        this.addressForm.controls.billingAddress["controls"]['postCode'].valueChanges.subscribe(
            data=>
            {
                if(data.length == 6)
                    this.getCityByPincode('billing');
            }
        )
        //console.log("ngAfterViewInit Called")
    }
    
    isPincodeBusy:boolean=false;

    
    getCityByPincode(type) {
        
        this.isPincodeBusy=true;
        this.isPinCodeAvailble = true;

        let isPincodeValid = false;
        if(type == 'shipping'){
            isPincodeValid = this.addressForm.controls.shippingAddress["controls"]['postCode'].valid;
        }else if(type == 'billing'){
            isPincodeValid = this.addressForm.controls.billingAddress["controls"]['postCode'].valid;
        }

        if (isPincodeValid) {
        
            let pCode = (type == 'shipping' ? this.addressForm.controls.shippingAddress["controls"]['postCode'].value : this.addressForm.controls.billingAddress["controls"]['postCode'].value);
            this._addressService.getCityByPinCode(pCode).subscribe(res => {
                 this.isPincodeBusy=false;
                if (res['status']) {

                    if(type=='shipping'){
                        this.addressForm.controls.shippingAddress["controls"]['city'].setValue(res['dataList'][0]['city']);

                        this.stateList.forEach(element => {
                            if (element.idState == parseInt(res['dataList'][0]['state'])) {
                                this.addressForm.controls.shippingAddress["controls"]['idState'].setValue(element.idState);
                            }
                        })
                    }else if(type=='billing'){
                        this.addressForm.controls.billingAddress["controls"]['city'].setValue(res['dataList'][0]['city']);

                        this.stateList.forEach(element => {
                            if (element.idState == parseInt(res['dataList'][0]['state'])) {
                                this.addressForm.controls.billingAddress["controls"]['idState'].setValue(element.idState);
                            }
                        })
                    }
                    
                }
            })
        }

    }

    changeState(event) {
        if (this.addressForm.controls['postCode'].valid)
            this.checkPinCode();
        //  alert(this.isPinCodeAvailble);
    }


    isPinCodeAvailble: boolean = true;

    checkPinCode() {
        this._addressService.getCityByPinCode(this.addressForm.controls['postCode'].value).subscribe(res => {
            if (res['status']) {
                //this.addressForm.controls['city'].setValue(res.data.city);
                let isFound: boolean = false;

                this.stateList.forEach(element => {
                    res['dataList'].forEach(element => {
                        if (parseInt(element.state) == this.addressForm.controls['idState'].value) {
                            isFound = true;
                        }
                    });

                })
                if (isFound) {
                    this.isPinCodeAvailble = true;
                    //  return true;
                }
                else {
                    this.isPinCodeAvailble = false;
                    //  return false;
                }
            }
            else {
                this.isPinCodeAvailble = true;
                // return true;   
            }
        })
    }

    onSubmit(data, isValid) {
        // alert('ok');
        //  console.log("On Submit", data);
         if (this.isPinCodeAvailble) {
            //  sad: Shipping Address Data
             let sad = data['shippingAddress'];
             let bad = data['billingAddress'];
            //  let bdd = data['businessDetail'];
             
             sad['idCustomer'] = this.user["userId"];
             sad['idAddressType'] = 1;
             sad['active'] = true;
             sad['invoiceType'] = this.invoiceType;
             sad['isGstInvoice'] = 1;             

             bad['idCustomer'] = this.user["userId"];
             bad['idAddressType'] = 2;
             bad['active'] = true;
             bad['invoiceType'] = this.invoiceType;
             bad['isGstInvoice'] = 1;                                 

            bad['addressCustomerName'] = data['businessDetail']['companyName'];
            bad['gstin'] = data['businessDetail']['gstin'];
            bad['email'] = data['businessDetail']['email'];
            bad['phone'] = data['businessDetail']['phone'];


            let bdd = Object.assign({}, data['businessDetail'], {
                customerId: this.user["userId"],
                isGstInvoice: 1,
                // businessType: null,
                // industry: null
            }, {address: bad});
            // console.log(bdd);
            // return;
             //Address created
            let aType = this.globalConstants["created"];
            //Address updated
            // if (data["idAddress"] != undefined && data["idAddress"] != null) {
                // aType = this.globalConstants["updated"];
            // }

            if(!this.isServer){
                // (<HTMLElement>document.querySelector('#page-loader')).style.display = "block"; 
                // $("#page-loader").show();
                let user = this._localStorageService.retrieve('user');
                // , this._shippingBillingAddressService.setBusinessDetail(bdd)
                let fjData = [this._addressService.postAddress(sad).pipe(map(res=>res)), this._addressService.postAddress(bad).pipe(map(res=>res))];
                if(!this.isBusinessDetailExist)
                    fjData = [...fjData, this._shippingBillingAddressService.setBusinessDetail(bdd).pipe(map(res=>res))]; 
                forkJoin(fjData)
                .subscribe((results)=>{
                    // console.log(results);
                    let successCount:number = 0;
                    for(let i=0; i<results.length; i++){
                        if(results[i]['status'] && results[i]['statusCode'] == 200){
                            successCount++;
                        } 
                    }
                    // console.log(results.length, successCount);
                    if(results.length == successCount){
                        user['userType'] = 'business';
                        this._localStorageService.store('user', user);
                        // Merging objects returned by two arrays(shipping, billing).
                        // let addressList = [];
                        let addressList = [];
                        // console.log(sa, sAddress);
                        for(let i = 0; i<results[0]["addressList"].length; i++){
                            for(let j = 0; j<results[1]["addressList"].length; i++){
                                if(results[0]["addressList"][i]['idAddress']==results[1]["addressList"][j]['idAddress']){
                                    results[1]["addressList"].splice(j,1);
                                    break;
                                }
                            }
                        }
                        addressList = [...results[0]["addressList"], ...results[1]["addressList"]];
                        this.acou$.emit({ aType: aType, addressList: addressList });
                    }
                })
                /* this._addressService.postAddress(data).subscribe((rd) => {
                    if (rd["statusCode"] == 200) {                        
                        this.acou$.emit({ aType: aType, addressList: rd["addressList"] });
                    } else if (rd["statusCode"] == 500) {//Error in api

                    }
                    (<HTMLElement>document.querySelector("#page-loader")).style.display = "none";//.hide();
                }); */
            }

         }
        /* if (this.isPinCodeAvailble) {
            data.idCustomer = this.user["userId"];
            data.idAddressType = 1;
            data.active = true;


            //Address created
            let aType = this.globalConstants["created"];
            //Address updated
            if (data["idAddress"] != undefined && data["idAddress"] != null) {
                aType = this.globalConstants["updated"];
            }
            if(!this.isServer){
                $("#page-loader").show();
                this._addressService.postAddress(data).subscribe((rd) => {
                    if (rd["statusCode"] == 200) {                        
                        this.acou$.emit({ aType: aType, addressList: rd["addressList"] });
                    } else if (rd["statusCode"] == 500) {//Error in api

                    }
                    $("#page-loader").hide();
                });
            }
        } */

    }



    createFormBuilder(address) {

        return this.formBuilder.group({
            shippingAddress: this.formBuilder.group({
                'idAddress': address['idAddress'],
                'addressCustomerName': [null, [Validators.required, Validators.pattern("[a-zA-Z ]*")]],
                'phone': [null, [Validators.required, Step.validatePhone]],
                'postCode': [null, [Validators.required, Step.validatePostCode]],
                'landmark': [null, []],
                'addressLine': [null, [Validators.required]],
                'city': [null, [Validators.required]],
                'idCountry': [this.getCountry(this.address, "idCountry"), [Validators.required]],
                'idState': [this.getState(this.address, "idState"), [Validators.required]],
                'email': ['', [Validators.required, Step.validateEmail]],
                'gstin': [null, [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
                // 'isGstInvoice':[this.address['isGstInvoice']==null?false:this.address['isGstInvoice'],[]]
            }),
            businessDetail: this.formBuilder.group({
                companyName: [address.businessDetail.companyName ? address.businessDetail.companyName : null, [Validators.required]],
                gstin: [address.businessDetail.gstin ? address.businessDetail.gstin : null, [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
                // isGstInvoice: [null, [Validators.required]],
                // industry: [null],
                // businessType: [null],
                email: [address.businessDetail.email ? address.businessDetail.email : null, [Validators.required, Step.validateEmail]],
                phone: [address.businessDetail.phone ? address.businessDetail.phone : null, [Validators.required, Step.validatePhone]],
                // pan:[null],
            }),
            billingAddress: this.formBuilder.group({
                'idAddress': this.address['idAddress'],
                // 'addressCustomerName': [(this.address['addressCustomerName'] != undefined && this.address['addressCustomerName'] != null) ? this.address['addressCustomerName'] : this.user["userName"], [Validators.required, Validators.pattern("[a-zA-Z ]*")]],
                // 'phone': [(this.address['phone'] != undefined && this.address['phone'] != null) ? this.address['phone'] : this.user["phone"], [Validators.required, Step.validatePhone]],
                'postCode': [null, [Validators.required, Step.validatePostCode]],
                'landmark': [null, []],
                'addressLine': [null, [Validators.required]],
                'city': [null, [Validators.required]],
                'idCountry': [this.getCountry(this.address, "idCountry"), [Validators.required]],
                'idState': [this.getState(this.address, "idState"), [Validators.required]],
                // 'email': [(this.address['email'] != undefined && this.address['email'] != null) ? this.address['email'] : this.user["email"], [Validators.required, Step.validateEmail]],
                // 'gstin': [this.address['gstin'], [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
                // 'isGstInvoice':[this.address['isGstInvoice']==null?false:this.address['isGstInvoice'],[]]
            })                        
        });
    }

    /* createBillingFormBuilder(address) {
        return this.formBuilder.group({
            'idAddress': address.idAddress,
            'addressCustomerName': [(address.addressCustomerName != undefined && address.addressCustomerName != null) ? address.addressCustomerName : this.user["userName"], [Validators.required, Validators.pattern("[a-zA-Z ]*")]],
            'phone': [(address.phone != undefined && address.phone != null) ? address.phone : this.user["phone"], [Validators.required, Step.validatePhone]],
            'postCode': [address.postCode, [Validators.required, Step.validatePostCode]],
            'landmark': [address.landmark],
            'addressLine': [address.addressLine, [Validators.required]],
            'city': [address.city, [Validators.required]],
            'idCountry': [this.getCountry(address, "idCountry"), [Validators.required]],
            'idState': [this.getState(address, "idState"), [Validators.required]],
            'email': [(address.email != undefined && address.email != null) ? address.email : this.user["email"], [Validators.required, Step.validateEmail]],
            'gstin': [address.gstin, [Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]],
            'isGstInvoice':[address.isGstInvoice==null?true:address.isGstInvoice,[]]
        });
    } */

    getState(address, key) {
        if (address["state"] != undefined && address["state"][key] != undefined) {
            //console.log(parseInt(address["state"][key]));
            return parseInt(address["state"][key]);
        } else
            // //console.log("stateList", this.stateList[0]);
            return this.stateList[0]["idState"];
        // return null;
    }

    getCountry(address, key) {
        if (address["country"] != undefined && address["country"][key] != undefined) {
            return parseInt(address["country"][key]);
        } else {
            // //console.log("countryList", this.countryList[0]);
            // return null;
            return this.countryList[0]["idCountry"];
        }
    }

    onCountryChange($event) {
        //console.log($event.target.value);
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

    setBillingSameAsShipping(event){
        // console.log(event.target.checked);
        // console.log(this.addressForm.controls.shippingAddress["controls"]);
        let koa = ['postCode', 'landmark', 'addressLine', 'city', 'idCountry', 'idState'];
        if(event.target.checked){
            Object.keys(this.addressForm.controls.shippingAddress["controls"]).forEach((key, index)=>{
                // console.log(key, index);
                if(koa.indexOf(key) != -1)
                    this.addressForm.controls.billingAddress["controls"][key].setValue(this.addressForm.controls.shippingAddress["controls"][key].value);
            });
        }else{
            Object.keys(this.addressForm.controls.billingAddress["controls"]).forEach((key, index)=>{
                // console.log(key, index);
                if(koa.indexOf(key) != -1)
                    this.addressForm.controls.billingAddress["controls"][key].setValue(null);
            });
        }
        
    }
}
