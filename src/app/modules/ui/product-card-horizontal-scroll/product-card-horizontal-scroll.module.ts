import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardHorizontalScrollComponent } from './product-card-horizontal-scroll.component';

@NgModule({
  declarations: [ProductCardHorizontalScrollComponent],
  imports: [
    CommonModule,
  ],
  exports:[
    ProductCardHorizontalScrollComponent
  ]
})
export class ProductCardHorizontalScrollModule { }
