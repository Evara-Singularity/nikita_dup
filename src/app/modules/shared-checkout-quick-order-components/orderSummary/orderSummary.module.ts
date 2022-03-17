import { RouterModule } from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderSummaryComponent} from './orderSummary.component';
import {OrderSummaryService} from './orderSummary.service';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { MathFloorPipeModule } from '@pipes/math-floor';
import { PromoCodeModule } from '@app/modules/shared-checkout-quick-order-components/promoCode/promoCode.module';

@NgModule({
    imports: [
        CommonModule,
        MathCeilPipeModule,
        MathFloorPipeModule,
        RouterModule,
        PromoCodeModule
    ],
    declarations: [
        OrderSummaryComponent,
    ],
    exports: [
        OrderSummaryComponent
    ],
    providers: [
        OrderSummaryService
    ]
})

export class OrderSummaryModule {}
