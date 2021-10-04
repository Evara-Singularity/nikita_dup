import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { EnhanceImgByNetworkDirectiveModule } from '@app/utils/directives/enhanceImgByNetwork.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { EnhanceImgByNetworkPipeModule } from '@app/utils/pipes/enhanceImgByNetwork.pipe';
import { ProductCardSkeletonComponent } from './product-card-skeleton/product-card-skeleton.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';

@NgModule({
  declarations: [ProductHorizontalCardComponent, ProductCardSkeletonComponent],
  imports: [
    CommonModule,
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule,
    EnhanceImgByNetworkDirectiveModule,
    LazyLoadImageModule,
    EnhanceImgByNetworkPipeModule,
    ObserveVisibilityDirectiveModule
  ],
  exports: [
    ProductHorizontalCardComponent,
    ProductCardSkeletonComponent,
  ]
})
export class ProductHorizontalCardModule { }
