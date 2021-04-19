/**
 * Created by kuldeep on 4/4/17.
 */

import {NgModule} from '@angular/core';
import {HomeComponent} from './home.component';
import {CommonModule} from '@angular/common';
import {routing} from './home.routing';
import {AdBlockDirective} from './common/ad-block.directive';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { HomeService } from './home.service';
import { SiemaCarouselModule } from 'src/app/modules/siemaCarousel/siemaCarousel.module';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';
import { ModalService } from 'src/app/modules/modal/modal.service';
// import { SelectCustomerTypeModule } from 'src/app/components/selectCutosmerType/select-customer-type.module';
import { RecentlyViewedCarouselModule } from 'src/app/components/recentlyViewedCarousel/recentlyViewedCarousel.module';
import { FeaturedBrands } from './featuredBrands/featuredBrands.component';
import { ObserveVisibilityDirectiveModule } from 'src/app/utils/directives/observe-visibility.directive';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { FeaturedArrivals } from './featuredArrivals/featuredArrivals.component';


@NgModule({
    imports: [
        CommonModule,
        routing,
        SiemaCarouselModule,
        RecentlyViewedCarouselModule,
        LazyLoadImageModule,
        NgxWebstorageModule.forRoot(),
        PopUpModule,
        MathCeilPipeModule,
        ObserveVisibilityDirectiveModule,
        NgxPageScrollCoreModule,
        // SelectCustomerTypeModule,
    ],
    declarations: [
        HomeComponent,
        AdBlockDirective,
        FeaturedBrands,
        FeaturedArrivals,
    ],
    providers: [
        HomeService,
        ModalService
    ]
})

export class HomeModule {}