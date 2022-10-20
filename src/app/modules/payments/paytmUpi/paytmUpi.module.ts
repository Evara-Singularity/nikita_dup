import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PaytmUpiComponent} from "./paytmUpi.component";
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { PaytmUpiFormModule } from '../payment-forms/paytmUpiForm/paytmUpiForm.module';
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathCeilPipeModule,
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