import { Component, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { CartService } from '@app/utils/services/cart.service';
import { LocalAuthService } from '@app/utils/services/auth.service';

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
        private _localAuthService: LocalAuthService,
    ) {}

    ngOnInit(): void {
        this._cartService.getCartUpdatesChanges().subscribe(result => {
            this.updateShippingCharges();
        });
    }
    
    updateShippingCharges() {
        this.shippingCharges = 0;
        if (this._cartService.getGenericCartSession && this._cartService.getGenericCartSession.itemsList && this._cartService.getGenericCartSession.itemsList.length > 0) {
            this._cartService.getGenericCartSession.itemsList.forEach((item) => {
                this.shippingCharges = this.shippingCharges + (item.shippingCharges || 0);
            });
        }
    }

    openOfferPopUp() {
        if (this._commonService.userSession.authenticated == "true") {
            this.showPromoOfferPopup = true;
        } else {
            this._localAuthService.setBackURLTitle('/quickorder', null);
            this.router.navigate(["/login"]);
        }
    }
}
