import { EventEmitter, Component, Input, OnInit, Output } from "@angular/core";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ProductsEntity } from "@app/utils/models/product.listing.search";
import { ProductService } from "@app/utils/services/product.service";
import { Location } from "@angular/common";

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
  @Output("showAllKeyFeatureClickEvent") showAllKeyFeatureClickEvent = new EventEmitter();
  productCardCurrentyInViewPort = -1;

  constructor(
    public productService: ProductService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.getProductSimilar();
  }

  removeWindowScrollListener(event) {
    if (event) {
      window.removeEventListener("scroll", this.windowScrollHandler.bind(this), false);
    }
  }

  getProductSimilar() {
    this.productService
      .getSimilarProducts(this.productName, this.categoryCode)
      .subscribe((response: any) => {
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
    console.log('called');
    if (document.getElementById('similarProductsOos') &&
      this.productService.oosSimilarProductsData.similarData &&
      this.productService.oosSimilarProductsData.similarData.length > 0 && (window.pageYOffset > document.getElementById('similarProductsOos').offsetTop)
    ) {
      this.checkWhichElementIsInViewport();
    } else {
      this.productCardCurrentyInViewPort = -1;
    }
    this.updateUrl();
  }

  checkWhichElementIsInViewport() {
    let i = Math.min(
      this.productService.oosSimilarProductsData.similarData.length,
      GLOBAL_CONSTANT.oosSimilarCardCountBottom
    );
    for (i; i >= 0; i--) {
      if (document.getElementById("oos-card-" + i)) {
        const cardHeight = document.getElementById("oos-card-" + i).offsetTop;
        const scrollHeight = window.pageYOffset;
        if (scrollHeight > cardHeight) {
          this.productCardCurrentyInViewPort = i;
          break;
        }
      }
    }
  }

  updateUrl() {
    if (this.productCardCurrentyInViewPort > -1) {
      if (window.location.pathname !== ('/' + this.productService.oosSimilarProductsData.similarData[
        this.productCardCurrentyInViewPort
      ].productUrl)) {
        this.location.replaceState(
          this.productService.oosSimilarProductsData.similarData[
            this.productCardCurrentyInViewPort
          ].productUrl
        );
      }
    } else {
      if (window.location.pathname !== ('/' + this.productBaseUrl)) {
        this.location.replaceState(this.productBaseUrl);
      }
    }
  }
}
