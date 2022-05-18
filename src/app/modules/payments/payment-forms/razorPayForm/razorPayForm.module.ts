import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RazorPayFormComponent} from "./razorPayForm.component";
import {RazorPayFormService} from "./razorPayForm.service";
import { MathCeilPipeModule } from '../../../../utils/pipes/math-ceil';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MathCeilPipeModule
    ],
    declarations: [
        RazorPayFormComponent
    ],
    exports:[
        RazorPayFormComponent
    ],
    providers: [
        RazorPayFormService
    ]
})

export class RazorPayFormModule{}