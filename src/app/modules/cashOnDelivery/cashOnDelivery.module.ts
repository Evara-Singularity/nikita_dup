import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CashOnDeliveryComponent} from "./cashOnDelivery.component";
import {CashOnDeliveryService} from "./cashOnDelivery.service";
import { LoaderModule } from '../loader/loader.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LoaderModule
    ],
    declarations: [
        CashOnDeliveryComponent
    ],
    exports:[
        CashOnDeliveryComponent
    ],
    //entryComponents: [BestSellerComponent],
    providers: [
        CashOnDeliveryService
    ]
})

export class CashOnDeliveryModule{}