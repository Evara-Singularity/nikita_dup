import {Routes, RouterModule} from '@angular/router';
import { AmazingDealsComponent } from './amazing-deals/amazingDeals.component';
import { BestDealComponent } from './best-deals/bestDeals.component';
import { BigDealComponent } from './big-deals/bigDeals.component';
import { BrandSpotlightComponent } from './brands-spotlight/brands-spotlight.component';
import { Covid19Component } from './Covid19essentials/covid19.component';
import {DealsComponent} from "./deals/deals.component";
import { FreeShippingComponent } from './free-shipping/free-shipping.component';
import { FreshComponent } from './fresh-arrivals/fresh.component';
import { MadeInIndiaComponent } from './made-in-india/madeInIndia.component';
import { MonsoonSaleComponent } from './monsoon-sale/monsoonSale.component';
import { NewYearComponent } from './newyear/newyear.component';
import { SeasonSaleComponent } from './season-sale/seasonSale.component';
import { SlipSafetyComponent } from './slip-safety/slipSafety.component';
import { SpecialDealsComponent } from './special-deals/specialDeals.component';
import { SpecialComponent } from './special-offer/special.component';
import { TripleNineComponent } from './tripleNine/tripleNine.component';
import { WinterComponent } from './wintersale/winter.component';

const routes: Routes = [
    { path: '', component: DealsComponent },
    {path: 'amazing-deals', component: AmazingDealsComponent},
    {path: 'best-deals', component:BestDealComponent},
    {path: 'big-deals', component:  BigDealComponent},
    {path: 'brands-in-spotlight', component: BrandSpotlightComponent},
    {path: 'covid-19-essentials' , component: Covid19Component},
    {path: 'exclusive-offers' , component: DealsComponent},
    {path: 'freeshipping', component: FreeShippingComponent},
    {path: 'fresh-arrivals', component:FreshComponent},
    {path: 'made-in-india', component: MadeInIndiaComponent},
    {path: 'monsoon-sale' , component:MonsoonSaleComponent},
    {path: 'newyear', component:NewYearComponent},
    {path:'season-sale', component:SeasonSaleComponent},
    {path:'slpsafety' , component:SlipSafetyComponent},
    {path:'special-deals', component:SpecialDealsComponent},
    {path:'special-offer' , component:SpecialComponent},
    {path:'999store', component:TripleNineComponent},
    {path:'wintersale' , component:WinterComponent}
];

export const routing = RouterModule.forChild(routes);