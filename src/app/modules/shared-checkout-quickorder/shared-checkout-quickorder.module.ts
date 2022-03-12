import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartListComponent } from './cart-list/cart-list.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CouponsComponent } from './coupons/coupons.component';
import { OffersComponent } from './offers/offers.component';



@NgModule({
    declarations: [CartListComponent, NotificationsComponent, CouponsComponent, OffersComponent],
    imports: [CommonModule],
    exports: [CartListComponent, NotificationsComponent, CouponsComponent, OffersComponent],
})
export class SharedCheckoutQuickorderModule { }
