import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PaytmUpiComponent} from "./paytmUpi.component";
import {PaytmUpiService} from "./paytmUpi.service";
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { PaytmUpiFormModule } from '../paytmUpiForm/paytmUpiForm.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathCeilPipeModule,
        PaytmUpiFormModule
    ],
    declarations: [
        PaytmUpiComponent
    ],
    exports:[
        PaytmUpiComponent
    ],
    providers: [
        PaytmUpiService
    ]
})

export class PaytmUpiModule{}