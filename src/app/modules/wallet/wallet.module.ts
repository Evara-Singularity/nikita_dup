import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {WalletComponent} from "./wallet.component";
import {WalletService} from "./wallet.service";
import {PaytmWalletFormModule} from "../paytmWalletForm/paytmWalletForm.module";
import {MobikwikWalletFormModule} from "../mobikwikWalletForm/mobikwikWalletForm.module";
import {PayuWalletFormModule} from "../payuWalletForm/payuWalletForm.module";
import { RazorPayFormModule } from '../razorPayForm/razorPayForm.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';


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
    ],
    declarations: [
        WalletComponent
    ],
    exports:[
        WalletComponent
    ],
    providers: [
        WalletService
    ]
})

export class WalletModule{}