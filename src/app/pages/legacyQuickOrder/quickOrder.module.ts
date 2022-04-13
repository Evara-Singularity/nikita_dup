import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { routing } from "./quickOrder.routing";

import { QuickOrderComponent } from "./quickOrder.component";
import { QuickOrderService } from "./quickOrder.service";
import { QuickOrderResolver } from './quickOrder.resolver';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { CartModule } from '../../modules/legacyCart/cart.module';
import { CartUpdatesModule } from '../../modules/cartUpdates/cartUpdates.module';
import { UnAvailableItemsModule } from '../../modules/unAvailableItems/unAvailableItems.module';
import { OrderSummaryModule } from '../../modules/legacyOrderSummary/orderSummary.module';
import { SharedCheckoutQuickorderModule } from '@app/modules/shared-checkout-quickorder-components/shared-checkout-quickorder.module';

@NgModule({
    imports: [
        CommonModule,
        routing,
        ObjectToArrayPipeModule,
        MathFloorPipeModule,
        OrderSummaryModule,
        FormsModule,
        CartModule,
        CartUpdatesModule,
        UnAvailableItemsModule,
        // SharedCheckoutQuickorderModule,
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