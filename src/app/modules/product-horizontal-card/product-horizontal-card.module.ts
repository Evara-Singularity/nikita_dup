import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { ProductCardSkeletonComponent } from './product-card-skeleton/product-card-skeleton.component';

@NgModule({
  declarations: [ProductHorizontalCardComponent, ProductCardSkeletonComponent],
  imports: [
    CommonModule,
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule
  ],
  exports: [
    ProductHorizontalCardComponent,
    ProductCardSkeletonComponent,
  ]
})
export class ProductHorizontalCardModule { }
