import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutPaymentRoutingModule } from './checkout-payment-routing.module';
import { CheckoutPaymentComponent } from './checkout-payment.component';
import { PaymentModule } from '@app/modules/payments/payment.module';


@NgModule({
  declarations: [CheckoutPaymentComponent],
  imports: [
    CommonModule,
    CheckoutPaymentRoutingModule,
    PaymentModule,
  ]
})
export class CheckoutPaymentModule { }
