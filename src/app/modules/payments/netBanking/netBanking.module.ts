import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NetBankingComponent} from "./netBanking.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import { RazorPayFormModule } from '../payment-forms/razorPayForm/razorPayForm.module';
import { ObjectToArrayPipeModule } from '../../../utils/pipes/object-to-array.pipe';
import { SelectPopupModule } from '../../select-popup/select-popup.module';
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ObjectToArrayPipeModule,
        PayuFormModule,
        RazorPayFormModule,
        MathRoundPipeModule,
        SelectPopupModule,
        PrepaidOfferCheckoutModule
    ],
    declarations: [
        NetBankingComponent,
    ],
    exports:[
        NetBankingComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: []
})

export class NetBankingModule{}