import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { ProductCardVerticalContainerModule } from "@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module";
import { ClientUtility } from "@app/utils/client.utility";
import { MathCeilPipeModule } from "@app/utils/pipes/math-ceil";
import { MathFloorPipeModule } from "@app/utils/pipes/math-floor";
import { CommonService } from "@app/utils/services/common.service";
import { LazyLoadImageModule } from "ng-lazyload-image";
import { ProductCardVerticalGridViewProductPriceCompareModule } from "../../modules/product-card/product-card-vertical-grid-view-product-price-compare/product-card-vertical-grid-view-product-price-compare.module";
import { MathRoundPipeModule } from "../../utils/pipes/math-round";
import { AddToCartModule } from "../add-to-cart/add-to-cart.component";
import { CompareProductsList } from "../../utils/models/compare-products.modal";

@Component({
  selector: "app-product-price-compare",
  templateUrl: "./product-price-compare.component.html",
  styleUrls: ["./product-price-compare.component.scss"],
})
export class ProductPriceCompareComponent implements OnInit {
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Input("compareProductsData") compareProductsData: Array<object> = [];
  @Input("analytics") analytics = null;
  @Output("compareDataLoadded$") compareDataLoadded$ = new EventEmitter();

  isOutOfStockByQuantity: boolean = false;
  isOutOfStockByPrice: boolean = false;

  constructor(public commonService: CommonService, private router: Router) {}
  msnList: string[] = [];
  attributeToCompareKeys: string[] = [];
  msnMasterData: CompareProductsList[] = [];

  ngOnInit(): void {
    if (this.compareProductsData && this.compareProductsData.length > 0) {
      this.compareProductsData.reverse();
      this.restructureData();
    }
  }

  async restructureData() {
    try{
        this.msnList = this.compareProductsData.map(
            (msnInfo) => msnInfo["moglixPartNumber"]
          );
          this.compareProductsData.forEach((ele) => {
            const isOOS = this.isProductOutOfStock(ele);
            this.msnMasterData[ele["moglixPartNumber"]] = {
              moglixPartNumber: ele["moglixPartNumber"],
              productName: ele["productName"],
              salesPrice: ele["salesPrice"],
              avgRating: ele["avgRating"],
              brandName: ele["brandName"],
              mainImageLink: ele["mainImageLink"],
              productUrl: ele["productUrl"],
              isOutOfStock: isOOS,
              attributeToCompareValues: ele["attributeToCompare"],
              reviewCount : ele["reviewCount"]
            };
          });
          let attributeToCompareKeys =
            this.compareProductsData[0]["attributeToCompare"];
          this.attributeToCompareKeys = Object.keys(attributeToCompareKeys);
    }catch(err){
      // console.log("Error in restructuring data :" , err);
        this.msnList = [];
        this.msnMasterData = [];
    }
  }

  navigateTo(url) {
    if (url) {
      this.router.navigateByUrl(url);
      if (this.commonService.isBrowser) {
        ClientUtility.scrollToTop(100);
      }
    }
  }

  isProductOutOfStock(product: object) {
    let isOutOfStockByQuantity,
      isOutOfStockByPrice = false;
    if (product) {
      isOutOfStockByQuantity =
        !product["quantityAvailable"] || product["outOfStock"];
      isOutOfStockByPrice = !product["salesPrice"] && !product["mrp"];
      const isOOS = (isOutOfStockByQuantity || isOutOfStockByPrice);
      return isOOS;
    } else {
      return false;
    }
  }
}

@NgModule({
  declarations: [ProductPriceCompareComponent],
  exports: [ProductPriceCompareComponent],
  imports: [
    CommonModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    LazyLoadImageModule,
    ProductCardVerticalContainerModule,
    ProductCardVerticalGridViewProductPriceCompareModule,
    MathRoundPipeModule,
    AddToCartModule,
  ],
})
export class ProductPriceCompareModule {}
