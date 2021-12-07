import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProductOosSimilarComponent } from "./product-oos-similar.component";
import { ProductOosSimilarCardComponent } from "./product-oos-similar-card/product-oos-similar-card.component";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { SliceArrayPipeModule } from "@app/utils/pipes/slice-array.pipe";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [ProductOosSimilarComponent, ProductOosSimilarCardComponent],
  imports: [
    RouterModule,
    CommonModule,
    MathFloorPipeModule,
    SliceArrayPipeModule,
  ],
  exports: [ProductOosSimilarComponent, ProductOosSimilarCardComponent],
})
export class ProductOosSimilarModule {}
