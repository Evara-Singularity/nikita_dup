import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PaytmUpiComponent} from "./paytmUpi.component";
import { PaytmUpiFormModule } from '../payment-forms/paytmUpiForm/paytmUpiForm.module';
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathRoundPipeModule,
        PaytmUpiFormModule,
        PrepaidOfferCheckoutModule
    ],
    declarations: [
        PaytmUpiComponent
    ],
    exports:[
        PaytmUpiComponent
    ],
    providers: []
})

export class PaytmUpiModule{}