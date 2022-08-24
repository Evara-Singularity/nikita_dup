import { TrendingCategoriesModule } from './../../components/ternding-categories/trending-categories.component';
import { KpToggleDirectiveModule } from '@utils/directives/kp-toggle.directive';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home.routing';
import { SiemaCarouselModule } from '@modules/siemaCarousel/siemaCarousel.module';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
import { HomefooterAccordianModule } from '@app/components/homefooter-accordian/homefooter-accordian.component';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
import CategoryCardModule from '@app/components/category-card/category-card.component';
import { HomePageSkeletonsModule } from '@app/components/home-page-skeletons/home-page-skeletons.component';
import { BottomNavigationModule } from '@app/modules/bottom-navigation/bottom-navigation.module';



@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        SiemaCarouselModule,
        ObserveVisibilityDirectiveModule,
        LazyLoadImageModule,
        WhatsAppToastModule,
        TrendingCategoriesModule,
        KpToggleDirectiveModule,
        AppPromoModule,
        HomefooterAccordianModule,
        CategoryCardModule,
        HomePageSkeletonsModule,
        BottomNavigationModule,
    ],
    declarations: [
        HomeComponent,
    ],
    providers: []
})

export class HomeModule { }