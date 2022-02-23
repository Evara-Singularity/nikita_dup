import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutPaymentRoutingModule } from './checkout-payment-routing.module';
import { CheckoutPaymentComponent } from './checkout-payment.component';


@NgModule({
  declarations: [CheckoutPaymentComponent],
  imports: [
    CommonModule,
    CheckoutPaymentRoutingModule
  ]
})
export class CheckoutPaymentModule { }
