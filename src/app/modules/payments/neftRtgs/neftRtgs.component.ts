import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { LocalStorageService } from 'ngx-webstorage';

import CONSTANTS from '../../../config/constants';
import { CartService } from '../../../utils/services/cart.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { CommonService } from '../../../utils/services/common.service';
import { CheckoutService } from '../../../utils/services/checkout.service';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'neft-rtgs',
    templateUrl: './neftRtgs.html'
})
export class NeftRtgsComponent {

    API: any = CONSTANTS;
    message: string;
    isNeftEnable: boolean = true;
    invoiceType: string;
    totalPayableAmount: number = 0;
    type: any;
    
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private _checkoutService: CheckoutService,
        private _commonService: CommonService,
        private _router: Router,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private loaderService: GlobalLoaderService,
        private _analytics: GlobalAnalyticsService
    ) {
       
    }

    ngOnInit() {
        this.invoiceType = this._checkoutService.invoiceType;
        // check for NEFT applicable
        let cartSession = this._cartService.getCartSession();
        if (cartSession["cart"]["totalPayableAmount"] < CONSTANTS.NEFT_AMOUNT_LMIT) {
            this.message = `NEFT not available below Rs. ${CONSTANTS.NEFT_AMOUNT_LMIT}`;
            this.isNeftEnable = false;
        }
        this.totalPayableAmount = cartSession['cart']['totalAmount'] + cartSession['cart']['shippingCharges'] - cartSession['cart']['totalOffer'];
    }


    pay() {
        let cartSession = this._cartService.getCartSession();
        let userSession = this._localAuthService.getUserSession();
        let addressList = this._checkoutService.getCheckoutAddress()
        let newdata = {};

        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        this._commonService.isBrowser && this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': 'NEFT'
        });

        let extra = {
            "mode": "NEFT",
            "paymentId": 4,
            addressList: addressList
        };

        if (this.invoiceType === 'retail') {
            newdata = {
                "platformCode": "online",
                "mode": "NEFT",
                "paymentId": 4,
                "paymentGateway": "payu",
                "requestParams": null,
                "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
            };
        } else {
            newdata = {
                "platformCode": "online",
                "mode": "NEFT",
                "paymentId": 4,
                "paymentGateway": "razorpay",
                "requestParams": null,
                "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
            };
        }
        this._commonService.isBrowser &&  this._analytics.sendAdobeOrderRequestTracking(newdata,`pay-initiated:neft-rtgs`);
        this.isShowLoader = true;
        this._commonService.pay(newdata).subscribe((res) => {
            if (res.status != true) {
                this.isShowLoader = false;
                return;
            }
            let data = res.data;

            let extras = {
                queryParams: {
                    mode: 'NEFT',
                    orderId: data.orderId,
                    transactionAmount: data.orderAmount
                },
                replaceUrl: true
            };
            this.isShowLoader = false;
            this.updateBuyNowToLocalStorage();
            this._router.navigate(["order-confirmation"], extras);
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

}
