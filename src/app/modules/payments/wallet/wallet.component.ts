import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../../config/constants';
import { CommonService } from '../../../utils/services/common.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { CartService } from '../../../utils/services/cart.service';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
@Component({
    selector: 'wallet',
    templateUrl: './wallet.html',
    styleUrls: ['./wallet.scss']
})

export class WalletComponent {

    readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
    @Input() type: any;
    @Input() successPercentageData: any = null;

    isValid: boolean;
    wType: any;
    walletForm: FormGroup;
    walletData: {};
    walletMapKeys = [];
    walletMap: any;
    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    lsrMessage = false;

    set isShowLoader(value) {
        this._loaderService.setLoaderState(value);
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _commonService: CommonService,
        private _objectToArray: ObjectToArray,
        private _loaderService: GlobalLoaderService,
        private _formBuilder: FormBuilder,
        private _analytics: GlobalAnalyticsService,
    ) {
        this.walletData = {};
        this.isValid = false;
    }

    ngOnInit() {

        this.walletMap = CONSTANTS.GLOBAL.walletMap[this.type];
        this.walletMapKeys = Object.keys(this.walletMap);
        this.wType = this.walletMapKeys[0];
        this.walletForm = this._formBuilder.group({
            "wType": [this.wType, [Validators.required]],
        });
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.getPrePaidDiscount();
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })

        this.lowSuccessBanks();

    }


    pay(data, valid) {
        this.isShowLoader = true;
        if (!valid)
            return;

        this.wType = data.wType;

        let newdata: {};
        let walletName: string;
        let paymentId = this.walletMap[this.wType].paymentId;
        let mode = this.walletMap[this.wType].mode;
        let bankcode = this.walletMap[this.wType].bankcode;
        let type = this.walletMap[this.wType].type;

        newdata = this.createWalletData(paymentId, mode, bankcode, type);
        if (type)
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["type"] = type;

        if (this.wType == "walletPaytm") {
            var requestParams = new Object(newdata["requestParams"]);
            newdata["requestParams"] = {
                "phone": requestParams["phone"],
                "email": requestParams["email"],
                "paymentChannel": "WEB"
            }
            walletName = "Paytm"
        } else if (this.wType == "walletMobikwik") {
            walletName = "Mobikwik"
            var requestParams = new Object(newdata["requestParams"]);
            newdata["requestParams"] = {
                "phone": requestParams["phone"],
                "email": requestParams["email"],
                "productinfo": "MSNghihjbc"
            }
        } else if (this.wType == "walletAirtel") {
            walletName = "Airtel"
        } else if (this.wType == "walletOxigen") {
            walletName = "Oxigen"
        } else if (this.wType == "walletOlamoney") {
            walletName = "Olamoney"
        } else if (this.wType == "walletFreecharge") {
            walletName = "Freecharge"
        } else if (this.wType == "walletJio") {
        }
        else if (this.wType == "walletMpesa") {
        }
        else if (this.wType == "walletPayZap") {
        }
        else if (this.wType == "walletHdfcpay") {
            walletName = "Hdfcpay"
        } else {
            // alert("No Wallet selected");
            return;
        }

        this._commonService.isBrowser && this._analytics.sendGTMCall({ 'event': "paymentButtonClick", 'payment': walletName });

        if (this.type == "tax") {
            newdata["paymentGateway"] = "razorpay";
            newdata["mode"] = "WALLET";
        }
        if (this.wType == "walletPaytm") {
            newdata["mode"] = "PAYTM";
        }
        this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata, "pay-initiated:wallet");
        
        this._cartService.pay(newdata).subscribe((res): void => {

            if (res['status'] != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }

            let data = res['data'];

            let walletData: {};
            if (this.type == "retail" || this.wType == "walletPaytm") {
                if (this.wType == "walletPaytm") {
                    walletData = data["payTMWalletRequest"];
                    let todayDate: any = new Date();
                    let dd: any = todayDate.getDate();
                    let mm: any = todayDate.getMonth() + 1; //January is 0!
                    const yyyy = todayDate.getFullYear();
                    if (dd < 10) {
                        dd = '0' + dd;
                    }
                    if (mm < 10) {
                        mm = '0' + mm;
                    }
                    todayDate = yyyy + '-' + mm + '-' + dd;
                    walletData["todayDate"] = todayDate;
                } else if (this.wType != "walletPaytm" && this.wType != "walletMobikwik" && this.walletMapKeys.indexOf(this.wType) != -1) {
                    walletData = data["payUWalletRequest"];
                } else if (this.wType == "walletMobikwik") {
                    walletData = data["mobikwikWalletRequest"];
                }
                this.walletData = walletData;
            } else {
                this.walletData = data;
            }

            this.updateBuyNowToLocalStorage();
            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader = false;
                //     $("#page-loader").hide();
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
        this.isShowLoader = true;
        this._cartService.validatePaymentsDiscount("WALLET", 51).subscribe(response => {
            this.isShowLoader = false;
            if (response) {
                this.prepaidDiscount = response['prepaidDiscount'];
                this.totalPayableAmount = response['totalPayableAmount']
            }
        })
    }

    createWalletData(paymentId, mode, bankcode, type) {
        let cartSession = this._cartService.getCartSession();
        let userSession = this._localAuthService.getUserSession();
        let addressList = this._cartService.shippingAddress;
        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': 'PAYTM'
        });

        let extra = {
            mode: mode,
            paymentId: paymentId,
            addressList: addressList
        };
        let freechargeData = {
            "platformCode": "online",
            "mode": mode,
            "paymentId": paymentId,
            "requestParams": {
                "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "productinfo": "MSNghihjbc",
                "bankcode": bankcode,
            },
            "validatorRequest": this._cartService.createValidatorRequest(extra)
        };
        return freechargeData;
    }


    lowSuccessBanks() {
        this.lsrMessage = false;
        if (this.type == 'retail') {
            const banksArr: [] = this._objectToArray.transform(this.successPercentageData);
            // show global message only for top wallets
            const lowSuccessBanks = banksArr.filter(item => (item['up_status'] == 0) && (item['is_top'] == 1))
            if (lowSuccessBanks.length) {
                this.lsrMessage = true;
            }
        }
    }

}
