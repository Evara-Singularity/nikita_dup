import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NeftRtgsComponent} from "./neftRtgs.component";
import { PrepaidOfferCheckoutModule } from '@app/modules/prepaid-offer-checkout/prepaid-offer-checkout.component';



@NgModule({
    imports: [
        CommonModule,
        PrepaidOfferCheckoutModule
    ],
    declarations: [
        NeftRtgsComponent
    ],
    exports:[
        NeftRtgsComponent
    ],
    providers: []
})

export class NeftRtgsModule{}