import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoOfferComponent } from './promo-offer.component';
import { PromoOfferService } from './promo-offer.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromoApplyModule } from '../promoApply/promo-apply.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PromoApplyModule
    ],
    exports: [
        PromoOfferComponent
    ],
    declarations: [
        PromoOfferComponent
    ],
    providers: [
        PromoOfferService
    ]
})
export class PromoOfferModule {}
