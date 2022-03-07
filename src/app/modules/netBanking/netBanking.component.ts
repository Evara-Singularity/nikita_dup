import { Component, Input, OnInit } from '@angular/core';
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
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
@Component({
    selector: 'net-banking',
    templateUrl: './netBanking.html',
    styleUrls: ['./netBanking.scss']
})

export class NetBankingComponent implements OnInit {

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
        private _analytics: GlobalAnalyticsService) {
        this.payuData = {};
        this.isValid = false;
    }

    ngOnInit() {

        this.netBankingForm = this._formBuilder.group({
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

    pay(data, valid) {
        if (!valid)
            return;
        ////console.log(data.requestParams);

        let { shippingInformation, addressList, newdata } = this.createPayRequestPayload();

        this.initPaymentStartAnalytics(shippingInformation, addressList);
        this._analytics.sendAdobeOrderRequestTracking(newdata, `pay-initiated:net banking`);
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
                    txnid: (data.txnid != undefined && data.txnid != null) ? data.txnid : "",
                    amount: (data.amount != undefined && data.amount != null) ? data.amount : "",
                    productinfo: data.productinfo,
                    firstname: data.firstname,
                    email: data.email,
                    phone: data.phone,
                    surl: data.surl,
                    furl: data.furl,
                    curl: data.curl,
                    hash: data.hash,
                    pg: data.pg,
                    bankcode: data.bankcode,
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

    private createPayRequestPayload() {
        let cartSession = this._cartService.getCartSession();
        let userSession = this._localAuthService.getUserSession();
        let addressList = this._checkoutService.getCheckoutAddress();
        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };
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
            "validatorRequest": this._cartService.createValidatorRequest(extra)
        };
        if (this.type == "tax") {
            // newdata["requestParams"]["paymentId"]=this.netBankingForm.get('requestParams').get('paymentId').value;
            newdata["paymentGateway"] = "razorpay";
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"] = this.netBankingForm.get('requestParams').get('paymentId').value;
        }
        return { shippingInformation, addressList, newdata };
    }

    private initPaymentStartAnalytics(shippingInformation: { shippingCost: any; couponUsed: any; GST: string; }, addressList: {}) {
        this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': 'NB'
        })
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
        this.isShowLoader = true;
        this._cartService.validatePaymentsDiscount("NB", 5).subscribe(response => {
            this.isShowLoader = false;
            if(response){
                this.prepaidDiscount = response['prepaidDiscount'];
                this.totalPayableAmount = response['totalPayableAmount']
            }
        })
    }

    selectBank(data, isTopBank = false) {
        if (data) {
            this.selectedBankCode = data.code;
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
    }
}