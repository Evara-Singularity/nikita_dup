import { NotificationsModule } from '@app/modules/shared-checkout-quick-order-components/notifications/notifications.module';
import { CartNoItemModule } from '@app/modules/shared-checkout-quick-order-components/cart-no-item/cart-no-item.module';
import { MathCeilPipeModule } from '@utils/pipes/math-ceil';
import { OrderSummaryModule } from '@app/modules/shared-checkout-quick-order-components/orderSummary/orderSummary.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutAddressRoutingModule } from './checkout-address-routing.module';
import { CheckoutAddressComponent } from './checkout-address.component';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';
<<<<<<< HEAD
import { SharedCheckoutQuickorderModule } from '@app/modules/shared-checkout-quickorder/shared-checkout-quickorder.module';
import { CartModule } from '@modules/shared-checkout-quickorder/cart/cart.module';
=======
import { CartModule } from '@app/modules/shared-checkout-quick-order-components/cart/cart.module';
import { CheckoutAddressCtaComponent } from './checkout-address-cta/checkout-address-cta.component';
import { CartNotificationsModule } from '@app/modules/shared-checkout-quick-order-components/cart-notifications/cart-notifications.module';
>>>>>>> b444579e4bab5275ee6518df8aac9ca890af5d41

@NgModule({
  declarations: [CheckoutAddressComponent],
  imports: [
    CommonModule,
    CartModule,
    CartNoItemModule,
    OrderSummaryModule,
    CartNotificationsModule,
    CheckoutAddressRoutingModule,
    SharedCheckoutAddressModule,
    NotificationsModule,
    MathCeilPipeModule
  ]
})
export class CheckoutAddressModule { }
