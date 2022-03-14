import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {TezUpiFormComponent} from "./tezUpiForm.component";


@NgModule({
    imports: [
        CommonModule
    ],

    declarations: [
        TezUpiFormComponent
    ],

    exports:[
        TezUpiFormComponent
    ],
    
    providers: [
    ]
})

export class TezUpiFormModule{}