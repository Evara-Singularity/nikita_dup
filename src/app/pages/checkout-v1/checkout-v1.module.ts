import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CheckoutLoginV2Module } from '@app/modules/checkout-login-v2/checkout-login-v2.module';
import { CartUpdatesModule } from '../../modules/cartUpdates/cartUpdates.module';
import { CheckoutHeaderModule } from '../../modules/checkout-header/checkout-header.module';
import { ContinueModule } from '../../modules/continue/continue.module';
import { DeliveryAddressModule } from '../../modules/deliveryAddress/deliveryAddress.module';
import { InvoiceTypeModule } from '../../modules/invoiceType/invoiceType.module';
import { PaymentModule } from '../../modules/payments/payment.module';
import { UnAvailableItemsModule } from '../../modules/unAvailableItems/unAvailableItems.module';
import { CheckoutV1RoutingModule } from './checkout-v1-routing.module';
import { CheckoutV1Component } from './checkout-v1.component';

@NgModule({
  declarations: [CheckoutV1Component],
  imports: [
    CommonModule,
    CheckoutV1RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    PaymentModule,
    DeliveryAddressModule,
    ContinueModule,
    RouterModule,
    InvoiceTypeModule,
    CartUpdatesModule,
    UnAvailableItemsModule,
    CheckoutHeaderModule,
    CheckoutLoginV2Module,
  ],
  providers: [
  ]
})
export class CheckoutV1Module { }
