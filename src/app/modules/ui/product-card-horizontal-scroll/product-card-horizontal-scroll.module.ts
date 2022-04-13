import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardHorizontalScrollComponent } from './product-card-horizontal-scroll.component';
import { ProductHorizontalCardModule } from '@app/modules/product-horizontal-card/product-horizontal-card.module';



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
