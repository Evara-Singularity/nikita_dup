import { CartService } from '@app/utils/services/cart.service';
import { Component } from '@angular/core';
@Component({
    selector: 'custom-promo-code',
    templateUrl: './custom-promo-code.component.html',
    styleUrls: ['./custom-promo-code.component.scss'],
})
export class CustomPromoCodeComponent {
    constructor(public _cartService: CartService) {}
}
