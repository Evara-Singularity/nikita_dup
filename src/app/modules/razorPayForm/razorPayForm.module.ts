import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RazorPayFormComponent} from "./razorPayForm.component";
import {RazorPayFormService} from "./razorPayForm.service";
import { LoaderModule } from '../loader/loader.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';


@NgModule({
    imports: [
        CommonModule,
        LoaderModule,
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