import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';

@NgModule({
  declarations: [ProductHorizontalCardComponent],
  imports: [
    CommonModule,
    RatingPipeModule
  ],
  exports: [
    ProductHorizontalCardComponent
  ]
})
export class ProductHorizontalCardModule { }
