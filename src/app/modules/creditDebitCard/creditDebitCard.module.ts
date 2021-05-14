import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CreditDebitCardComponent} from "./creditDebitCard.component";
import {CreditDebitCardService} from "./creditDebitCard.service";
import {PayuFormModule} from "../payuForm/payuForm.module";
import {RazorPayFormModule} from "../razorPayForm/razorPayForm.module";
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { KpAutocompleteOffDirectiveModule } from '../../utils/directives/kpAutocompleteOff.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PayuFormModule,
        RazorPayFormModule,
        MathCeilPipeModule,
        KpAutocompleteOffDirectiveModule
    ],
    declarations: [
        CreditDebitCardComponent,
    ],
    exports:[
        CreditDebitCardComponent
    ],
    providers: [
        CreditDebitCardService
    ]
})

export class CreditDebitCardModule{}