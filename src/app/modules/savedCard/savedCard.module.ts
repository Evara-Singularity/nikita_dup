import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {SavedCardComponent} from "./savedCard.component";
import {SavedCardService} from "./savedCard.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PayuFormModule} from "../payuForm/payuForm.module";
import { RazorPayFormModule } from '../razorPayForm/razorPayForm.module';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { LoaderModule } from '../loader/loader.module';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ObjectToArrayPipeModule,
        PayuFormModule,
        RazorPayFormModule,
        LoaderModule,
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