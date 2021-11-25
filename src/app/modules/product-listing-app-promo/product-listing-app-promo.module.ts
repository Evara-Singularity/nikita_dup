import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingAppPromoComponent } from './product-listing-app-promo.component';
import { AppPromoModule } from '../app-promo/app-promo.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';

@NgModule({
  imports: [
    CommonModule,
    AppPromoModule,
    ObserveVisibilityDirectiveModule
  ],
  declarations: [ProductListingAppPromoComponent],
  exports: [
    ProductListingAppPromoComponent
  ]
})
export class ProductListingAppPromoModule { }
