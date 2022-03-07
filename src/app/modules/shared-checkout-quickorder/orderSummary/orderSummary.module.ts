import { RouterModule } from '@angular/router';

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderSummaryComponent} from './orderSummary.component';
import {OrderSummaryService} from './orderSummary.service';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromoOfferModule } from '@modules/shared-checkout-quickorder/promoOffers/promo-offer.module';
// import { PromoApplyModule } from '../promoApply/promo-apply.module';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { MathFloorPipeModule } from '@pipes/math-floor';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathCeilPipeModule,
        MathFloorPipeModule,
        RouterModule,
        PromoOfferModule,
        // PromoApplyModule
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
