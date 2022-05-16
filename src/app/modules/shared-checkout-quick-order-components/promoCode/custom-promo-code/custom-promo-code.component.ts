import { CartService } from '@app/utils/services/cart.service';
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'custom-promo-code',
    templateUrl: './custom-promo-code.component.html',
    styleUrls: ['./custom-promo-code.component.scss'],
})
export class CustomPromoCodeComponent implements OnInit {
    constructor(public _cartService: CartService) {}

    ngOnInit(): void
    {
        if(!this._cartService.isPromoCodeApplied){
            this._cartService.appliedPromoCode = "";
        }
    }
}
