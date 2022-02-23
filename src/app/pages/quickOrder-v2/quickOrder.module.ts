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
import { CartModule } from '@components/shared-cart-v2//cart/cart.module';
import { SharedCartModule } from '@components/shared-cart-v2/shared-cart.module';
import { OrderSummaryModule } from '@components/shared-cart-v2/orderSummary/orderSummary.module';

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