import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutAddressRoutingModule } from './checkout-address-routing.module';
import { CheckoutAddressComponent } from './checkout-address.component';


@NgModule({
  declarations: [CheckoutAddressComponent],
  imports: [
    CommonModule,
    CheckoutAddressRoutingModule
  ]
})
export class CheckoutAddressModule { }
