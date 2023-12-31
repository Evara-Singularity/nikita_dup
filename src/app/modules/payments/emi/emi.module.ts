import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {BankNameChangePipe, EmiComponent} from "./emi.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import {RazorPayFormModule} from "../payment-forms/razorPayForm/razorPayForm.module";
import { ObjectToArrayPipeModule } from '../../../utils/pipes/object-to-array.pipe';
import { BankNamePipeModule } from '../../../utils/pipes/bank.pipe';
import { KpAutocompleteOffDirectiveModule } from '../../../utils/directives/kpAutocompleteOff.directive';
import { SelectPopupModule } from '../../select-popup/select-popup.module';
import { SortByEMIMonthsPipeModule } from '@app/utils/pipes/emiSort.pipe';
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';


@NgModule({
    imports: [
        CommonModule,
        ObjectToArrayPipeModule,
        FormsModule,
        ReactiveFormsModule,
        PayuFormModule,
        RazorPayFormModule,
        BankNamePipeModule,
        MathRoundPipeModule,
        KpAutocompleteOffDirectiveModule,
        SelectPopupModule,
        SortByEMIMonthsPipeModule,
        PrepaidOfferCheckoutModule
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