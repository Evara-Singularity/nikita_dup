import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductListingComponent } from './shared-product-listing.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterMidPlpModule } from '@app/components/filter-mid-plp/filter-mid-plp.component';
import { AddFilterSymbolPipeModule } from '@app/utils/pipes/addSymbol.pipe';
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import { ProductCardHorizontalListViewModule } from '../product-card/product-card-horizontal-list-view/product-card-horizontal-list-view.module';
import { ProductCardSkeletonModule } from '../product-card/product-card-skeleton/product-card-skeleton.module';

@NgModule({
  declarations: [SharedProductListingComponent],
  imports: [
    CommonModule,
    ProductCardHorizontalListViewModule,
    ProductCardSkeletonModule,
    FilterMidPlpModule,
    AddFilterSymbolPipeModule,
    NgxPaginationModule,
    ObserveVisibilityDirectiveModule,
    NotFoundModule
  ],
  exports: [
    SharedProductListingComponent
  ]
})

export class SharedProductListingModule { }
