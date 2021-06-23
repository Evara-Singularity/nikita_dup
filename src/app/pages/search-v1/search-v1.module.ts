import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchV1RoutingModule } from './search-v1-routing.module';
import { SearchV1Component } from './search-v1.component';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';


@NgModule({
  declarations: [SearchV1Component],
  imports: [
    CommonModule,
    SearchV1RoutingModule,
    SharedProductListingModule
  ]
})
export class SearchV1Module { }
