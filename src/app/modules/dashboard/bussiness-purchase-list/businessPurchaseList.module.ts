import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BussinessPurchaseListComponent } from "./bussinessPurchaseList.component";
import { routing } from "./businessPurchaseList.routing";
import { BusinessPurchaseListService } from "./businessPurchaseList.service";
import { LoaderModule } from "src/app/modules/loader/loader.module";
import { OrderSummaryService } from "src/app/modules/orderSummary/orderSummary.service";
import { ProductService } from "src/app/utils/services/product.service";
import { MathCeilPipeModule } from "src/app/utils/pipes/math-ceil";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    LoaderModule,
    MathCeilPipeModule,
  ],
  declarations: [BussinessPurchaseListComponent],
  exports: [],
  providers: [BusinessPurchaseListService, OrderSummaryService, ProductService],
})
export class BusinessPurchaseListModule {}