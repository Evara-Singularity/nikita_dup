import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RfqProductCardVerticalGridViewComponent } from './rfq-product-card-vertical-grid-view.component';
import { ProductCardCoreModule } from '../product-card.core.module';

@NgModule({
  imports: [
    CommonModule,
    ProductCardCoreModule
  ],
  declarations: [RfqProductCardVerticalGridViewComponent],
  exports:[RfqProductCardVerticalGridViewComponent]
})
export class RfqProductCardVerticalGridViewModule { }
