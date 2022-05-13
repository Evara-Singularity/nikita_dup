import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PaytmUpiFormComponent} from "./paytmUpiForm.component";


@NgModule({
    imports: [
        CommonModule
    ],

    declarations: [
        PaytmUpiFormComponent
    ],

    exports:[
        PaytmUpiFormComponent
    ],
    
    providers: [
    ]
})

export class PaytmUpiFormModule{}