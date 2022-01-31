import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutLoginV2Component } from './checkout-login-v2.component';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';

@NgModule({
  imports: [
    CommonModule,
    SharedAuthModule,
  ],
  declarations: [CheckoutLoginV2Component],
  exports: [
    CheckoutLoginV2Component
  ]
})
export class CheckoutLoginV2Module { }
