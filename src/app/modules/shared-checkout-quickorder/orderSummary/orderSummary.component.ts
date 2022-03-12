import { PromoCodeService } from '@modules/shared-checkout-quickorder/promoCode/promo-code.service';
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
    orderSummaryData;

    constructor(
        public router: Router,
        private _cartService: CartService,
        public _promoCodeService: PromoCodeService,
        private _commonService: CommonService,
    ) {}

    ngOnInit(): void {
        this.orderSummaryData = this._cartService.getGenericCartSession;
    }

    openOfferPopUp() {
        if (this._commonService.userSession.authenticated == "true") {
            this.showPromoOfferPopup = true;
        } else {
            this.router.navigate(["/login"]);
        }
    }

    handleApplyCustomPromoCode(promoCode) {
        alert(promoCode);
    }

    handleRemoveCustomPromoCode(promoCode) {
        alert(promoCode);
    }
}
