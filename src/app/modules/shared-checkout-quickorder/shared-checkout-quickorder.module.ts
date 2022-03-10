import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartListComponent } from './cart-list/cart-list.component';
import { NotficationsComponent } from './notfications/notfications.component';
import { CouponsComponent } from './coupons/coupons.component';
import { OffersComponent } from './offers/offers.component';



@NgModule({
  declarations: [CartListComponent, NotficationsComponent, CouponsComponent, OffersComponent],
  imports: [
    CommonModule
  ],
})
export class SharedCheckoutQuickorderModule { }
