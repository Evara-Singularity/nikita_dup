import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';
import { CartNoItemModule } from '@app/modules/shared-checkout-quick-order-components/cart-no-item/cart-no-item.module';
import { CartNotificationsModule } from '@app/modules/shared-checkout-quick-order-components/cart-notifications/cart-notifications.module';
import { CartModule } from '@app/modules/shared-checkout-quick-order-components/cart/cart.module';
import { NotificationsModule } from '@app/modules/shared-checkout-quick-order-components/notifications/notifications.module';
import { OrderSummaryModule } from '@app/modules/shared-checkout-quick-order-components/orderSummary/orderSummary.module';
import { MathCeilPipeModule } from '@utils/pipes/math-ceil';
import { CheckoutAddressRoutingModule } from './checkout-address-routing.module';
import { CheckoutAddressComponent } from './checkout-address.component';

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
