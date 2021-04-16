import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutLoginComponent } from './checkout-login.component';
import { CheckoutLoginService } from '../../utils/services/checkout-login.service';
import { LoaderModule } from '../loader/loader.module';
import { SharedAuthModule } from '../shared-auth/shared-auth.module';

@NgModule({
  declarations: [CheckoutLoginComponent],
  imports: [
    CommonModule,
    LoaderModule,
    SharedAuthModule
  ],
  exports: [CheckoutLoginService],
})
export class CheckoutLoginModule { }
