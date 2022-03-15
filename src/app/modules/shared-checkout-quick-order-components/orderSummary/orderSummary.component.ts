import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { CartService } from '@app/utils/services/cart.service';

declare let dataLayer: any;


@Component({
    templateUrl: 'orderSummary.html',
    selector: 'order-summary',
    styleUrls: ['./orderSummary.scss'],
})
export class OrderSummaryComponent {
    shippingCharges: number = 0;
    showPromoOfferPopup: boolean = false;

    constructor(
        public router: Router,
        public _cartService: CartService,
        private _commonService: CommonService,
    ) {}

    ngOnInit(): void {
        this.updateShippingCharges();
    }

    updateShippingCharges() {
        if (!this._cartService.getGenericCartSession.itemList || !this._cartService.getGenericCartSession.length) {
            this.shippingCharges = 0;
            return;
        } 

        this.shippingCharges = this._cartService.getGenericCartSession.itemList.reduce((shippingCharges, item) => {
            shippingCharges +=  (item.shipping || 0);
        }, 0);
    }

    openOfferPopUp() {
        if (this._commonService.userSession.authenticated == "true") {
            this.showPromoOfferPopup = true;
        } else {
            this.router.navigate(["/login"]);
        }
    }
}
