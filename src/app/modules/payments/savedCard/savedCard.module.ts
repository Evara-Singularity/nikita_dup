import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SavedCardComponent} from "./savedCard.component";
import {SavedCardService} from "./savedCard.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PayuFormModule} from "../payment-forms/payuForm/payuForm.module";
import { RazorPayFormModule } from '../payment-forms/razorPayForm/razorPayForm.module';
import { ObjectToArrayPipeModule } from '@pipes/object-to-array.pipe';
import { MathCeilPipeModule } from '@pipes/math-ceil';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ObjectToArrayPipeModule,
        PayuFormModule,
        RazorPayFormModule,
        MathCeilPipeModule
    ],
    declarations: [
        SavedCardComponent,
    ],
    exports:[
        SavedCardComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: [
        SavedCardService,
    ]
})

export class SavedCardModule{}