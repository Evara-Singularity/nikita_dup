import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DATA_NB } from "./netBanking";
import { DATA_NB_RAZ } from "./netBankingRazor";

import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../config/constants';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CommonService } from '../../utils/services/common.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';

declare var dataLayer;

// import * as $ from "jquery";

@Component({
    selector: 'net-banking',
    templateUrl: './netBanking.html',
    styleUrls:['./netBanking.scss']
})

export class NetBankingComponent {

    dataNB: Array<{}>;
    cartSesssion: any;
    selectedBankCode: String;
    netBankingForm: FormGroup;
    isValid: boolean;
    payuData: {};
    dataNBTop: Array<{}>;
    selectedBankName:any;
    prepaidDiscount:number=0;
    totalPayableAmount:number=0;
    prepaidsubscription: Subscription;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    imageFolder = CONSTANTS.pwaImages.imgFolder;
    @Input() type : any;
    set isShowLoader(value) {
        this._loaderService.setLoaderState(value);
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private _checkoutService: CheckoutService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _objectToArray: ObjectToArray,
        private _loaderService: GlobalLoaderService,
        private _formBuilder: FormBuilder) {
        this.payuData = {};
        this.selectedBankCode = 'AXIB';
        // //console.log(this.dataNB);
        this.isValid = false;
    }

    ngOnInit() {



        // this.dataNB = DATA_NB;
        // //console.log(res);
        // debugger;
        if (this.type === 'retail') {
            this.dataNB = this._objectToArray.transform(DATA_NB["NB"], "associative");
            this.dataNBTop = this._objectToArray.transform(DATA_NB["NB-top"], "associative");    
            this.selectedBankCode ="AXIB";
            this.selectedBankName = "AXIS Bank NetBanking";
        } else {
            this.dataNB = this._objectToArray.transform(DATA_NB_RAZ["NB"], "associative");
            this.dataNBTop = this._objectToArray.transform(DATA_NB_RAZ["NB-top"], "associative");    
            this.selectedBankCode ="UTIB";
            this.selectedBankName = "AXIS Bank NetBanking";
        }

        this.netBankingForm = this._formBuilder.group({
            /*"platformCode": [null],
             "mode": [null],
             "paymentId": [2],*/
            "requestParams": this._formBuilder.group({
                "paymentId": [this.type== 'tax' ? 74 : 5],            
                "bankname": [this.selectedBankName, [Validators.required]]
            })
        });

        this.getPrePaidDiscount();
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription=this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
         })
        
    }

    ngAfterViewInit() {
        //console.log("ngAfterViewInit Called")
    }

    updateNetBankingBank(selectedBank) {
        ////console.log(selectedBank);
        //this.selectedBankCode = selectedBank;
        if(this.type == 'retail'){
            this.selectedBankCode  = DATA_NB['NB'][selectedBank] ?DATA_NB['NB'][selectedBank].code : DATA_NB['NB-top'][selectedBank].code;
            this.selectedBankName = selectedBank;
            this.netBankingForm.get('requestParams').get("bankname").setValue(this.selectedBankName)
            this.netBankingForm.get('requestParams').get("paymentId").setValue(DATA_NB['NB'][this.selectedBankName] ? DATA_NB['NB'][this.selectedBankName].id : DATA_NB['NB-top'][this.selectedBankName].id);
        }else{
            this.selectedBankCode  = DATA_NB_RAZ['NB'][selectedBank] ? DATA_NB_RAZ['NB'][selectedBank].code : DATA_NB_RAZ['NB-top'][selectedBank].code;
            this.selectedBankName = selectedBank;
            this.netBankingForm.get('requestParams').get("bankname").setValue(this.selectedBankName)
            this.netBankingForm.get('requestParams').get("paymentId").setValue(DATA_NB_RAZ['NB'][this.selectedBankName] ? DATA_NB_RAZ['NB'][this.selectedBankName].id : DATA_NB_RAZ['NB-top'][this.selectedBankName].id);    
        }
        ////console.log("Selected Bank Code",this.selectedBankCode);
    }

    pay(data, valid) {
        if (!valid)
        return;
    ////console.log(data.requestParams);

    let cartSession = this._cartService.getCartSession();
    let cart = cartSession["cart"];
    let cartItems = cartSession["itemsList"];

    let userSession = this._localAuthService.getUserSession();

    let addressList = this._checkoutService.getCheckoutAddress();

    let shippingInformation = {
        'shippingCost': cartSession['cart']['shippingCharges'],
        'couponUsed': cartSession['cart']['totalOffer'],
        'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
    };

    dataLayer.push({
        'event': 'checkoutStarted',
        'shipping_Information': shippingInformation,
        'city': addressList["city"],
        'paymentMode': 'NB'
    });

    let extra = {
        "mode": "NB",
        "paymentId": 5,
        addressList: addressList
    };

    let newdata = {
        "platformCode": "online",
        "mode": extra.mode,
        "paymentId": this.netBankingForm.get('requestParams').get('paymentId').value,
        "requestParams": {
            "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
            "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
            "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
            "productinfo": "MSNghihjbc",
            "bankcode": this.selectedBankCode,
        },
        "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
    };
    if(this.type == "tax"){
        // newdata["requestParams"]["paymentId"]=this.netBankingForm.get('requestParams').get('paymentId').value;
        newdata["paymentGateway"]="razorpay";
        newdata["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"]=this.netBankingForm.get('requestParams').get('paymentId').value;

    }
    this.isShowLoader = true;
    //console.log("New Data for pay", newdata);
    // $("#page-loader").show();
    this._commonService.pay(newdata).subscribe((res): void => {

        if (res.status != true) {
            this.isValid = false;
            this.isShowLoader = false;
            alert(res.description);
            return;
        }

        let data = res.data;
        let payuData;
        if(this.type=='retail'){
            payuData = {
                formUrl: data.formUrl,
                key: (data.key != undefined && data.key != null) ? data.key : "",
                //key: "o0O7UA",
                txnid: (data.txnid != undefined && data.txnid != null) ? data.txnid : "",
                //txnid: "9878767",
                amount: (data.amount != undefined && data.amount != null) ? data.amount : "",
                //amount: "1.01",
                productinfo: data.productinfo,
                //productinfo: "MSNghihjbc",
                firstname: data.firstname,
                //firstname: "Kuldeep",
                //lastname: (data.lastname != undefined && data.lastname != null) ? data.lastname : "",
                //zipcode: (data.zipcode != undefined && data.zipcode != null) ? data.zipcode : "",
                email: data.email,
                //email: "kuldeep.panchal669@moglix.com",
                phone: data.phone,
                surl: data.surl,
                furl: data.furl,
                curl: data.curl,
                hash: data.hash,
                //hash:"556dbad0696d0f97287175d0a416f80cfa24f935b9cc461331fedb2474b4bf9096ee20cd4cce0030a09f644e22454a01880e3f8b185490c7a28a126beb211192",
                pg: data.pg,
                bankcode: data.bankcode,
                //ccnum: data.ccnum,
                //ccname: data.ccname,
                //ccvv: data.ccvv,
                //ccexpmon: data.ccexpmon,
                //ccexpyr: data.ccexpyr,
                //store_card: data.store_card,
                //user_credentials: data.key+':'+data.email
            };
        }else{
            payuData = data;
        }

        this.updateBuyNowToLocalStorage();
        this.payuData = payuData;

        //console.log(payuData);
        this.isValid = true;
        setTimeout(() => {
            this.isShowLoader = false;
            // $("#page-loader").hide();
        }, 1000)
    });
    }

    /**
     * Set buyNow state to localstorage for removing buyNow 
     * item from cart after successfull/failure of payment.
     * also remove existing buynow flag, if user tries to place order without buynow.
     */
    updateBuyNowToLocalStorage() {
        const buyNow = this._cartService.buyNow;
        if (buyNow) {
            this._localStorageService.store('flashData', { buyNow: true });
        } else {
            this._localStorageService.clear('flashData');
        }
    }

    getPrePaidDiscount() {
        let cartSession = this._cartService.getCartSession();

        let userSession = this._localAuthService.getUserSession();

        let addressList = this._checkoutService.getCheckoutAddress();

        let extra = {
            "mode": "NB",
            "paymentId": 5,
            addressList: addressList
        };
        cartSession["extraOffer"] = null;

        let validatorRequest = this._commonService.createValidatorRequest(cartSession, userSession, extra);

        let body = validatorRequest.shoppingCartDto;
        this.isShowLoader = true;
        this._checkoutService.getPrepaidDiscountUpdate(body).subscribe((res) => {

            if (res['status']) {
                cartSession['extraOffer'] = res['data']['extraOffer'];
                let cart = res['data']['cart'];
                if (res['data']['extraOffer'] && res['data']['extraOffer']['prepaid']) {
                    this.prepaidDiscount = res['data']['extraOffer']['prepaid']
                }
                if (cart) {
                    let shipping = cart.shippingCharges ? cart.shippingCharges : 0;
                    let totalAmount = cart.totalAmount ? cart.totalAmount : 0;
                    let totalOffer = cart.totalOffer ? cart.totalOffer : 0;
                    this.totalPayableAmount = totalAmount + shipping - totalOffer-this.prepaidDiscount;
                }
                this._cartService.setCartSession(cartSession);
                // console.log(this.cartSesssion);
                this._cartService.orderSummary.next(cartSession);
                this.isShowLoader = false;
            }
        });
    }


    updateTopBank($event) {
        this.selectedBankName = this.netBankingForm.get("requestParams").value.bankname;        
        if(this.type == 'retail'){
            this.selectedBankCode  = DATA_NB['NB'][this.selectedBankName] ?DATA_NB['NB'][this.selectedBankName].code : DATA_NB['NB-top'][this.selectedBankName].code;
            this.selectedBankName = $event.target.value;
            this.netBankingForm.get('requestParams').get("bankname").setValue(this.selectedBankName)
            this.netBankingForm.get('requestParams').get("paymentId").setValue(DATA_NB['NB'][this.selectedBankName] ? DATA_NB['NB'][this.selectedBankName].id : DATA_NB['NB-top'][this.selectedBankName].id);
        }else{
            this.selectedBankCode  = DATA_NB_RAZ['NB'][this.selectedBankName] ? DATA_NB_RAZ['NB'][this.selectedBankName].code : DATA_NB_RAZ['NB-top'][this.selectedBankName].code;
            this.selectedBankName = $event.target.value;
            this.netBankingForm.get('requestParams').get("bankname").setValue(this.selectedBankName)
            this.netBankingForm.get('requestParams').get("paymentId").setValue(DATA_NB_RAZ['NB'][this.selectedBankName] ? DATA_NB_RAZ['NB'][this.selectedBankName].id : DATA_NB_RAZ['NB-top'][this.selectedBankName].id);    
        }

    }

    ngOnDestroy() {
         
        this.prepaidsubscription.unsubscribe();
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
}