import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardCoreModule } from '../product-card.core.module';
import { ProductCardHorizontalGridViewComponent } from './product-card-horizontal-grid-view.component';
import { ArrayFilterPipeModule } from '@app/utils/pipes/k-array-filter.pipe';

@NgModule({
  declarations: [ProductCardHorizontalGridViewComponent],
  imports: [
    CommonModule,
    ProductCardCoreModule
  ],
  exports: [
    ProductCardHorizontalGridViewComponent
  ]
})
export class ProductCardHorizontalGridViewModule { }
