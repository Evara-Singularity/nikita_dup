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
import { LoaderModule } from '../loader/loader.module';
import { KpAutocompleteOffDirectiveModule } from '../../utils/directives/kpAutocompleteOff.directive';


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
        LoaderModule,
        KpAutocompleteOffDirectiveModule
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