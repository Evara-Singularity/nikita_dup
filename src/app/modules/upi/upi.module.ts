import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {UpiComponent} from "./upi.component";
import {UpiService} from "./upi.service";
import {TezUpiFormModule} from "../tezUpiForm/tezUpiForm.module";
import { RazorPayFormModule } from '../razorPayForm/razorPayForm.module';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { LoaderModule } from '../loader/loader.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TezUpiFormModule,
        MathCeilPipeModule,
        LoaderModule,
        RazorPayFormModule
    ],
    declarations: [
        UpiComponent
    ],
    exports:[
        UpiComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: [
        UpiService
    ]
})

export class UpiModule{}