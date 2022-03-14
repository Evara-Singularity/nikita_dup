import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PayuFormComponent} from "./payuForm.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PayuFormComponent
    ],
    exports:[
        PayuFormComponent
    ],
    providers: [
    ]
})

export class PayuFormModule{}