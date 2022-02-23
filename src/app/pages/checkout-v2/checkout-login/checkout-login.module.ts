import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutLoginRoutingModule } from './checkout-login-routing.module';
import { CheckoutLoginComponent } from './checkout-login.component';
import { SharedAuthModule } from '@app/modules/shared-auth-v1/shared-auth.module';


@NgModule({
  declarations: [CheckoutLoginComponent],
  imports: [
    CommonModule,
    CheckoutLoginRoutingModule,
    SharedAuthModule
  ]
})
export class CheckoutLoginModule { }
