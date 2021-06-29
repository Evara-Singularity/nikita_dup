import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {EmiComponent} from "./emi.component";
import {EmiService} from "./emi.service";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {PayuFormModule} from "../payuForm/payuForm.module";
import {RazorPayFormModule} from "../razorPayForm/razorPayForm.module";
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { BankNamePipeModule } from '../../utils/pipes/bank.pipe';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { KpAutocompleteOffDirectiveModule } from '../../utils/directives/kpAutocompleteOff.directive';
import { SelectPopupModule } from '../select-popup/select-popup.module';


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
        KpAutocompleteOffDirectiveModule,
        SelectPopupModule
    ],
    declarations: [
        EmiComponent
    ],
    exports:[
        EmiComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: [
        EmiService
    ]
})

export class EmiModule{}