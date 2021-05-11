import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PaytmUpiComponent} from "./paytmUpi.component";
import {PaytmUpiService} from "./paytmUpi.service";
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { LoaderModule } from '../loader/loader.module';
import { PaytmUpiFormModule } from '../paytmUpiForm/paytmUpiForm.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathCeilPipeModule,
        LoaderModule,
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