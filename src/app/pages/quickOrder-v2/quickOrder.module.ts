import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { routing } from "./quickOrder.routing";

import { QuickOrderComponent } from "./quickOrder.component";
import { QuickOrderService } from "./quickOrder.service";
import { QuickOrderResolver } from './quickOrder.resolver';
import { ObjectToArrayPipeModule } from '@utils/pipes/object-to-array.pipe';
import { MathFloorPipeModule } from '@utils/pipes/math-floor';
import { CartUpdatesModule } from '@modules/cartUpdates/cartUpdates.module';
import { UnAvailableItemsModule } from '@modules/unAvailableItems/unAvailableItems.module';

// Newly created Modules
import { CartModule } from '@modules/shared-checkout-quickorder/cart/cart.module';
import { SharedCartModule } from '@modules/shared-checkout-quickorder/shared-cart.module';
import { OrderSummaryModule } from '@modules/shared-checkout-quickorder/orderSummary/orderSummary.module';

@NgModule({
    imports: [
        CommonModule,
        SharedCartModule,
        routing,
        ObjectToArrayPipeModule,
        MathFloorPipeModule,
        OrderSummaryModule,
        FormsModule,
        CartModule,
        CartUpdatesModule,
        UnAvailableItemsModule,
    ],
    declarations: [
        QuickOrderComponent,
    ],
    providers: [
        QuickOrderResolver,
        QuickOrderService,
    ]
})

export class QuickOrderModule { }