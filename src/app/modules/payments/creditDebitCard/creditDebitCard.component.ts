import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '@app/config/constants';
import { CartService } from '@app/utils/services/cart.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CreditCardValidator } from 'ng2-cc-library';
import * as creditCardType from 'credit-card-type';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { DataService } from '@app/utils/services/data.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'credit-debit-card',
    templateUrl: './creditDebitCard.html',
    styleUrls: ['./creditDebit.scss']
})
export class CreditDebitCardComponent implements OnInit {

    @Input() type: any;

    API: any = CONSTANTS;
    prepaidsubscription: Subscription;
    creditDebitCardForm: FormGroup;
    isValid: boolean = false;
    payuData: {} = {};
    cart: {};
    cartItems: Array<{}>;
    expYrs: Array<any> = [];
    cartSession: any;
    expMons: Array<{ key: string, value: string }> = CONSTANTS.GLOBAL.expMons;
    cartSessionObject: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    monthSelectPopupStatus: boolean = false;
    selectedMonth: string = null;
    yearSelectPopupStatus: boolean = false;
    selectedYear: string = null;

    constructor(
        private _localStorageService: LocalStorageService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _loaderService: GlobalLoaderService,
        private _analytics: GlobalAnalyticsService,
        private _commonService: CommonService,
        private _dataService: DataService,
        private _formBuilder: FormBuilder) {
        this.createYears();
        this.intializeForm();

    }

    private createYears() {
        let todayDate = new Date();
        let currentYear = todayDate.getFullYear();
        for (let i = 0; i < 20; i++) {
            this.expYrs.push({ key: currentYear, value: currentYear });
            currentYear = currentYear + 1;
        }
    }

    private intializeForm() {
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
    }

    set isShowLoader(value) {
        this._loaderService.setLoaderState(value);
    }

    ngOnInit() {
        this.cartSession = this._cartService.getGenericCartSession;
        this.getPrePaidDiscount('CC'); // Credit card as default options

        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount(this.creditDebitCardForm.controls['mode'].value);
        })
    }


    pay(data, valid) {

        if (!valid) return;

        const { extra, newdata, shippingInformation, addressList } = this.createPayRequestPayload(data);
        extra['paymentId'] = newdata['paymentId'];

        const CARD_TYPE = data.mode == "CC" ? "credit" : "debit";

        this._commonService.isBrowser && this.paymentInitiatedAnalyticCall(shippingInformation, addressList, data)
        this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata, `pay-initiated:${CARD_TYPE} card`);

        this.isShowLoader = true;
        this._cartService.pay(newdata).subscribe((res): void => {
            if (res['status'] != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }

            let data = res['data'];
            let payuData;
            if (this.type == "retail") {

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
                    ccnum: data.ccnum,
                    ccname: data.ccname,
                    ccvv: data.ccvv,
                    ccexpmon: data.ccexpmon,
                    ccexpyr: data.ccexpyr,
                    store_card: data.store_card,
                    user_credentials: data.user_credentials
                };
            } else {
                payuData = data;
            }

            this.updateBuyNowToLocalStorage();

            this.payuData = payuData;
            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader = false;
            }, 1000);
        });
    }

    private createPayRequestPayload(data: any) {
        const cartSession = this._cartService.getCartSession();
        const ccnum = data.requestParams.ccnum.replace(/ /g, '');
        const bankcode = this.getBankCode(ccnum);
        const userSession = this._localAuthService.getUserSession();
        const addressList = this._cartService.shippingAddress;
        const shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        const extra = {
            "mode": data.mode,
            "paymentId": data.mode == 'CC' ? 9 : 2,
            addressList: addressList
        };

        if (this.type == 'tax') {
            extra["paymentId"] = data.mode == "CC" ? 131 : 130;
        }

        const newdata = {
            "platformCode": "online",
            "mode": extra.mode,
            "paymentId": extra.paymentId,
            "requestParams": {
                "firstname": addressList["addressCustomerName"].split(' ')[0],
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
            "validatorRequest": this._cartService.createValidatorRequest(extra),
        };

        if (this.type == "tax") {
            newdata["paymentGateway"] = "razorpay";
            newdata.requestParams['bankcode'] = "card";
            newdata["paymentId"] = data.mode == "CC" ? 131 : 130;
        }
        return { extra, newdata, shippingInformation, addressList };
    }

    private paymentInitiatedAnalyticCall(shippingInformation: { shippingCost: any; couponUsed: any; GST: string; }, addressList: {}, data: any) {
        this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': data.mode
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
        this.isShowLoader = true;
        (this.creditDebitCardForm.get('requestParams') as FormControl).reset();
        this.selectedMonth = null;
        this.selectedYear = null;
        this._cartService.validatePaymentsDiscount(mode, (mode == 'CC' ? 9 : 2)).subscribe(response => {
            this.isShowLoader = false;
            if (response) {
                this.prepaidDiscount = response['prepaidDiscount'];
                this.totalPayableAmount = response['totalPayableAmount']
            }
        })
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

    selectMonth(data) {
        if (data) {
            this.selectedMonth = data['key'];
            (this.creditDebitCardForm.get('requestParams.ccexpmon') as FormControl).setValue(data.key);
        }
        this.monthSelectPopupStatus = false;
    }

    openMonthPopUp() {
        this.monthSelectPopupStatus = true;
    }

    selectYear(data) {
        if (data) {

            this.selectedYear = data['value'];
            (this.creditDebitCardForm.get('requestParams.ccexpyr') as FormControl).setValue(data.key);
        }
        this.yearSelectPopupStatus = false;
    }

    openYearPopUp() {
        this.yearSelectPopupStatus = true;
    }

    payApiCall(data) {
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, { body: data });
    }

}