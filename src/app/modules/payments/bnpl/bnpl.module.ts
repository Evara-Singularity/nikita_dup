import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BnplComponent} from "./bnpl.component";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathRoundPipeModule,
        PayuFormModule,
        PrepaidOfferCheckoutModule
    ],
    declarations: [
        BnplComponent
    ],
    exports:[
        BnplComponent
    ],
    providers: []
})

export class BnplModule{}