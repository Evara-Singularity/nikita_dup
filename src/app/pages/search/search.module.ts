import { AccordianModule } from '@modules/accordian/accordian.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchV1RoutingModule } from './search.routing.module';
import { SearchComponent } from './search.component';
import { SharedProductListingModule } from '@modules/shared-product-listing/shared-product-listing.module';
import { ProductListingAppPromoModule } from '@app/modules/product-listing-app-promo/product-listing-app-promo.module';
import { KpToggleDirectiveModule } from '@utils/directives/kp-toggle.directive';


@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    AccordianModule,
    SearchV1RoutingModule,
    KpToggleDirectiveModule,
    SharedProductListingModule,
    ProductListingAppPromoModule
  ]
})
export class SearchModule { }
