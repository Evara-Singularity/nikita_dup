import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {WalletComponent} from "./wallet.component";
import {PaytmWalletFormModule} from "../payment-forms/paytmWalletForm/paytmWalletForm.module";
import {MobikwikWalletFormModule} from "../../mobikwikWalletForm/mobikwikWalletForm.module";
import {PayuWalletFormModule} from "../payment-forms/payuWalletForm/payuWalletForm.module";
import { RazorPayFormModule } from '../payment-forms/razorPayForm/razorPayForm.module';
import { MathCeilPipeModule } from '../../../utils/pipes/math-ceil';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { LowSuccessMessagePipeModule } from '@app/utils/pipes/low-success-rate.pipe';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaytmWalletFormModule,
        PayuWalletFormModule,
        RazorPayFormModule,
        MathCeilPipeModule,
        MobikwikWalletFormModule,
        ObjectToArrayPipeModule,
        LowSuccessMessagePipeModule
    ],
    declarations: [
        WalletComponent
    ],
    exports:[
        WalletComponent
    ],
    providers: []
})

export class WalletModule{}