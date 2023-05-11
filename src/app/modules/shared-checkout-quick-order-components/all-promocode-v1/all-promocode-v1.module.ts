import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllPromocodeV1Component } from './all-promocode-v1.component';
import { PromoCodeModule } from "../promoCode/promoCode.module";



@NgModule({
    declarations: [AllPromocodeV1Component],
    imports: [
        CommonModule,
        PromoCodeModule
    ],
    exports: [AllPromocodeV1Component]
})
export class AllPromocodeV1Module { }
