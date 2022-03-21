import { Component, EventEmitter, Output } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalState } from '@utils/global.state';

@Component({
    selector: 'cart-notifications',
    templateUrl: 'cart-notifications.html',
    styleUrls: ['./cart-notifications.scss'],
})

export class CartNotificationsComponent
{
    @Output("viewUnavailableItems$") viewUnavailableItems$: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(public _cartService: CartService, public _state: GlobalState,) { }
    ngOnInit() { }
    viewUnavailableItems() { this.viewUnavailableItems$.emit(true); }
}
