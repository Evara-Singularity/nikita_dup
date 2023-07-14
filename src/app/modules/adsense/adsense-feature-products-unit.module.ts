import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FeatureProductsUnitComponent } from "./feature-products-unit/feature-products-unit.component";
import { ProductCardVerticalContainerModule } from "../ui/product-card-vertical-container/product-card-vertical-container.module";
import { ProductCardVerticalGridViewModule } from "../product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";

@NgModule({
  declarations: [FeatureProductsUnitComponent],
  imports: [
    CommonModule,
    ObserveVisibilityDirectiveModule,
    ProductCardVerticalContainerModule,
    ProductCardVerticalGridViewModule,
  ],
  exports: [FeatureProductsUnitComponent],
})
export class AdsenseFeatureProductsUnitModule {}
