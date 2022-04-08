import { Router } from '@angular/router';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';

@Component({
    selector: 'cart-notifies',
    templateUrl: './cart-notifies.component.html',
    styleUrls: ['./cart-notifies.component.scss']
})
export class CartNotifiesComponent implements OnInit
{
    private is_quickorder = true;
    @Output("viewUnavailableItems$") viewUnavailableItems$: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(public _cartService: CartService, private _router: Router) { }
    ngOnInit() { this.is_quickorder = this._router.url.includes("quickorder"); }
    viewUnavailableItems() { this.viewUnavailableItems$.emit(true); }
    getNotifications() { return this._cartService.itemsValidationMessage; }
}
