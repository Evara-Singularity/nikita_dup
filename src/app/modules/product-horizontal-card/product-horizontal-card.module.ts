import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';

@NgModule({
  declarations: [ProductHorizontalCardComponent],
  imports: [
    CommonModule,
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule
  ],
  exports: [
    ProductHorizontalCardComponent
  ]
})
export class ProductHorizontalCardModule { }
