import { CartNoItemModule } from './../../modules/shared-checkout-quickorder/cart-no-item/cart-no-item.module';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { routing } from "./quickOrder.routing";
import { QuickOrderComponent } from "./quickOrder.component";
import { ObjectToArrayPipeModule } from '@utils/pipes/object-to-array.pipe';
import { MathFloorPipeModule } from '@utils/pipes/math-floor';
import { CartUpdatesModule } from '@modules/shared-checkout-quickorder/cart-updates/cartUpdates.module';
import { UnAvailableItemsModule } from '@modules/unAvailableItems/unAvailableItems.module';

// Newly created Modules
import { CartModule } from '@modules/shared-checkout-quickorder/cart/cart.module';
import { OrderSummaryModule } from '@modules/shared-checkout-quickorder/orderSummary/orderSummary.module';

@NgModule({
    imports: [
        routing,
        CommonModule,
        // Usable UI modules
        CartModule,
        CartNoItemModule,
        CartUpdatesModule,
        OrderSummaryModule,
        // Custom utils modules added
        ObjectToArrayPipeModule,
        MathFloorPipeModule,
    ],
    declarations: [
        QuickOrderComponent,
    ],
})

export class QuickOrderModule { }