import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeV1Component } from './home-v1.component';
import { HomeV1Routes } from './home-v1.routing';
import { SiemaCarouselModule } from '@modules/siemaCarousel/siemaCarousel.module';
import { TrendingCategoriesModule } from './../../components/ternding-categories/trending-categories.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { FeaturedBrandsModule } from '@app/modules/featuredBrands/featuredBrands.component';
import { HomePageSkeletonsModule } from '@app/components/home-page-skeletons/home-page-skeletons.component';
import { FeaturedArrivalModule } from '@app/modules/featuredArrivals/featuredArrivals.component';
import { HomeCategoryProductsModule } from '@app/modules/categories/categories.component';
import { BottomNavigationModule } from '@app/modules/bottom-navigation/bottom-navigation.module';
import { HomefooterAccordianModule } from '@app/components/homefooter-accordian/homefooter-accordian.component';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';




@NgModule({
  imports: [
    CommonModule,
    HomeV1Routes,
    SiemaCarouselModule,
    TrendingCategoriesModule,
    ObserveVisibilityDirectiveModule,
    FeaturedBrandsModule,
    HomePageSkeletonsModule,
    FeaturedArrivalModule,
    HomeCategoryProductsModule,
    BottomNavigationModule,
    HomefooterAccordianModule,
    AppPromoModule,
    WhatsAppToastModule,
    LazyLoadImageModule
  ],
  exports: [HomeV1Component],
  declarations: [HomeV1Component]
})
export class HomeV1Module { }
