import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutV2RoutingModule } from './checkout-v2-routing.module';
import { CheckoutV2Component } from './checkout-v2.component';
import { IsAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-login.guard';


@NgModule({
  declarations: [CheckoutV2Component],
  imports: [
    CommonModule,
    CheckoutV2RoutingModule,
  ],
  providers: [
    IsAuthenticatedCheckoutLogin
  ]
})
export class CheckoutV2Module { }
