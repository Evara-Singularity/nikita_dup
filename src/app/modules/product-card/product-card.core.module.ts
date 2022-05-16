import { NgModule } from '@angular/core';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { RouterModule } from '@angular/router';
import { BrandNamePipeModule } from '@app/utils/pipes/brandName.pipe';
import { ProductCardHorizontalScrollModule } from '../ui/product-card-horizontal-scroll/product-card-horizontal-scroll.module';

@NgModule({
  declarations: [],
  imports: [
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule,
    LazyLoadImageModule,
    ObserveVisibilityDirectiveModule,
    RouterModule,
    BrandNamePipeModule,
    ProductCardHorizontalScrollModule
  ],
  exports: [
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule,
    LazyLoadImageModule,
    ObserveVisibilityDirectiveModule,
    RouterModule,
    BrandNamePipeModule,
    ProductCardHorizontalScrollModule
  ],
  providers: [
  ]
})
export class ProductCardCoreModule { }
