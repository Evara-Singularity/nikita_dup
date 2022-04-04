import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalScrollComponent } from './product-horizontal-scroll.component';

@NgModule({
  declarations: [ProductHorizontalScrollComponent],
  imports: [
    CommonModule
  ],
  exports:[
    ProductHorizontalScrollComponent
  ]
})

export class ProductHorizontalScrollModule { }
