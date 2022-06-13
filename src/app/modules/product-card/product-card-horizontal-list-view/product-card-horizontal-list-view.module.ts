import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardHorizontalListViewComponent } from './product-card-horizontal-list-view.component';
import { ProductCardCoreModule } from '../product-card.core.module';

@NgModule({
  declarations: [ProductCardHorizontalListViewComponent],
  imports: [
    CommonModule,
    ProductCardCoreModule
  ],
  exports: [
    ProductCardHorizontalListViewComponent
  ]
})
export class ProductCardHorizontalListViewModule { }
