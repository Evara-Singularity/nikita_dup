import { CartUpdatesModule } from '@modules/shared-checkout-quickorder/cart-updates/cartUpdates.module';
import { CartNoItemModule } from '@modules/shared-checkout-quickorder/cart-no-item/cart-no-item.module';
import { MathCeilPipeModule } from '@utils/pipes/math-ceil';
import { OrderSummaryModule } from '@modules/shared-checkout-quickorder/orderSummary/orderSummary.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutAddressRoutingModule } from './checkout-address-routing.module';
import { CheckoutAddressComponent } from './checkout-address.component';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';
import { SharedCheckoutQuickorderModule } from '@app/modules/shared-checkout-quickorder/shared-checkout-quickorder.module';
import { CartModule } from '@modules/shared-checkout-quickorder/cart/cart.module';
import { CheckoutAddressCtaComponent } from './checkout-address-cta/checkout-address-cta.component';

@NgModule({
  declarations: [CheckoutAddressComponent, CheckoutAddressCtaComponent],
  imports: [
    CommonModule,
    CartModule,
    CartNoItemModule,
    OrderSummaryModule,
    CartUpdatesModule,
    CheckoutAddressRoutingModule,
    SharedCheckoutAddressModule,
    SharedCheckoutQuickorderModule,
    MathCeilPipeModule
  ]
})
export class CheckoutAddressModule { }
