import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutLoginRoutingModule } from './checkout-login-routing.module';
import { CheckoutLoginComponent } from './checkout-login.component';


@NgModule({
  declarations: [CheckoutLoginComponent],
  imports: [
    CommonModule,
    CheckoutLoginRoutingModule
  ]
})
export class CheckoutLoginModule { }
