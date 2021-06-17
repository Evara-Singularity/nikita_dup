import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';

@NgModule({
  declarations: [ProductHorizontalCardComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ProductHorizontalCardComponent
  ]
})
export class ProductHorizontalCardModule { }
