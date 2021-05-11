import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PaytmWalletFormComponent} from "./paytmWalletForm.component";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        PaytmWalletFormComponent
    ],
    exports:[
        PaytmWalletFormComponent
    ],
    providers: [
    ]
})

export class PaytmWalletFormModule{}