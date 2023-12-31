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
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PaytmWalletFormModule,
        PayuWalletFormModule,
        RazorPayFormModule,
        MathRoundPipeModule,
        MobikwikWalletFormModule,
        ObjectToArrayPipeModule,
        LowSuccessMessagePipeModule,
        PrepaidOfferCheckoutModule
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