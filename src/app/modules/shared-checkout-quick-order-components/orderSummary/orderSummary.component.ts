import { Component, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
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
            let link = this.router.url.replace('/', '');
            const queryParams = { backurl: link };
            let navigationExtras: NavigationExtras = {queryParams: queryParams};
            this.router.navigate(["/login"], navigationExtras);
        }
    }
}
