import { LowSuccessMessagePipeModule } from '../../../utils/pipes/low-success-rate.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {UpiComponent} from "./upi.component";
import {TezUpiFormModule} from "../payment-forms/tezUpiForm/tezUpiForm.module";
import { RazorPayFormModule } from '../payment-forms/razorPayForm/razorPayForm.module';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TezUpiFormModule,
        MathCeilPipeModule,
        RazorPayFormModule,
        ObjectToArrayPipeModule,
        LowSuccessMessagePipeModule,
        PrepaidOfferCheckoutModule
    ],
    declarations: [
        UpiComponent
    ],
    exports:[
        UpiComponent
    ],
    providers: []
})

export class UpiModule{}