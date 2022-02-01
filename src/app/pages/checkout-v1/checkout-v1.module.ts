import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CheckoutLoginV2Module } from '@app/modules/checkout-login-v2/checkout-login-v2.module';
import { CartModule } from '../../modules/cart/cart.module';
import { CartUpdatesModule } from '../../modules/cartUpdates/cartUpdates.module';
import { CheckoutHeaderModule } from '../../modules/checkout-header/checkout-header.module';
import { ContinueModule } from '../../modules/continue/continue.module';
import { DeliveryAddressModule } from '../../modules/deliveryAddress/deliveryAddress.module';
import { InvoiceTypeModule } from '../../modules/invoiceType/invoiceType.module';
import { OrderSummaryModule } from '../../modules/orderSummary/orderSummary.module';
import { PaymentModule } from '../../modules/payments/payment.module';
import { SharedAuthModule } from '../../modules/shared-auth/shared-auth.module';
import { UnAvailableItemsModule } from '../../modules/unAvailableItems/unAvailableItems.module';
import { LoginModule } from '../login/login.module';
import { CheckoutV1RoutingModule } from './checkout-v1-routing.module';
import { CheckoutV1Component } from './checkout-v1.component';

@NgModule({
  declarations: [CheckoutV1Component],
  imports: [
    CommonModule,
    CheckoutV1RoutingModule,
    FormsModule,
    ReactiveFormsModule,
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
    CheckoutLoginV2Module,
  ],
  providers: [
  ]
})
export class CheckoutV1Module { }
