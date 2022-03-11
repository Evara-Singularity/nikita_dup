import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CartNotificationsModel } from '@app/utils/models/shared-checkout.models';
import { CartService } from '@services/cart.service';
import { Subscription } from 'rxjs';
import { LoggerService } from './../../../utils/services/logger.service';

@Component({
    selector: 'notfications',
    templateUrl: './notfications.component.html',
    styleUrls: ['./notfications.component.scss']
})
export class NotficationsComponent implements OnInit, AfterViewInit, OnDestroy
{
    cartNotifications: CartNotificationsModel = null;
    cartNotificationsSubscription: Subscription = null;

    constructor(private _loggerService: LoggerService, private _cartService: CartService) { }

    ngOnInit(): void
    {
    }

    ngAfterViewInit(): void
    {
        this.cartNotificationsSubscription = this._cartService.cartNotifications.subscribe((notifications: CartNotificationsModel) =>
        {
            this.cartNotifications = notifications;
            this._loggerService.info(this.cartNotifications);
        })
    }

    displayNonServiceableItems() { return this.cartNotifications.nonServiceableItems ? true : false; }
    displayNonCashDeliverableItems() { return this.cartNotifications.nonCashOnDeliverableItems ? true : false; }
    displaypriceUpdatedItems() { return this.cartNotifications.priceUpdatedItems ? true : false; }
    displayoutOfStockItems() { return this.cartNotifications.outOfStockItems ? true : false; }

    get nonServiceableItems() { return this.cartNotifications.nonServiceableItems }
    get nonCashonDeliverableItems() { return this.cartNotifications.nonCashOnDeliverableItems}
    get priceUpdateItems() { return this.cartNotifications.priceUpdatedItems }
    get outOfStockItems() { return this.cartNotifications.outOfStockItems }



    ngOnDestroy(): void
    {
        if (this.cartNotificationsSubscription) this.cartNotificationsSubscription.unsubscribe()
    }

}
