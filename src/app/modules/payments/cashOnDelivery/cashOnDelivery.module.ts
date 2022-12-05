import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CashOnDeliveryComponent} from "./cashOnDelivery.component";
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PrepaidOfferCheckoutModule
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