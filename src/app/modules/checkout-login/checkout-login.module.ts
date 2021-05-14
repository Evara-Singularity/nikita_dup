import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutLoginComponent } from './checkout-login.component';
import { SharedAuthModule } from '../shared-auth/shared-auth.module';

@NgModule({
  declarations: [CheckoutLoginComponent],
  imports: [
    CommonModule,
    SharedAuthModule
  ],
  exports: [CheckoutLoginComponent],
})
export class CheckoutLoginModule { }
