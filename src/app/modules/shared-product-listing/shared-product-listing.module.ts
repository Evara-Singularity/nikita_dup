import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductListingComponent } from './shared-product-listing.component';
import { ProductHorizontalCardModule } from '../product-horizontal-card/product-horizontal-card.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [SharedProductListingComponent],
  imports: [
    CommonModule,
    ProductHorizontalCardModule,
    NgxPaginationModule,
    ObserveVisibilityDirectiveModule,
  ],
  exports: [
    SharedProductListingComponent
  ]
})
export class SharedProductListingModule { }
