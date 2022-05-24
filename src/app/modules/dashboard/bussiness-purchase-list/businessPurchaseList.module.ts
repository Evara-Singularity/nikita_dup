import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BussinessPurchaseListComponent } from "./bussinessPurchaseList.component";
import { routing } from "./businessPurchaseList.routing";
import { BusinessPurchaseListService } from "./businessPurchaseList.service";
import { OrderSummaryService } from "@app/modules/legacyOrderSummary/orderSummary.service";
import { ProductService } from "@app/utils/services/product.service";
import { MathCeilPipeModule } from "@app/utils/pipes/math-ceil";
import { ProductCardHorizontalGridViewModule } from "@app/modules/product-card/product-card-horizontal-grid-view/product-card-horizontal-grid-view.module";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    MathCeilPipeModule,
    ProductCardHorizontalGridViewModule
  ],
  declarations: [BussinessPurchaseListComponent],
  exports: [],
  providers: [BusinessPurchaseListService, OrderSummaryService, ProductService],
})
export class BusinessPurchaseListModule {}