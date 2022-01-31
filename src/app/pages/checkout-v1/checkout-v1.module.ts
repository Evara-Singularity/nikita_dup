import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutV1RoutingModule } from './checkout-v1-routing.module';
import { CheckoutV1Component } from './checkout-v1.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocialLoginModule } from '../../modules/socialLogin/socialLogin.module';
import { CartModule } from '../../modules/cart/cart.module';
import { OrderSummaryModule } from '../../modules/orderSummary/orderSummary.module';
import { PaymentModule } from '../../modules/payments/payment.module';
import { DeliveryAddressModule } from '../../modules/deliveryAddress/deliveryAddress.module';
import { ContinueModule } from '../../modules/continue/continue.module';
import { LoginModule } from '../login/login.module';
import { RouterModule } from '@angular/router';
import { InvoiceTypeModule } from '../../modules/invoiceType/invoiceType.module';
import { CartUpdatesModule } from '../../modules/cartUpdates/cartUpdates.module';
import { UnAvailableItemsModule } from '../../modules/unAvailableItems/unAvailableItems.module';
import { SharedAuthModule } from '../../modules/shared-auth/shared-auth.module';
import { CheckoutHeaderModule } from '../../modules/checkout-header/checkout-header.module';
import { CheckoutLoginModule } from '../../modules/checkout-login/checkout-login.module';
import { CheckoutLoginV2Module } from '@app/modules/checkout-login-v2/checkout-login-v2.module';


@NgModule({
  declarations: [CheckoutV1Component],
  imports: [
    CommonModule,
    CheckoutV1RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SocialLoginModule,
    CartModule,
    OrderSummaryModule,
    PaymentModule,
    DeliveryAddressModule,
    ContinueModule,
    LoginModule,
    RouterModule,
    InvoiceTypeModule,
    CartUpdatesModule,
    UnAvailableItemsModule,
    SharedAuthModule,
    CheckoutHeaderModule,
    //CheckoutLoginModule
    CheckoutLoginV2Module,
  ],
  providers: [
  ]
})
export class CheckoutV1Module { }
