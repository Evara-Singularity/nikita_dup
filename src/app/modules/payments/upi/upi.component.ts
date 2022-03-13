import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../../config/constants';
import { CartService } from '../../../utils/services/cart.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { CommonService } from '../../../utils/services/common.service';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { LowSuccessMessagePipe } from '@app/utils/pipes/low-success-rate.pipe';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'upi',
    templateUrl: './upi.html',
    styleUrls:['./upi.scss']
})
export class UpiComponent implements OnInit {

    @Input() type:any;
    @Input() successPercentageData: any = null;

    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly imageFolder = CONSTANTS.pwaImages.imgFolder;

    isValid: boolean = false;
    uType: number = CONSTANTS.GLOBAL.upiTez;
    upi: String;
    upiTez: number;
    upiForm: FormGroup;
    upiData: {} = {};
    upiChecked: boolean = true;
    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    lsrMessage = null;

    set isShowLoader(value) {
        this._loaderService.setLoaderState(value);
    }
    
    constructor(
        private _localStorageService: LocalStorageService,
        private _loaderService: GlobalLoaderService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _formBuilder: FormBuilder,
        private _objectToArray: ObjectToArray,
        private lsr: LowSuccessMessagePipe,
        private _analytics: GlobalAnalyticsService) {
    }

    ngOnInit() {
        this.upiForm = this._formBuilder.group({
            "upi": ["", [Validators.required]]
        });
        this.getPrePaidDiscount();
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })
        this.lowSuccessBanks();
    }


    pay(data, valid) {
        this.isShowLoader = true;
        if (!valid) return;

        this.upi   = data.upi;
        let newdata: {};

        if (this.uType == CONSTANTS.GLOBAL.upiTez) {
            newdata = this.createTezData(data);
        } else {
            console.log('Error: No UPI selected');
        }

        this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata,`pay-initiated:upi`);
        this._cartService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }

            let data = res.data;
            let upiData: {};
            if(this.type == "retail"){
                if (this.uType == CONSTANTS.GLOBAL.upiTez) {
                    upiData = data["payUWalletRequest"];
                }
                this.upiData = upiData;
            }else{
                this.upiData = data;
            }
            this.updateBuyNowToLocalStorage();
            this.upiData["vpa"] = this.upi;             

            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader = false;
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

    createTezData(data) {
        let cartSession = this._cartService.getCartSession();
        let userSession = this._localAuthService.getUserSession();
        let addressList = this._cartService.shippingAddress;
        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        this._commonService.isBrowser && this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': 'TEZ'
        });

        let extra = {
            mode: "TEZ",
            paymentId: 62,
            addressList: addressList
        };

        let upiData = {
            "platformCode": "online",
            "mode": "TEZ",
            "paymentId": 62,
            "requestParams": {
                "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "productinfo": "MSNghihjbc",
                "bankcode": "TEZ",
            },
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
        };
        if(this.type == "tax"){
            upiData["mode"]="UPI";
            upiData["requestParams"]["vpa"] = this.upi;
            upiData["requestParams"]["bankcode"]="upi";
            upiData["paymentGateway"]="razorpay";
            upiData["paymentId"]=132;
            upiData["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"]=132;

        }
        return upiData;
    }

    getPrePaidDiscount() {
        this.isShowLoader = true;
        this._cartService.validatePaymentsDiscount("TEZ", 62).subscribe(response => {
            this.isShowLoader = false;
            if (response) {
                this.prepaidDiscount = response['prepaidDiscount'];
                this.totalPayableAmount = response['totalPayableAmount']
            }
        })
    }

    
    lowSuccessBanks(){
        this.lsrMessage = null;
        if (this.type == 'retail'){
            const banksArr: [] = this._objectToArray.transform(this.successPercentageData);
            const TOP = banksArr.filter(item => item['is_top'] == 1);
            const OTHERS = banksArr.filter(item => item['is_top'] == 0);
            const LSRTOP = TOP.filter(item => item['up_status'] == 0);
            const LSROTHERS = OTHERS.filter(item => item['up_status'] == 0);
            if (LSRTOP.length || LSROTHERS.length) {
                this.lsrMessage = this.lsr.transform(LSRTOP, LSROTHERS, "upis");
            }
        }
    }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
}
