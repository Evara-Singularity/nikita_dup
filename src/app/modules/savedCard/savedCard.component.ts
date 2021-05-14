import { Component, EventEmitter, Output, Input } from '@angular/core';
import { SavedCardService } from './savedCard.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import { LocalStorageService } from 'ngx-webstorage';

import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { CommonService } from '../../utils/services/common.service';
import { CheckoutService } from '../../utils/services/checkout.service';
import CONSTANTS from '../../config/constants';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';

declare var dataLayer;

@Component({
    selector: 'saved-card',
    templateUrl: './savedCard.html',
    styleUrls: ['./savedCard.component.scss'],

})
export class SavedCardComponent {

    selectedBankCode: String;
    savedCardForm: FormGroup;
    isValid: boolean;
    payuData: {};
    savedCards: Array<{}>;
    @Input() savedCardsData: any;
    selectedCardIndex: number;
    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    @Output() removeTab$: EventEmitter<any>;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    @Input() type;
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(private _localStorageService: LocalStorageService, private loaderService: GlobalLoaderService, private _checkoutService: CheckoutService, private _commonService: CommonService, private _localAuthService: LocalAuthService, private _cartService: CartService, private _objectToArray: ObjectToArray, private _savedCardService: SavedCardService, private _formBuilder: FormBuilder) {
        this.removeTab$ = new EventEmitter<any>();
        this.savedCards = [];
        // this.selectedCardIndex = 0;
        this.payuData = {};
        this.selectedBankCode = 'AXIB';

        this.isValid = false;
    }

    ngOnInit() {

        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        });
        this.isShowLoader = true;

        const userSession = this._localAuthService.getUserSession();

        let data = {};
        if (this.type == "tax") {
            data["userId"] = userSession["userId"];
        } else {
            data['userEmail'] = (userSession && userSession["email"]) ? userSession["email"] : userSession["phone"]
        }
        // this._savedCardService.getSavedCards(data).subscribe((res) => {

        // if (res['status'] === true) {
        // if (res['data']['user_cards'] !== undefined && res['data']['user_cards'] !== null) {
        this.savedCards = this._objectToArray.transform(this.savedCardsData);
        this.savedCardForm = this._formBuilder.group({
            cards: this._formBuilder.array(this.createSavedCardForm(this.savedCards))
        });
        this.getPrePaidDiscount(0);
        // }
        // }
        this.isShowLoader = false;
        // })

    }

    ngAfterViewInit() {
    }
    payEnable = false;
    checkpayEnable(val) {
        if (val) this.payEnable = true
        else this.payEnable = false;
    }
    updateSavedCardBank(selectedBank) {

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
        this._savedCardService.deleteSavedCard(data).subscribe((res) => {
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

    /**
     * 
     * @param sci : Selected Card ndex
     */
    getPrePaidDiscount(sci?: number) {
        const cartSession = this._cartService.getCartSession();

        const userSession = this._localAuthService.getUserSession();

        const addressList = this._checkoutService.getCheckoutAddress();

        const extra = {
            mode: this.savedCards[sci !== undefined && sci === 0 ? sci : this.selectedCardIndex]['card_mode'],
            paymentId: this.savedCards[sci !== undefined && sci === 0 ? sci : this.selectedCardIndex]['card_mode'] === 'CC' ? 9 : 2,
            addressList: addressList
        };
        cartSession['extraOffer'] = null;

        const validatorRequest = this._commonService.createValidatorRequest(cartSession, userSession, extra);

        const body = validatorRequest.shoppingCartDto;
        this.isShowLoader = true;
        this._checkoutService.getPrepaidDiscountUpdate(body).subscribe((res) => {

            if (res['status']) {
                cartSession['extraOffer'] = res['data']['extraOffer'];
                const cart = res['data']['cart'];
                if (res['data']['extraOffer'] && res['data']['extraOffer']['prepaid']) {
                    this.prepaidDiscount = res['data']['extraOffer']['prepaid'];
                }
                if (cart) {
                    const shipping = cart.shippingCharges ? cart.shippingCharges : 0;
                    const totalAmount = cart.totalAmount ? cart.totalAmount : 0;
                    const totalOffer = cart.totalOffer ? cart.totalOffer : 0;
                    this.totalPayableAmount = totalAmount + shipping - totalOffer - this.prepaidDiscount;
                }
                this._cartService.setCartSession(cartSession);
                this._cartService.orderSummary.next(cartSession);
                this.isShowLoader = false;
            }
        });
    }

    pay(data, valid) {
        if (!valid)
            return;

        const cartSession = this._cartService.getCartSession();

        const userSession = this._localAuthService.getUserSession();

        const addressList = this._checkoutService.getCheckoutAddress();

        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        dataLayer.push({
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
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
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
        this.isShowLoader = true;

        this._savedCardService.pay(newdata).subscribe((res): void => {

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
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
}
