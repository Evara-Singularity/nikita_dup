import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '@app/config/constants';
import { CartService } from '@app/utils/services/cart.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { CheckoutService } from '@app/utils/services/checkout.service';
import { CreditDebitCardService } from "./creditDebitCard.service";
import { CreditCardValidator } from 'ng2-cc-library';
import * as creditCardType from 'credit-card-type';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';

declare var dataLayer;
@Component({
    selector: 'credit-debit-card',
    templateUrl: './creditDebitCard.html',
    styleUrls:['./creditDebit.scss']
})

export class CreditDebitCardComponent {
    API: {}
    prepaidsubscription: Subscription;
    creditDebitCardForm: FormGroup;
    isValid: boolean;
    payuData: {};
    cart: {};
    cartItems: Array<{}>;
    expYrs: Array<number>;
    cartSession: any;
    expMons: Array<{ key: string, value: string }>;
    cartSessionObject: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    @Input()type:any;
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(
        private _localStorageService: LocalStorageService, 
        private _checkoutService: CheckoutService, 
        private _commonService: CommonService, 
        private _localAuthService: LocalAuthService, 
        private _cartService: CartService, 
        private _creditDebitService: CreditDebitCardService, 
        private loaderService: GlobalLoaderService,
        private _formBuilder: FormBuilder) {

        this.API = CONSTANTS;
        this.payuData = {};
        this.expYrs = [];
        this.expMons = CONSTANTS.GLOBAL.expMons;
        let todayDate = new Date();
        ////console.log(todayDate);
        let currentYear = todayDate.getFullYear();
        for (let i = 0; i < 20; i++) {
            this.expYrs.push(currentYear);
            currentYear = currentYear + 1;
        }

        this.isValid = false;
        this.creditDebitCardForm = this._formBuilder.group({
            "store_card": [true],
            "mode": ['CC', [Validators.required]],
            "requestParams": this._formBuilder.group({
                "ccexpyr": ["", [Validators.required]],
                "ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                "ccexpmon": ["", [Validators.required]],
                "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                "ccvv": [null, [<any>Validators.required, <any>Validators.minLength(3), <any>Validators.maxLength(4)]]
            }),
        });

        let userSession = this._localAuthService.getUserSession();
        //console.log(userSession);
        let params = { "sessionid": userSession.sessionId };
    }

    ngOnInit() {
        this.cartSession = Object.assign({}, this._cartService.getCartSession());
        this.getPrePaidDiscount('CC');
    
        this.prepaidsubscription=this._cartService.prepaidDiscountSubject.subscribe((data) => {
           this.getPrePaidDiscount(this.creditDebitCardForm.controls['mode'].value);
          // this._cartService.prepaidDiscountSubject.unsubscribe();
        })
        //console.log("ngOnInit Called");
        //console.log('Checkout Address', this._checkoutService.getCheckoutAddress());
    }

    ngAfterViewInit() {
        //console.log("ngAfterViewInit Called")
    }

    pay(data, valid) {
        // console.log(this.creditDebitCardForm, data)
        if (!valid)
            return;
        //console.log(data);

        let cartSession = this._cartService.getCartSession();
        let cart = cartSession["cart"];
        let cartItems = cartSession["itemsList"];

        let ccnum = data.requestParams.ccnum.replace(/ /g, '');

        //console.log(ccnum, creditCardType(ccnum));

        let bankcode = this.getBankCode(ccnum);

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
            'paymentMode': data.mode
        });

        let extra = {
            "mode": data.mode,
            "paymentId": data.mode == 'CC' ? 9 : 2,
            addressList: addressList
        };
        if(this.type == 'tax')
            extra["paymentId"] = data.mode=="CC" ?  131 : 130;    

        let newdata = {
            "platformCode": "online",
            "mode": extra.mode,
            "paymentId": extra.paymentId,
            "requestParams": {
                //"firstname": "Kuldeep",
                // "firstname": userSession["userName"].split(' ').slice(0, -1).join(' '),
                "firstname": addressList["addressCustomerName"].split(' ')[0],
                // "phone": userSession["phone"] != undefined ? userSession["phone"] : "",
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "ccexpyr": data.requestParams.ccexpyr,
                "ccnum": ccnum,
                "ccexpmon": data.requestParams.ccexpmon,
                "productinfo": "msninrq7qv4",
                "ccname": data.requestParams.ccname,
                "bankcode": bankcode,
                "ccvv": data.requestParams.ccvv,
                //Below user_id is sent only for reference to store card in backend.
                "user_id": userSession["userId"],
                "store_card": data.store_card == true ? "true" : "false",
            },
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
        };
        if(this.type=="tax"){
            newdata["paymentGateway"]="razorpay";
            newdata.requestParams['bankcode'] = "card";
            newdata["paymentId"] = data.mode=="CC" ?  131 : 130;            
        }
        extra['paymentId'] = newdata['paymentId'];
        //console.log("New Data for pay", newdata);
        //   $("#page-loader").show();
        this.isShowLoader = true;
        this._commonService.pay(newdata).subscribe( (res) : void => {

            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                alert(res.description);
                return;
            }

            let data = res.data;
            let payuData;
            if(this.type == "retail"){

                payuData = {
                    formUrl: data.formUrl,
                    key: (data.key != undefined && data.key != null) ? data.key : "",
                    //key: "gtKFFx",
                    txnid: (data.txnid != undefined && data.txnid != null) ? data.txnid : "",
                    //txnid: "987678567",
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
                    //hash:"3bcbc9f6b5c4c8ab751b433f73a42e42f42057e3179458f71d8ffe8f92df55ff73ce967f7c99bf050054bfcfcde8b1c464df5d3f26e5199a784d7b969072da05",
                    pg: data.pg,
                    bankcode: data.bankcode,
                    ccnum: data.ccnum,
                    ccname: data.ccname,
                    ccvv: data.ccvv,
                    ccexpmon: data.ccexpmon,
                    ccexpyr: data.ccexpyr,
                    store_card: data.store_card,
                    user_credentials: data.user_credentials
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
            }, 1000);
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

    getPrePaidDiscount(mode) {
        let cartSession = this._cartService.getCartSession();

        let userSession = this._localAuthService.getUserSession();

        let addressList = this._checkoutService.getCheckoutAddress();

        let extra = {
            "mode": mode,
            "paymentId": mode == 'CC' ? 9 : 2,
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
                    this.totalPayableAmount = totalAmount + shipping - totalOffer - this.prepaidDiscount;
                }
                this._cartService.setCartSession(cartSession);
                this._cartService.orderSummary.next(cartSession);
                this.isShowLoader = false;
            }
        });
    }



    getBankCode(ccnum) {
        //console.log("Get Bank Code", ccnum);
        let cardType = creditCardType(ccnum);
        if (cardType != undefined && cardType.length > 0) {
            let type = cardType[0]['type'];
            if (type == "diners-club")
                return "DINR";
            else if (type == "master-card")
                return "MAST";
            else if (type == "visa")
                return "VISA";
            else if (type == 'maestro')
                return 'SMAE';
            else if (type == "american-express")
                return 'AMEX';
            else
                return null;
        }
        return null;
    }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
      //  this._cartService.prepaidDiscountSubject.complete();
        this._cartService.setCartSession(this.cartSession);
        this._cartService.orderSummary.next(this.cartSession);
    }
}