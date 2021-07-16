import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductListingComponent } from './shared-product-listing.component';
import { ProductHorizontalCardModule } from '../product-horizontal-card/product-horizontal-card.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterMidPlpModule } from '@app/components/filter-mid-plp/filter-mid-plp.component';
import { AddFilterSymbolPipeModule } from '@app/utils/pipes/addSymbol.pipe';

@NgModule({
  declarations: [SharedProductListingComponent],
  imports: [
    CommonModule,
    ProductHorizontalCardModule,
    FilterMidPlpModule,
    AddFilterSymbolPipeModule,
    NgxPaginationModule,
    ObserveVisibilityDirectiveModule,
  ],
  exports: [
    SharedProductListingComponent
  ]
})

export class SharedProductListingModule { }
