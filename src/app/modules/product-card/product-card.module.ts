import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { RouterModule } from '@angular/router';
import { BrandNamePipeModule } from '@app/utils/pipes/brandName.pipe';
import { ProductCardHorizontalScrollModule } from '../ui/product-card-horizontal-scroll/product-card-horizontal-scroll.module';
import { ProductCardSkeletonComponent } from './product-card-skeleton/product-card-skeleton.component';
import { ProductCardComponent } from './product-card.component';
import { ProductCardListViewComponent } from './product-card-list-view/product-card-list-view.component';
import { ProductCardHorizontalGridComponent } from './product-card-horizontal-grid/product-card-horizontal-grid.component';
import { ProductCardVericalGridComponent } from './product-card-vertical-grid/product-card-vertical-grid.component';

@NgModule({
  declarations: [
    ProductCardComponent,
    ProductCardSkeletonComponent,
    ProductCardListViewComponent,
    ProductCardHorizontalGridComponent,
    ProductCardVericalGridComponent
  ],
  imports: [
    CommonModule,
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
    ProductCardComponent,
    ProductCardSkeletonComponent
  ],
  providers: [
  ]
})
export class ProductCardModule { }
