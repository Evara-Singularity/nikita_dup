import { CartNoItemModule } from '../../modules/shared-checkout-quick-order-components/cart-no-item/cart-no-item.module';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { routing } from "./quickOrder.routing";
import { QuickOrderComponent } from "./quickOrder.component";
import { ObjectToArrayPipeModule } from '@utils/pipes/object-to-array.pipe';
import { MathFloorPipeModule } from '@utils/pipes/math-floor';

// Newly created Modules
import { CartNotificationsModule } from '@app/modules/shared-checkout-quick-order-components/cart-notifications/cart-notifications.module';
import { OrderSummaryModule } from '@app/modules/shared-checkout-quick-order-components/orderSummary/orderSummary.module';
import { SharedCheckoutUnavailableItemsModule } from '@app/modules/shared-checkout-unavailable-items/shared-checkout-unavailable-items.module';
import { CartModule } from '@app/modules/shared-checkout-quick-order-components/cart/cart.module';
import { GenericOffersModule } from '@app/modules/ui/generic-offers/generic-offers.component';

@NgModule({
    imports: [
        routing,
        CommonModule,
        // Usable UI modules
        CartModule,
        CartNoItemModule,
        GenericOffersModule,
        CartNotificationsModule,
        OrderSummaryModule,
        // Custom utils modules added
        ObjectToArrayPipeModule,
        MathFloorPipeModule,
        SharedCheckoutUnavailableItemsModule
    ],
    declarations: [
        QuickOrderComponent,
    ],
})

export class QuickOrderModule { }