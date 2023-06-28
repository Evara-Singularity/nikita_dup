import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardVerticalGridViewProductPriceCompareComponent } from './product-card-vertical-grid-view-product-price-compare.component';
import { ProductCardCoreModule } from '../product-card.core.module';

@NgModule({
  imports: [
    CommonModule,
    ProductCardCoreModule
  ],
  declarations: [ProductCardVerticalGridViewProductPriceCompareComponent],
  exports: [ ProductCardVerticalGridViewProductPriceCompareComponent]
})
export class ProductCardVerticalGridViewProductPriceCompareModule { }
