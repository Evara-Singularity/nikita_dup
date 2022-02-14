import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../config/constants';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CommonService } from '../../utils/services/common.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { TrackingService } from '@app/utils/services/tracking.service';

declare var dataLayer;

// import * as $ from "jquery";

@Component({
    selector: 'net-banking',
    templateUrl: './netBanking.html',
    styleUrls: ['./netBanking.scss']
})

export class NetBankingComponent {

    dataNB: Array<{}>;
    cartSesssion: any;
    selectedBankCode: String;
    netBankingForm: FormGroup;
    isValid: boolean;
    payuData: {};
    dataNBTop: Array<{}>;
    selectedBankName: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    imagePath = CONSTANTS.IMAGE_ASSET_URL;
    @Input() type: any;
    set isShowLoader(value) {
        this._loaderService.setLoaderState(value);
    }
    bankSelectPopupStatus: boolean = false;
    @Input() successPercentageData: any = null;
    // sprint 13 changes
    topBanks: Array<any> = [];
    othersBanks: Array<any> = [];
    lowSuccessBanks: Array<any> = [];
    commonFailureMsg: boolean = null;

    readonly bankImages = {
        // bankid: image map
        "5": "hdfc.png",
        "3": "axis.png",
        "11": "icici.png",
        "43": "kotak.png",
        "103": "kotak.png",
        "25": "united.png",
        "12": "sbi.png",
        "118": "sbi.png",
        "35": "united.png",
        "46": "pnb.png",
        "74": "axis.png",
        "92": "hdfc.png",
        "93": "icici.png",
        "97": "united.png",
    };

    constructor(
        private _localStorageService: LocalStorageService,
        private _checkoutService: CheckoutService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _objectToArray: ObjectToArray,
        private _loaderService: GlobalLoaderService,
        private _formBuilder: FormBuilder,
        private _trackingService: TrackingService) {
        this.payuData = {};
        this.isValid = false;
    }

    ngOnInit() {

        this.netBankingForm = this._formBuilder.group({
            /*"platformCode": [null],
             "mode": [null],
             "paymentId": [2],*/
            "requestParams": this._formBuilder.group({
                "paymentId": [this.type == 'tax' ? 74 : 5],
                "bankname": ['', [Validators.required]],
                "topBank": []
            })
        });

        if (this.successPercentageData) {
            const bankData = this.createNetBankingData(this.successPercentageData);
            // console.log('bankData =>', bankData);
            this.topBanks = bankData.topBanks;
            this.othersBanks = bankData.otherBanks;
            this.lowSuccessBanks = bankData.lowSuccessBanks;
        }

        this.getPrePaidDiscount();
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })
        this.setFirstBankDefaults();
    }

    setFirstBankDefaults() {
        // select default first top bank
        const firstTopBank = this.topBanks[0]
        this.selectedBankCode = firstTopBank['code'];
        this.netBankingForm.get('requestParams').get("bankname").setValue(firstTopBank.code);
    }

    createNetBankingData(successPercentageData) {
        const banksArr: [] = this._objectToArray.transform(successPercentageData);
        const topBanks = banksArr.filter(item => item['is_top'] == 1)
        const otherBanks = banksArr.filter(item => item['is_top'] != 1)
        const lowSuccessBanks = banksArr.filter(item => item['up_status'] == 0)
        topBanks.sort((a, b) => (a['name'] > b['name']) ? 1 : -1)
        otherBanks.sort((a, b) => (a['name'] > b['name']) ? 1 : -1)
        return { topBanks, otherBanks, lowSuccessBanks };
    }

    ngAfterViewInit() {

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
        if (this.type == "tax") {
            // newdata["requestParams"]["paymentId"]=this.netBankingForm.get('requestParams').get('paymentId').value;
            newdata["paymentGateway"] = "razorpay";
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"] = this.netBankingForm.get('requestParams').get('paymentId').value;

        }
        this._trackingService.sendAdobeOrderRequestTracking(newdata, `pay-initiated:net banking`);
        this.isShowLoader = true;
        //console.log("New Data for pay", newdata);
        // $("#page-loader").show();
        this._commonService.pay(newdata).subscribe((res): void => {

            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }

            let data = res.data;
            let payuData;
            if (this.type == 'retail') {
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
            } else {
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
                    this.totalPayableAmount = totalAmount + shipping - totalOffer - this.prepaidDiscount;
                }
                this._cartService.setCartSession(cartSession);
                // console.log(this.cartSesssion);
                this._cartService.orderSummary.next(cartSession);
                this.isShowLoader = false;
            }
        });
    }

    selectBank(data, isTopBank = false) {
        // console.log('selectbak==> ', data, isTopBank);
        if (data) {
            this.selectedBankCode = data.code;
            // only set incase value selected from select popup
            if (!isTopBank) {
                this.selectedBankName = data.name;
                this.commonFailureMsg = false;
                this.commonFailureMsg = (data.up_status === 0) ? true : false;
            } else {
                this.commonFailureMsg = false;
                this.selectedBankName = null;
            }
            this.netBankingForm.get('requestParams').get("bankname").setValue(data.code);
            this.netBankingForm.get('requestParams').get("paymentId").setValue(data.id);
        }
        this.bankSelectPopupStatus = false;
    }

    openYearPopUp() {
        this.bankSelectPopupStatus = true;
    }

    ngOnDestroy() {

        this.prepaidsubscription.unsubscribe();
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
}