import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { PayuWalletFormComponent } from "./payuWalletForm.component";

@NgModule({
    imports: [
        CommonModule,

    ],
    declarations: [
        PayuWalletFormComponent
    ],
    exports: [
        PayuWalletFormComponent
    ],
    providers: [
    ]
})

export class PayuWalletFormModule { }