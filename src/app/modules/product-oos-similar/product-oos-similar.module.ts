import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductOosSimilarComponent } from "./product-oos-similar.component";
import { ProductOosSimilarCardComponent } from "./product-oos-similar-card/product-oos-similar-card.component";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { SliceArrayPipeModule } from "@app/utils/pipes/slice-array.pipe";
import { RouterModule } from "@angular/router";
import { SwipeDirectiveModule } from "@app/utils/directives/swipe.directive";
import { ReactiveFormsModule } from "@angular/forms";
import { ProductInfoSectionPipeModule } from '@app/utils/pipes/product-oos-similar-card-section.pipe';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";
import {  MathCeilPipeModule } from "@app/utils/pipes/math-ceil";

@NgModule({
  declarations: [ProductOosSimilarComponent, ProductOosSimilarCardComponent],
  imports: [
    RouterModule,
    SwipeDirectiveModule,
    CommonModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    SliceArrayPipeModule,
    ReactiveFormsModule,
    ProductInfoSectionPipeModule,
    ObjectToArrayPipeModule,
    ObserveVisibilityDirectiveModule
  ],
  exports: [ProductOosSimilarComponent, ProductOosSimilarCardComponent],
})
export class ProductOosSimilarModule {}
