import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CreditDebitCardComponent} from "./creditDebitCard.component";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import {RazorPayFormModule} from "../payment-forms/razorPayForm/razorPayForm.module";
import { MathCeilPipeModule } from '../../../utils/pipes/math-ceil';
import { KpAutocompleteOffDirectiveModule } from '../../../utils/directives/kpAutocompleteOff.directive';
import { SelectPopupModule } from '../../select-popup/select-popup.module';
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PayuFormModule,
        RazorPayFormModule,
        MathCeilPipeModule,
        KpAutocompleteOffDirectiveModule,
        SelectPopupModule,
        PrepaidOfferCheckoutModule
    ],
    declarations: [
        CreditDebitCardComponent,
    ],
    exports:[
        CreditDebitCardComponent
    ],
})

export class CreditDebitCardModule{}