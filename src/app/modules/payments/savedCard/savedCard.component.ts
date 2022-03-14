import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

import { CartService } from '../../../utils/services/cart.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { ObjectToArray } from '../../../utils/pipes/object-to-array.pipe';
import { CommonService } from '../../../utils/services/common.service';
import CONSTANTS from '../../../config/constants';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { DataService } from '@app/utils/services/data.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'saved-card',
    templateUrl: './savedCard.html',
    styleUrls: ['./savedCard.component.scss'],

})
export class SavedCardComponent {

    
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    @Input() savedCardsData: any;
    @Input() type;
    @Output() removeTab$: EventEmitter<any> = new EventEmitter<any>();
    
    savedCardForm: FormGroup;
    isValid: boolean = false;
    payuData: any = {};
    savedCards: Array<{}> = [];
    selectedCardIndex: number;
    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    payEnable = false;
    selectedBankCode: String = 'AXIB';

    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private loaderService: GlobalLoaderService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _objectToArray: ObjectToArray,
        private _dataService: DataService,
        private _formBuilder: FormBuilder,
        private _analytics: GlobalAnalyticsService) {
    }

    ngOnInit() {
        this.isShowLoader = false;
        this.cartSesssion = this._cartService.getGenericCartSession;
        this.initForm();
        this.checkPrepaidDiscount();
    }

    private checkPrepaidDiscount() {
        let data = {};
        const userSession = this._localAuthService.getUserSession();
        if (this.type == "tax") {
            data["userId"] = userSession["userId"];
        } else {
            data['userEmail'] = (userSession && userSession["email"]) ? userSession["email"] : userSession["phone"];
        }
        this.getPrePaidDiscount(0);
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        });
    }

    private initForm() {
        this.savedCards = this._objectToArray.transform(this.savedCardsData);
        this.savedCardForm = this._formBuilder.group({
            cards: this._formBuilder.array(this.createSavedCardForm(this.savedCards))
        });
    }

    checkpayEnable(val) {
        if (val) this.payEnable = true
        else this.payEnable = false;
    }

    createSavedCardForm(savedCards) {
        const sc = [];
        for (let i = 0; i < savedCards.length; i++) {
            sc.push(
                this._formBuilder.group({
                    cvv: ''
                })
            );
        }
        return sc;
    }

    deleteCard(index) {
        let userSession = this._localAuthService.getUserSession();

        let data = {
            userEmail: userSession["email"] ? userSession["email"] : userSession["phone"],
            cardToken: this.savedCards[index]['card_token'],
            userId: userSession["userId"]
        };
        if (this.type == "tax") {
            data["gateWay"] = "razorpay";
        } else {
            data["gateWay"] = "payu";
        }
        this.deleteSavedCard(data).subscribe((res) => {
            if (res['status'] == true) {//delete card
                if (this.savedCards.length === 1) {
                    this.savedCardForm = undefined;
                    this.savedCards.splice(index, 1);
                    this.removeTab$.emit(CONSTANTS.GLOBAL['savedCard']);
                } else {
                    this.savedCards.splice(index, 1);
                    this.selectedCardIndex = 0;
                    this.getPrePaidDiscount();
                    this.savedCardForm = this._formBuilder.group({
                        cards: this._formBuilder.array(this.createSavedCardForm(this.savedCards))
                    });
                }
            } else {// show message returned from api
            }
        });
    }


    getPrePaidDiscount(sci?: number) {
        const extra = {
            mode: this.savedCards[sci !== undefined && sci === 0 ? sci : this.selectedCardIndex]['card_mode'],
            paymentId: this.savedCards[sci !== undefined && sci === 0 ? sci : this.selectedCardIndex]['card_mode'] === 'CC' ? 9 : 2,
        };
        this.isShowLoader = true;
        this._cartService.validatePaymentsDiscount(extra.mode, extra.paymentId).subscribe(response => {
            this.isShowLoader = false;
            if (response) {
                this.prepaidDiscount = response['prepaidDiscount'];
                this.totalPayableAmount = response['totalPayableAmount']
            }
        })
    }

    pay(data, valid) {
        if (!valid) return;

        const cartSession = this._cartService.getGenericCartSession;
        const userSession = this._localAuthService.getUserSession();
        const addressList = this._cartService.shippingAddress;

        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': this.savedCards[this.selectedCardIndex]['card_mode']
        });

        const extra = {
            mode: this.savedCards[this.selectedCardIndex]['card_mode'],
            paymentId: this.savedCards[this.selectedCardIndex]['card_mode'] == 'CC' ? 9 : 2,
            addressList: addressList
        };
        if (this.type == 'tax')
            extra["paymentId"] = data.mode == "CC" ? 131 : 130;

        let newdata = {
            "platformCode": "online",
            "mode": extra.mode,
            "paymentId": extra.paymentId,
            "paymentGateway": "",
            "isSavedCard": true,
            "validatorRequest": this._cartService.createValidatorRequest(extra)
        };
        if (this.type == "tax") {
            newdata["requestParams"] = {};
            newdata["paymentGateway"] = "razorpay";
            newdata["requestParams"]["ccvv"] = data['cards'][this.selectedCardIndex]['cvv'];
            newdata["requestParams"]["card_token"] = this.savedCards[this.selectedCardIndex]['card_token'];
            newdata["requestParams"]["store_card"] = "false";
            newdata["requestParams"]["user_id"] = userSession["userId"];

        } else {
            newdata["requestParams"] = {
                "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "ccexpyr": this.savedCards[this.selectedCardIndex]['expiry_year'],
                "ccnum": this.savedCards[this.selectedCardIndex]['card_no'],
                "ccexpmon": this.savedCards[this.selectedCardIndex]['expiry_month'],
                "productinfo": "PayUMoney product information",
                "ccname": this.savedCards[this.selectedCardIndex]['name_on_card'],
                "bankcode": this.savedCards[this.selectedCardIndex]['card_brand'],
                "ccvv": data['cards'][this.selectedCardIndex]['cvv'],
                "user_id": userSession["userId"],
                "store_card": "false",
                "card_token": this.savedCards[this.selectedCardIndex]['card_token']
            };
        }
        this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata, "pay-initiated:saved card");
        this.isShowLoader = true;
        this._cartService.pay(newdata).subscribe((res): void => {
            if (res['status'] != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }
            data = res['data'];
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
                    cardToken: this.savedCards[this.selectedCardIndex]['card_token'],
                    ccname: data.ccname,
                    ccvv: data.ccvv,
                    ccexpmon: data.ccexpmon,
                    ccexpyr: data.ccexpyr,
                    // store_card: data.store_card,
                    user_credentials: data.user_credentials
                };
                this.payuData = payuData;
            } else {
                this.payuData = data;
            }

            this.updateBuyNowToLocalStorage();

            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader = false;
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

    changeSavedCard(i, isChecked) {
        if (this.selectedCardIndex !== i) {
            this.selectedCardIndex = i;
            this.getPrePaidDiscount();
        } else {
            (<HTMLElement>document.querySelector('#csc_' + i))['checked'] = false;
            this.selectedCardIndex = undefined;
            this.getPrePaidDiscount(0);
        }
        this.payEnable = false;
        this.savedCardForm.reset();
    }

    stop(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
    }

    updateTopBank($event) {
        this.selectedBankCode = $event.target.value;
    }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
        this._cartService.setGenericCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }

    getSavedCards(data) {
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CARD.GET_SAVED_CARD, { params: data }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    deleteSavedCard(data) {
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CARD.PD_SAVED_CARD, { body: data }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }
}
