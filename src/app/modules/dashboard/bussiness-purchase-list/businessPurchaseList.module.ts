import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BussinessPurchaseListComponent } from "./bussinessPurchaseList.component";
import { routing } from "./businessPurchaseList.routing";
import { BusinessPurchaseListService } from "./businessPurchaseList.service";
import { ProductService } from "@app/utils/services/product.service";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { OrderSummaryService } from "@app/utils/services/orderSummary.service";
import { MathCeilPipeModule } from "@app/utils/pipes/math-ceil";
import { ProductCardHorizontalListViewModule } from "@app/modules/product-card/product-card-horizontal-list-view/product-card-horizontal-list-view.module";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    MathFloorPipeModule,
    MathCeilPipeModule,
    ProductCardHorizontalListViewModule,
  ],
  declarations: [BussinessPurchaseListComponent],
  exports: [],
  providers: [BusinessPurchaseListService, OrderSummaryService, ProductService],
})
export class BusinessPurchaseListModule {}