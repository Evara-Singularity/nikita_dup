import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductOosSimilarComponent } from "./product-oos-similar.component";
import { ProductOosSimilarProductDetailComponent } from "./product-oos-similar-product-detail/product-oos-similar-product-detail.component";
import { ProductOosSimilarCardComponent } from "./product-oos-similar-card/product-oos-similar-card.component";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { SliceArrayPipeModule } from "@app/utils/pipes/slice-array.pipe";
import { RouterModule } from "@angular/router";
import { SwipeDirectiveModule } from "@app/utils/directives/swipe.directive";
import { ReactiveFormsModule } from "@angular/forms";
import { ProductInfoSectionPipeModule } from '@app/utils/pipes/product-oos-similar-card-section.pipe';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";
import { ProductFeatureDetailsModule } from "@app/components/product-feature-details/product-feature-details.component";
import { BreadcrumbNavModule } from "../breadcrumb-nav/breadcrumb-nav.module";
import ProductDescriptionModule from "@app/components/product-description/product-description.component";

@NgModule({
  declarations: [ProductOosSimilarComponent, ProductOosSimilarCardComponent, 
    ProductOosSimilarProductDetailComponent
  ],
  imports: [
    RouterModule,
    SwipeDirectiveModule,
    CommonModule,
    MathFloorPipeModule,
    SliceArrayPipeModule,
    BreadcrumbNavModule,
    ProductDescriptionModule,
    ReactiveFormsModule,
    ProductFeatureDetailsModule,
    ProductInfoSectionPipeModule,
    ObjectToArrayPipeModule,
    ProductFeatureDetailsModule,
    ObserveVisibilityDirectiveModule
  ],
  exports: [ProductOosSimilarComponent, ProductOosSimilarCardComponent, 
    ProductOosSimilarProductDetailComponent
  ],
})
export class ProductOosSimilarModule {}
