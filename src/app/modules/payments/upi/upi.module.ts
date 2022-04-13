import { LowSuccessMessagePipeModule } from '../../../utils/pipes/low-success-rate.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {UpiComponent} from "./upi.component";
import {TezUpiFormModule} from "../payment-forms/tezUpiForm/tezUpiForm.module";
import { RazorPayFormModule } from '../payment-forms/razorPayForm/razorPayForm.module';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TezUpiFormModule,
        MathCeilPipeModule,
        RazorPayFormModule,
        ObjectToArrayPipeModule,
        LowSuccessMessagePipeModule
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