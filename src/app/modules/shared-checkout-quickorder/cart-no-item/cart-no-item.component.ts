import { CartService } from '@services/cart.service';
import { CONSTANTS } from '@config/constants';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'cart-no-item',
    templateUrl: './cart-no-item.component.html',
    styleUrls: ['./cart-no-item.component.scss'],
})

export class CartNoItemComponent {
    imagePath = CONSTANTS.IMAGE_BASE_URL;

    constructor(public cartService: CartService){}
}