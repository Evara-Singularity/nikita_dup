import { Component, ComponentFactoryResolver, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@app/utils/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'cart-notifications',
    templateUrl: 'cart-notifications.html',
    styleUrls: ['./cart-notifications.scss'],
})

export class CartNotificationsComponent implements OnInit,  OnDestroy
{
    readonly SECONDARY_NOTIFICATIONS = ['shipping', 'coupon', 'shippingcoupon'];
    notificationSubscription: Subscription = null;
    notfications = [];
    is_quickorder = true;
    @Output("viewUnavailableItems$") viewUnavailableItems$: EventEmitter<string[]> = new EventEmitter<string[]>();

     // on demand loading of wishlistPopup
     simillarProductsPopupInstance = null;
     @ViewChild("simillarProductsPopup", { read: ViewContainerRef })
     simillarProductsPopupContainerRef: ViewContainerRef;
     
    constructor(
        public _cartService: CartService,
        private _router: Router,
        private injector: Injector,
        private cfr: ComponentFactoryResolver,
        ) { }
    
    ngOnInit()
    {
        this.is_quickorder = this._router.url.includes("quickorder");
        this.notificationSubscription = this._cartService.getCartNotificationsSubject().subscribe((notifications: any[]) =>
        {
            this.notfications = notifications || [];
        })

    }

    viewUnavailableItems()
    {
        const VIEW_ITEMS_TYPE = this.is_quickorder ? ['oos'] : ['oos', 'unserviceable'];
        this.viewUnavailableItems$.emit(VIEW_ITEMS_TYPE);
    }

    get displayNotifications() { return this.notfications.length > 0 }

    displaySecondaryNotifications(type: string) { return this.SECONDARY_NOTIFICATIONS.includes(type) }

    ngOnDestroy()
    {
        this._cartService.clearNotifications();
        if (this.notificationSubscription) this.notificationSubscription.unsubscribe();
        if(this.simillarProductsPopupInstance){
            this.simillarProductsPopupInstance = null;
            this.simillarProductsPopupContainerRef.remove();
        }
    }

    async openSimillarProductsPopUp(msnid , data){
        const { SimillarProductsPopupComponent } = await import(
            "../../../components/simillar-products-popup/simillar-products-popup.component"
      ).finally();
      const factory = this.cfr.resolveComponentFactory(SimillarProductsPopupComponent);
      this.simillarProductsPopupInstance =
          this.simillarProductsPopupContainerRef.createComponent(
              factory,
              null,
              this.injector
          );
      this.simillarProductsPopupInstance.instance["msnid"] = msnid; 
      this.simillarProductsPopupInstance.instance["productName"] = data.productName;
      (
        this.simillarProductsPopupInstance.instance[
        "closePopup$"
        ] as EventEmitter<any>
      ).subscribe(res=>{
        this.simillarProductsPopupContainerRef.remove();
        this.simillarProductsPopupInstance = null;
      })
    }

}
