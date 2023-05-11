import { RouterModule } from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderSummaryComponent} from './orderSummary.component';
import {OrderSummaryService} from './orderSummary.service';
import { PromoCodeModule } from '@app/modules/shared-checkout-quick-order-components/promoCode/promoCode.module';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';
import { MockLottiePlayerModule } from "../../../components/mock-lottie-player/mock-lottie-player.module";

@NgModule({
    declarations: [
        OrderSummaryComponent,
    ],
    exports: [
        OrderSummaryComponent
    ],
    providers: [
        OrderSummaryService
    ],
    imports: [
        CommonModule,
        MathRoundPipeModule,
        RouterModule,
        PromoCodeModule,
        MockLottiePlayerModule
    ]
})

export class OrderSummaryModule {}
