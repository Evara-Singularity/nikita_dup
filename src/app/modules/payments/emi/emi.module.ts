import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BankNameChangePipe, EmiComponent} from "./emi.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import {RazorPayFormModule} from "../payment-forms/razorPayForm/razorPayForm.module";
import { ObjectToArrayPipeModule } from '../../../utils/pipes/object-to-array.pipe';
import { BankNamePipeModule } from '../../../utils/pipes/bank.pipe';
import { MathCeilPipeModule } from '../../../utils/pipes/math-ceil';
import { KpAutocompleteOffDirectiveModule } from '../../../utils/directives/kpAutocompleteOff.directive';
import { SelectPopupModule } from '../../select-popup/select-popup.module';
import { SortByEMIMonthsPipeModule } from '@app/utils/pipes/emiSort.pipe';


@NgModule({
    imports: [
        CommonModule,
        ObjectToArrayPipeModule,
        FormsModule,
        ReactiveFormsModule,
        PayuFormModule,
        RazorPayFormModule,
        BankNamePipeModule,
        MathCeilPipeModule,
        MathFloorPipeModule,
        KpAutocompleteOffDirectiveModule,
        SelectPopupModule,
        SortByEMIMonthsPipeModule
    ],
    declarations: [
        EmiComponent,
        BankNameChangePipe
    ],
    exports:[
        EmiComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: [
    ]
})

export class EmiModule{}