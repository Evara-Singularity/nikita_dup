import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductOosSimilarComponent } from "./product-oos-similar.component";
import { ProductOosSimilarCardComponent } from "./product-oos-similar-card/product-oos-similar-card.component";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { SliceArrayPipeModule } from "@app/utils/pipes/slice-array.pipe";
import { RouterModule } from "@angular/router";
import { SwipeDirectiveModule } from "@app/utils/directives/swipe.directive";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [ProductOosSimilarComponent, ProductOosSimilarCardComponent],
  imports: [
    RouterModule,
    SwipeDirectiveModule,
    CommonModule,
    MathFloorPipeModule,
    SliceArrayPipeModule,
    ReactiveFormsModule
  ],
  exports: [ProductOosSimilarComponent, ProductOosSimilarCardComponent],
})
export class ProductOosSimilarModule {}
