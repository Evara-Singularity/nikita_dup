import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutAddressRoutingModule } from './checkout-address-routing.module';
import { CheckoutAddressComponent } from './checkout-address.component';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';
import { SharedCheckoutQuickorderModule } from '@app/modules/shared-checkout-quickorder/shared-checkout-quickorder.module';


@NgModule({
  declarations: [CheckoutAddressComponent],
  imports: [
    CommonModule,
    CheckoutAddressRoutingModule,
    SharedCheckoutAddressModule,
    SharedCheckoutQuickorderModule
  ]
})
export class CheckoutAddressModule { }
