import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MobikwikWalletFormComponent} from "./mobikwikWalletForm.component";
import { LoaderModule } from '../loader/loader.module';

@NgModule({
    imports: [
        CommonModule,
        LoaderModule
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