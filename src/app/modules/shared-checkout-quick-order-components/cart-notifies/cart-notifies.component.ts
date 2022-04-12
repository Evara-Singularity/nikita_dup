import { Subscription, forkJoin, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';

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
    is_quickorder = true;
    @Output("viewUnavailableItems$") viewUnavailableItems$: EventEmitter<string[]> = new EventEmitter<string[]>();
    constructor(public _cartService: CartService, private _router: Router) { }

    ngOnInit() {
        this.is_quickorder = this._router.url.includes("quickorder");
        this.notificationSubscription = this._cartService.getCartNotificationsSubject().subscribe((notifications: any[]) => {
            this.notfications = notifications || [];
        })
    }

    viewUnavailableItems() { 
        const VIEW_ITEMS_TYPE = this.is_quickorder ? ['oos'] :['oos', 'unserviceable'];
        this.viewUnavailableItems$.emit(VIEW_ITEMS_TYPE); 
    }
    
    get displayNotifications() { return this.notfications.length > 0 }
    displaySecondaryNotifications(type: string) { return this.SECONDARY_NOTIFICATIONS.includes(type) }
    ngOnDestroy()
    {
        if (this.notificationSubscription) this.notificationSubscription.unsubscribe();
    }
}
