import { TrendingCategoriesModule } from './../../components/ternding-categories/trending-categories.component';
import { KpToggleDirectiveModule } from '@utils/directives/kp-toggle.directive';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home.routing';
import { SiemaCarouselModule } from '@modules/siemaCarousel/siemaCarousel.module';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { HomefooterAccordianComponent } from '@app/components/homefooter-accordian/homefooter-accordian.component';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        SiemaCarouselModule,
        ObserveVisibilityDirectiveModule,
        LazyLoadImageModule,
        TrendingCategoriesModule,
        KpToggleDirectiveModule,
        AppPromoModule
    ],
    declarations: [
        HomeComponent,
        HomefooterAccordianComponent
    ],
    providers: []
})

export class HomeModule { }