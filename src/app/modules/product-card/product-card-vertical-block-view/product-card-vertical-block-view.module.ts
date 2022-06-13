import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardCoreModule } from '../product-card.core.module';
import { ProductCardVerticalBlockViewComponent } from './product-card-vertical-block-view.component';


@NgModule({
  declarations: [ProductCardVerticalBlockViewComponent],
  imports: [
    CommonModule,
    ProductCardCoreModule
  ],
  exports: [
    ProductCardVerticalBlockViewComponent
  ]
})
export class ProductCardVerticalBlockViewModule { }
