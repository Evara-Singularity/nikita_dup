import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchV1RoutingModule } from './search.routing.module';
import { SearchComponent } from './search.component';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';


@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    SearchV1RoutingModule,
    SharedProductListingModule
  ]
})
export class SearchModule { }
