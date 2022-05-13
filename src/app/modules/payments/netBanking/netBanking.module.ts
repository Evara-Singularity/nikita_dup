import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NetBankingComponent} from "./netBanking.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import { RazorPayFormModule } from '../payment-forms/razorPayForm/razorPayForm.module';
import { ObjectToArrayPipeModule } from '../../../utils/pipes/object-to-array.pipe';
import { MathCeilPipeModule } from '../../../utils/pipes/math-ceil';
import { SelectPopupModule } from '../../select-popup/select-popup.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ObjectToArrayPipeModule,
        PayuFormModule,
        RazorPayFormModule,
        MathCeilPipeModule,
        SelectPopupModule
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