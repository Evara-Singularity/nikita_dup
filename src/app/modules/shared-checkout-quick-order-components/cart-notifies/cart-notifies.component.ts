import { Subscription, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { CartNotificationService } from '@app/utils/services/cart-notification.service';

@Component({
    selector: 'cart-notifies',
    templateUrl: './cart-notifies.component.html',
    styleUrls: ['./cart-notifies.component.scss']
})
export class CartNotifiesComponent implements OnInit, OnDestroy
{
    readonly SECONDARY_NOTIFICATIONS = ['shipping', 'coupon', 'shippingcoupon'];
    notificationSubscription: Subscription = null;
    notfications = [];
    @Output("viewUnavailableItems$") viewUnavailableItems$: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(public _cartService: CartService, private _router: Router) { }

    ngOnInit()
    {
        const is_quickorder = this._router.url.includes("quickorder");
        if (!is_quickorder) {
            this.notificationSubscription = forkJoin([this._cartService.getUnserviceableNotifcations(), this._cartService.getCartNotifications()])
                .subscribe((responses) => { this.notfications = [...responses[0], ...responses[1]] });
            return;
        }
        this.notificationSubscription = this._cartService.getCartNotifications().subscribe((notifications: any[]) =>
        {
            this.notfications = notifications || [];
        })
    }
    viewUnavailableItems() { this.viewUnavailableItems$.emit(true); }
    get displayNotifications() { return this.notfications.length > 0 }
    displaySecondaryNotifications(type: string) { return this.SECONDARY_NOTIFICATIONS.includes(type) }
    ngOnDestroy() { if (this.notificationSubscription) this.notificationSubscription.unsubscribe(); }
}
