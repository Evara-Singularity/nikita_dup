import { RouterModule } from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderSummaryComponent} from './orderSummary.component';
import {OrderSummaryService} from './orderSummary.service';
import { PromoCodeModule } from '@app/modules/shared-checkout-quick-order-components/promoCode/promoCode.module';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';

@NgModule({
    imports: [
        CommonModule,
        MathRoundPipeModule,
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
