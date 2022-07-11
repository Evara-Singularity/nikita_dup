import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';
import { CartNoItemModule } from '@app/modules/shared-checkout-quick-order-components/cart-no-item/cart-no-item.module';
import { CartNotificationsModule } from '@app/modules/shared-checkout-quick-order-components/cart-notifications/cart-notifications.module';
import { CartModule } from '@app/modules/shared-checkout-quick-order-components/cart/cart.module';
import { OrderSummaryModule } from '@app/modules/shared-checkout-quick-order-components/orderSummary/orderSummary.module';
import { GenericOffersModule } from '@app/modules/ui/generic-offers/generic-offers.component';
import { MathCeilPipeModule } from '@utils/pipes/math-ceil';
import { SharedCheckoutStepperModule } from './../../../modules/shared-checkout-stepper/shared-checkout-stepper.module';
import { SharedCheckoutUnavailableItemsModule } from './../../../modules/shared-checkout-unavailable-items/shared-checkout-unavailable-items.module';
import { CheckoutAddressRoutingModule } from './checkout-address-routing.module';
import { CheckoutAddressComponent } from './checkout-address.component';

@NgModule({
  declarations: [CheckoutAddressComponent],
  imports: [
    CommonModule,
    CartModule,
    CartNoItemModule,
    OrderSummaryModule,
    GenericOffersModule,
    CartNotificationsModule,
    CheckoutAddressRoutingModule,
    SharedCheckoutAddressModule,
    SharedCheckoutStepperModule,
    SharedCheckoutUnavailableItemsModule,
    MathCeilPipeModule
  ]
})
export class CheckoutAddressModule { }
