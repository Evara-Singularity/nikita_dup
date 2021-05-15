import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MobikwikWalletFormComponent} from "./mobikwikWalletForm.component";

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        MobikwikWalletFormComponent
    ],
    exports:[
        MobikwikWalletFormComponent
    ],
    providers: [
    ]
})

export class MobikwikWalletFormModule{}