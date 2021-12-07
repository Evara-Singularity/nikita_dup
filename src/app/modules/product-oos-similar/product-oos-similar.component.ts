import { Component, Input, OnInit } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import {
  ProductCardFeature,
  ProductCardMetaInfo,
  ProductsEntity,
} from "@app/utils/models/product.listing.search";
import { ProductService } from "@app/utils/services/product.service";
import { ProductListService } from "@app/utils/services/productList.service";

@Component({
  selector: "app-product-oos-similar",
  templateUrl: "./product-oos-similar.component.html",
  styleUrls: ["./product-oos-similar.component.scss"],
})
export class ProductOosSimilarComponent implements OnInit {
  constructor(private productService: ProductService) {}
  @Input("msn") msn: string;
  GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  @Input("defaultCanonicalUrl") defaultCanonicalUrl: string;
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  similarProducts: ProductsEntity[] = null;
  @Input("productName") productName;
  @Input("categoryCode") categoryCode;
  @Input("analytics") analytics = null;
  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: true,
    enableBuyNow: true,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: false,
  };
  cardMetaInfo: ProductCardMetaInfo = null;
  currentInViewPort = 0;

  ngOnInit(): void {
    this.getProductSimilar();
  }

  updateUrl() {
    if (this.currentInViewPort > 0) {
      window.history.replaceState(
        "",
        "",
        this.similarProducts[this.currentInViewPort - 1].productUrl
      );
    } else {
      // PDP page original router
      window.history.replaceState("", "", this.defaultCanonicalUrl);
    }
  }

  getProductSimilar() {
    this.productService
      .getSimilarProducts(this.productName, this.categoryCode)
      .subscribe((response: any) => {
        window.removeEventListener("scroll", this.windowScrollHandler);
        let products = response["products"];
        if (products && (products as []).length > 0) {
          this.similarProducts = products;
          console.log(this.similarProducts);
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
    this.currentInViewPort = 0;
    if (this.similarProducts && this.similarProducts.length > 0) {
      for (
        let i = 1;
        i <
        Math.min(
          this.similarProducts.length,
          GLOBAL_CONSTANT.oosSimilarCardCount + 1
        );
        i++
      ) {
        if (this.currentInViewPort < 1) {
          this.currentInViewPort = this.checkIfElementIsInViewport(
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
