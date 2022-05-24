import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardCoreModule } from '../product-card.core.module';
import { ProductCardVerticalGridViewComponent } from './product-card-vertical-grid-view.component';

@NgModule({
  declarations: [ProductCardVerticalGridViewComponent],
  imports: [
    CommonModule,
    ProductCardCoreModule
  ],
  exports: [
    ProductCardVerticalGridViewComponent
  ]
})
export class ProductCardVerticalGridViewModule { }
