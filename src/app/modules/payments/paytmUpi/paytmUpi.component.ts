import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { CartService } from '@services/cart.service';
import { LocalAuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import CONSTANTS from '@config/constants';
import { GlobalLoaderService } from '@services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@app/utils/services/data.service';
@Component({
    selector: 'paytm-upi',
    templateUrl: './paytmUpi.html',
    styleUrls: ['./paytmUpi.scss']
})
export class PaytmUpiComponent {

    @Input() type: any;
    readonly imagePath = CONSTANTS.CDN_IMAGE_PATH;
    readonly imageFolder = CONSTANTS.pwaImages.imgFolder;

    isValid: boolean = false;
    uType: number = CONSTANTS.GLOBAL.paytmUpi;
    upi: String;
    upiTez: number;
    upiForm: FormGroup;
    upiData: any = {};
    upiChecked: boolean = true;
    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    upiError: any;
    validUpi: boolean;

    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private loaderService: GlobalLoaderService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _formBuilder: FormBuilder,
        private _dataService: DataService,
        private _analytics: GlobalAnalyticsService) {
    }

    ngOnInit() {
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.upiForm = this._formBuilder.group({
            "upi": ["", [Validators.required, Validators.pattern('^[a-zA-Z0-9_.]+@[0-9a-zA-Z]+$')]] //(?!\.)(?!.*\.$)(?!.*?\.\.)
        });
        this.getPrePaidDiscount();
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })
    }

    pay(data, valid) {
        this.isShowLoader = true;
        if (!valid) return;

        this.upi = data.upi;
        let newdata: {};

        if (this.uType == CONSTANTS.GLOBAL.paytmUpi) {
            newdata = this.createData();
        } else {
            // alert("No UPI selected");
        }
        this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata, `pay-initiated:paytm-upi`);
        this._cartService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }
            this.upiData = res['data'];
            this.updateBuyNowToLocalStorage();
            this.upiData["payerAccount"] = this.upi;
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

    createData() {
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
            'paymentMode': 'PAYTMUPI'
        })

        let extra = {
            mode: "PAYTM",
            paymentId: 53,
            addressList: addressList
        };

        let upiData = {
            "platformCode": "online",
            "mode": "UPI",
            "paymentGateway": "paytm",
            "paymentId": 134,
            "requestParams": {
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "paymentChannel": "WEB",
            },
            "validatorRequest": this._cartService.createValidatorRequest(extra)
        };
        return upiData;
    }

    getPrePaidDiscount() {
        this.isShowLoader = true;
        this._cartService.validatePaymentsDiscount("UPI", 134).subscribe(response => {
            this.isShowLoader = false;
            if (response) {
                this.prepaidDiscount = response['prepaidDiscount'];
                this.totalPayableAmount = response['totalPayableAmount']
            }
        })
    }

    paytmApicall(upiValue) {
        this.upiError = ""
        this.paytmNewApicall(upiValue.upi).subscribe((res) => {
            if (res['status'] == true && res['data']['isValid'] == true) {
                this.upiError = ""
                this.validUpi = true;
                this.pay(this.upiForm.value, this.upiForm.valid);
            }
            else {
                this.upiError = { message: res['data']['message'] };
                this.validUpi = false;

            }
        });
    }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
        this._cartService.setGenericCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }

    resetLoginError(event) {
        this.upiError = "";
    }

    paytmNewApicall(paytmupi){
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_VPA + paytmupi); 
    }
}
