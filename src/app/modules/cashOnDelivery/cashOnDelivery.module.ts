import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CashOnDeliveryComponent} from "./cashOnDelivery.component";
import {CashOnDeliveryService} from "./cashOnDelivery.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
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