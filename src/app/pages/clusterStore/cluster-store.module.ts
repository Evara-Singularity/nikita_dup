import { ClusterStoreResolver } from './cluster-store.resolver';
import { ClusterStoreComponent } from './cluster-store.component';
import { routing } from './cluster-store.routing';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllCategoryComponent } from '../../components/cluster-store/all-category/all-category.component';
import { BannerComponent } from '../../components/cluster-store/banner/banner.component';
import { BestsellerComponent } from '../../components/cluster-store/bestseller/bestseller.component';
import { ClusterCategoryComponent } from '../../components/cluster-store/cluster-category/cluster-category.component';
import { FeaturedBrandComponent } from '../../components/cluster-store/featured-brand/featured-brand.component';
import { FeaturedCategoryComponent } from '../../components/cluster-store/featured-category/featured-category.component';
import { NewArrivalComponent } from '../../components/cluster-store/new-arrival/new-arrival.component';
import { TrendingCategoryComponent } from '../../components/cluster-store/trending-category/trending-category.component';
import { ClusterStoreService } from './cluster-store.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { FeatureBannerComponent } from '../../components/cluster-store/feature-banner/feature-banner.component';
import { ClusterFooterComponent } from '../../components/cluster-store/cluster-footer/cluster-footer.component';
import { ClusterVideoComponent } from '../../components/cluster-store/cluster-video/cluster-video.component';
import { NgxSiemaModule } from 'ngx-siema';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { CharacterremovePipeModule } from '../..//utils/pipes/characterRemove.pipe';
import { LoaderModule } from '../../modules/loader/loader.module';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';

@NgModule({
  declarations: [
    ClusterStoreComponent,
    AllCategoryComponent,
    BannerComponent,
    BestsellerComponent,
    ClusterCategoryComponent,
    FeaturedBrandComponent,
    FeaturedCategoryComponent,
    NewArrivalComponent,
    TrendingCategoryComponent,
    FeatureBannerComponent,
    ClusterFooterComponent,
    ClusterVideoComponent,
    ],
  imports: [
    CommonModule,
    RouterModule,
    routing,
    PopUpModule,
    MathCeilPipeModule,
    CharacterremovePipeModule,
    LazyLoadImageModule,
    LoaderModule,
    NgxSiemaModule.forRoot(),
    ObserveVisibilityDirectiveModule
  ],
providers:[
  ClusterStoreService,
  ClusterStoreResolver
  ],
})
export class ClusterStoreModule { }
