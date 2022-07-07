import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
@Component({
    templateUrl: 'orderSummary.html',
    selector: 'order-summary',
    styleUrls: ['./orderSummary.scss'],
})
export class OrderSummaryComponent
{
    showPromoOfferPopup: boolean = false;
    showPromoSuccessPopup: boolean = false;
    totalOffer = 0;
    totalPayableAmount = 0;

    constructor(
        public router: Router,
        public _cartService: CartService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _globalAnalyticeService: GlobalAnalyticsService,
    ) { }

    ngOnInit(): void
    {
        this._cartService.appliedPromoCode = "";
        if (this._localAuthService.isUserLoggedIn()) {
            this._cartService.getPromoCodesByUserId(this._commonService.userSession.userId);
        }
        this._cartService.getCartUpdatesChanges().subscribe(cartSession =>
        {
            if (cartSession && cartSession.itemsList && cartSession.itemsList.length > 0) {
                this.updateShippingCharges();
                this.totalOffer = cartSession['cart']['totalOffer'] || 0;
                this.totalPayableAmount = this._cartService.getTotalPayableAmount(cartSession['cart']);
            }
        });
        this._cartService.promoCodeSubject.subscribe(({ promocode, isNewPromocode}) =>
        {
            this.showPromoSuccessPopup = isNewPromocode;
            setTimeout(()=> { this.showPromoSuccessPopup =false},800)
        })
    }

    updateShippingCharges()
    {
        this._cartService.shippingCharges = 0;
        if (this._cartService.getGenericCartSession && this._cartService.getGenericCartSession.itemsList && this._cartService.getGenericCartSession.itemsList.length > 0) {
            this.getGTMData(this._cartService.getGenericCartSession);
            this.sendTrackData(this._cartService.getGenericCartSession);
            this._cartService.getGenericCartSession.itemsList.forEach((item) =>
            {
                this._cartService.shippingCharges = this._cartService.shippingCharges + (item.shippingCharges || 0);
            });
        }
    }

    openOfferPopUp()
    {
        if (this._commonService.userSession.authenticated == "true") {
            this.showPromoOfferPopup = true;
        } else {
            this._localAuthService.setBackURLTitle('/quickorder', null);
            let navigationExtras: NavigationExtras = {
                queryParams: { 'backurl': '/quickorder' },
            };
            this.router.navigate(["/login"], navigationExtras);
        }
    }

    closePromoSuccessPopUp() { this.showPromoSuccessPopup = false; }

    closePromoListPopUp(flag) { this.showPromoOfferPopup = flag }

    //analytics
    getGTMData(cartSession)
    {
        const obj = [];
        const ecomm_prodid = [];
        cartSession.itemsList.forEach(element =>
        {
            obj.push({
                'id': element.productId,
                'name': element.productName,
                'price': element.productUnitPrice,
                //'variant': this.appliedPromoCode.promoCode,TODO
                'quantity': element.productQuantity
            });
            ecomm_prodid.push(element.productId)
        });
        const google_tag_params = {
            ecomm_prodid: ecomm_prodid,
            ecomm_pagetype: 'cart',
            ecomm_totalvalue: parseFloat(cartSession.cart.totalAmount)
        };

        setTimeout(() =>
        {
            let data = {
                'event': 'dyn_remk',
                'ecomm_prodid': google_tag_params.ecomm_prodid,
                'ecomm_pagetype': google_tag_params.ecomm_pagetype,
                'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
                'google_tag_params': google_tag_params
            }
            this._globalAnalyticeService.sendGTMCall(data)
        }, 3000);
    }

    sendTrackData(cartSession)
    {
        var trackData = {
            event_type: "page_load",
            page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
            label: "view",
            channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "0",
            quantity: cartSession["noOfItems"],
            shipping: parseFloat(cartSession["shippingCharges"]),
            itemList: cartSession.itemsList.map(item =>
            {
                return {
                    category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                    category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                    category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                    price: item["totalPayableAmount"].toString(),
                    quantity: item["productQuantity"]
                }
            })
        }
        this._globalAnalyticeService.sendToClicstreamViaSocket(trackData);
    }
}
