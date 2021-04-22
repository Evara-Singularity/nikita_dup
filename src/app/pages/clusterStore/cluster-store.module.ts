import { ClusterStoreResolver } from './cluster-store.resolver';
import { ClusterStoreComponent } from './cluster-store.component';
import { routing } from './cluster-store.routing';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllCategoryComponent } from './all-category/all-category.component';
import { BannerComponent } from './banner/banner.component';
import { BestsellerComponent } from './bestseller/bestseller.component';
import { ClusterCategoryComponent } from './cluster-category/cluster-category.component';
import { FeaturedBrandComponent } from './featured-brand/featured-brand.component';
import { FeaturedCategoryComponent } from './featured-category/featured-category.component';
import { NewArrivalComponent } from './new-arrival/new-arrival.component';
import { TrendingCategoryComponent } from './trending-category/trending-category.component';
import { ClusterStoreService } from './cluster-store.service';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { FeatureBannerComponent } from './feature-banner/feature-banner.component';
import { ClusterFooterComponent } from './cluster-footer/cluster-footer.component';
import { ClusterVideoComponent } from './cluster-video/cluster-video.component';
import { NgxSiemaModule } from 'ngx-siema';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { CharacterremovePipeModule } from 'src/app/utils/pipes/characterRemove.pipe';
import { LoaderModule } from 'src/app/modules/loader/loader.module';

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
  ],
providers:[
  ClusterStoreService,
  ClusterStoreResolver
  ],
})
export class ClusterStoreModule { }
