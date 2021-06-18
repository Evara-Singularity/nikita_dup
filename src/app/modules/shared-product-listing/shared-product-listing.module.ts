import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductListingComponent } from './shared-product-listing.component';
import { ProductHorizontalCardModule } from '../product-horizontal-card/product-horizontal-card.module';

@NgModule({
  declarations: [SharedProductListingComponent],
  imports: [
    CommonModule,
    ProductHorizontalCardModule
  ],
  exports: [
    SharedProductListingComponent
  ]
})
export class SharedProductListingModule { }
