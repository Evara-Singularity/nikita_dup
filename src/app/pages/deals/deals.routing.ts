import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DealsLayoutComponent } from './deals-layout.component';

const routes: Routes = [
    {
        path: '',
        component: DealsLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('../../modules/deals/deals/deals.module').then(m => m.DealsModule),
                data: {
                    layoutId: 'cm910070'
                }
            },
            {
                path: 'amazing-deals',
                loadChildren: () => import('../../modules/deals/amazing-deals/amazing-deals.module').then(m => m.AmazingDealsModule),
                data: {
                    layoutId: 'cm557824'
                }
            },
            {
                path: 'best-deals',
                loadChildren: () => import('../../modules/deals/best-deals/best-deal.module').then(m => m.BestDealModule),
                data: {
                    layoutId: 'cm504212'
                }
            },
            {
                path: 'best-offers',
                loadChildren: () => import('../../modules/deals/best-offer/best-offer.module').then(m => m.BestOfferModule),
                data: {
                    layoutId: 'cm738195'
                }
            },
            {
                path: 'big-deals',
                loadChildren: () => import('../../modules/deals/big-deals/big-deals.module').then(m => m.BigDealsModule),
                data: {
                    layoutId: 'cm571243'
                }
            },
            {
                path: 'brands-in-spotlight',
                loadChildren: () => import('../../modules/deals/brands-spotlight/brand-spotlight.module').then(m => m.BrandSpotlightModule),
                data: {
                    layoutId: 'cm566827'
                }
            },
            {
                path: 'exclusive-offers',
                loadChildren: () => import('../../modules/deals/exclusive-offers/exclusive.module').then(m => m.ExclusiveModule),
                data: {
                    layoutId: 'cm707496'
                }
            },
            {
                path: 'freeshipping',
                loadChildren: () => import('../../modules/deals/free-shipping/free-shipping.module').then(m => m.FreeShippingModule),
                data: {
                    layoutId: 'cm945780'
                }
            },
            {
                path: 'fresh-arrivals',
                loadChildren: () => import('../../modules/deals/fresh-arrivals/fresh-arrival.module').then(m => m.FreshArrivalModule),
                data: {
                    layoutId: 'cm582807'
                }
            },
            {
                path: 'made-in-india',
                loadChildren: () => import('../../modules/deals/made-in-india/made-in-india.module').then(m => m.MadeInIndiaModule),
                data: {
                    layoutId: 'cm338747'
                }
            },
            {
                path: 'monsoon-sale',
                loadChildren: () => import('../../modules/deals/monsoon-sale/monsoon-sale.module').then(m => m.MonsoonSaleModule),
                data: {
                    layoutId: 'cm198139'
                }
            },
            {
                path: 'newyear',
                loadChildren: () => import('../../modules/deals/newyear/newyear.module').then(m => m.NewyearModule),
                data: {
                    layoutId: 'cm135389'
                }
            },
            {
                path: 'season-sale',
                loadChildren: () => import('../../modules/deals/season-sale/season-sale.module').then(m => m.SeasonSaleModule),
                data: {
                    layoutId: 'cm693211'
                }
            },
            {
                path: 'slpsafety',
                loadChildren: () => import('../../modules/deals/slip-safety/slip-safety.module').then(m => m.SlipSafetyModule),
                data: {
                    layoutId: 'cm117308'
                }
            },
            {
                path: 'special-deals',
                loadChildren: () => import('../../modules/deals/special-deals/special-deals.module').then(m => m.SpecialDealsModule),
                data: {
                    layoutId: 'cm411298'
                }
            },
            {
                path: 'special-offer',
                loadChildren: () => import('../../modules/deals/special-offer/special-offer.module').then(m => m.SpecialOfferModule),
                data: {
                    layoutId: 'cm654033'
                }
            },
            {
                path: '999store',
                loadChildren: () => import('../../modules/deals/tripleNine/triple-nine.module').then(m => m.TripleNineModule),
                data: {
                    layoutId: 'cm689366'
                }
            },
            {
                path: 'wintersale',
                loadChildren: () => import('../../modules/deals/special-offer/special-offer.module').then(m => m.SpecialOfferModule),
                data: {
                    layoutId: 'cm483590'
                }
            },
            {
                path: 'emailer-deals',
                loadChildren: () => import('../../modules/deals/emailer-deals/emailer.module').then(m => m.EmailerModule),
                data: {
                    layoutId: 'cm511920'
                }
            },                        
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DealsRoutingModule { }
