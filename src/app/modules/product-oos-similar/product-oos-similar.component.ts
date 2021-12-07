import { EventEmitter, Component, Input, OnInit, Output } from "@angular/core";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ProductsEntity } from "@app/utils/models/product.listing.search";
import { ProductService } from "@app/utils/services/product.service";

@Component({
  selector: "app-product-oos-similar",
  templateUrl: "./product-oos-similar.component.html",
  styleUrls: ["./product-oos-similar.component.scss"],
})
export class ProductOosSimilarComponent implements OnInit {
  GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  similarProducts: ProductsEntity[] = null;

  @Input("productBaseUrl") productBaseUrl: string;
  @Input("productName") productName;
  @Input("categoryCode") categoryCode;
  @Output("firstImageClickedEvent") firstImageClickedEvent = new EventEmitter();
  @Output("showAllKeyFeatureClickEvent") showAllKeyFeatureClickEvent =
    new EventEmitter();
  productCardCurrentyInViewPort = 0;

  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    this.getProductSimilar();
  }

  updateUrl() {
    if (this.productCardCurrentyInViewPort > 0) {
      window.history.replaceState(
        "",
        "",
        this.productService.oosSimilarProductsData.similarData[
          this.productCardCurrentyInViewPort - 1
        ].productUrl
      );
    } else {
      // PDP page original router
      window.history.replaceState("", "", this.productBaseUrl);
    }
  }

  getProductSimilar() {
    this.productService
      .getSimilarProducts(this.productName, this.categoryCode)
      .subscribe((response: any) => {
        window.removeEventListener("scroll", this.windowScrollHandler);
        let products = response["products"];
        if (products && (products as []).length > 0) {
          this.productService.oosSimilarProductsData.similarData = products;
          this.productService.oosSimilarProductsData.similarData = JSON.parse(
            JSON.stringify(products)
          );
          // set Scroll
          window.addEventListener(
            "scroll",
            this.windowScrollHandler.bind(this),
            true
          );
        }
      });
  }

  windowScrollHandler() {
    this.productCardCurrentyInViewPort = 0;
    if (
      this.productService.oosSimilarProductsData.similarData &&
      this.productService.oosSimilarProductsData.similarData.length > 0
    ) {
      for (
        let i = 0;
        i <
        Math.min(
          this.productService.oosSimilarProductsData.similarData.length,
          GLOBAL_CONSTANT.oosSimilarCardCount
        );
        i++
      ) {
        if (this.productCardCurrentyInViewPort < 1) {
          this.productCardCurrentyInViewPort = this.checkIfElementIsInViewport(
            document.getElementById("oos-card-" + i)
          )
            ? i
            : 0;
        }
      }
      this.updateUrl();
    }
  }

  checkIfElementIsInViewport(elem) {
    if (!elem) {
      return false;
    }
    let bounding = elem.getBoundingClientRect();
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}
