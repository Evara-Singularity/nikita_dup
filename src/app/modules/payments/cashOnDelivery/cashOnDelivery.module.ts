import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CashOnDeliveryComponent} from "./cashOnDelivery.component";

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
    providers: []
})

export class CashOnDeliveryModule{}