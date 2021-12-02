import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchV1RoutingModule } from './search.routing.module';
import { SearchComponent } from './search.component';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { ProductListingAppPromoModule } from '@app/modules/product-listing-app-promo/product-listing-app-promo.module';


@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    SearchV1RoutingModule,
    SharedProductListingModule,
    ProductListingAppPromoModule
  ]
})
export class SearchModule { }
