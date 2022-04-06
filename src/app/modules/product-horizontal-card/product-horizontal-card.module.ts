import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ProductCardSkeletonComponent } from './product-card-skeleton/product-card-skeleton.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { RouterModule } from '@angular/router';
import { BrandNamePipeModule } from '@app/utils/pipes/brandName.pipe';

@NgModule({
  declarations: [ProductHorizontalCardComponent, ProductCardSkeletonComponent],
  imports: [
    CommonModule,
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule,
    LazyLoadImageModule,
    ObserveVisibilityDirectiveModule,
    RouterModule,
    BrandNamePipeModule,
  ],
  exports: [
    ProductHorizontalCardComponent,
    ProductCardSkeletonComponent,
  ],
  providers: [
  ]
})
export class ProductHorizontalCardModule { }
