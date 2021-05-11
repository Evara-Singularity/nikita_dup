
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./deals.routing";
import { CommonDealsService} from './common-deals.service';
import { DealsComponent } from './deals/deals.component';
import { AmazingDealsComponent } from './amazing-deals/amazingDeals.component';
import { BestOfferComponent } from './best-offer/bestOffer.component';
import { BigDealComponent } from './big-deals/bigDeals.component';
import { BrandSpotlightComponent } from './brands-spotlight/brands-spotlight.component';
import { Covid19Component } from './Covid19essentials/covid19.component';
import { ExclusiveComponent } from './exclusive-offers/exclusive.component';
import { FreeShippingComponent } from './free-shipping/free-shipping.component';
import { FreshComponent } from './fresh-arrivals/fresh.component';
import { MadeInIndiaComponent } from './made-in-india/madeInIndia.component';
import { MonsoonSaleComponent } from './monsoon-sale/monsoonSale.component';
import { NewYearComponent } from './newyear/newyear.component';
import { SeasonSaleComponent } from './season-sale/seasonSale.component';
import { SlipSafetyComponent } from './slip-safety/slipSafety.component';
import { SpecialComponent } from './special-offer/special.component';
import { SpecialDealsComponent } from './special-deals/specialDeals.component';
import { TripleNineComponent } from './tripleNine/tripleNine.component';
import { WinterComponent } from './wintersale/winter.component';

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule,  
    ],
    declarations: [
        DealsComponent,
        AmazingDealsComponent,
        BestOfferComponent,
        BigDealComponent,
        BrandSpotlightComponent,
        Covid19Component,
        ExclusiveComponent,
        FreeShippingComponent,
        FreshComponent,
        MadeInIndiaComponent,
        MonsoonSaleComponent,
        NewYearComponent,
        SeasonSaleComponent,
        SlipSafetyComponent,
        SpecialDealsComponent,
        SpecialComponent,
        TripleNineComponent,
        WinterComponent
    ],
    providers: [
        CommonDealsService
    ]
})

export class DealsModule{}