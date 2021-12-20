import { EventEmitter, Component, Input, OnInit, Output } from "@angular/core";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ProductService } from "@app/utils/services/product.service";
import { Location } from "@angular/common";
import { CommonService } from "@app/utils/services/common.service";

@Component({
  selector: "app-product-oos-similar",
  templateUrl: "./product-oos-similar.component.html",
  styleUrls: ["./product-oos-similar.component.scss"],
})
export class ProductOosSimilarComponent {
  GLOBAL_CONSTANT = GLOBAL_CONSTANT;
  productCardCurrentyInViewPort = -1;
  @Input("productBaseUrl") productBaseUrl: string;
  @Output("ratingReviewClickEvent") ratingReviewClickEvent = new EventEmitter();
  @Output("firstImageClickedEvent") firstImageClickedEvent = new EventEmitter();
  @Output("showAllKeyFeatureClickEvent") showAllKeyFeatureClickEvent = new EventEmitter();
  @Output("metaUpdateEvent") metaUpdateEvent = new EventEmitter();

  constructor(
    public productService: ProductService,
    private _commonService: CommonService,
    private location: Location
  ) { }

  ngAfterViewInit() {
    this.attachScrollHandler();
  }

  attachScrollHandler() {
    // set Scroll
    window.addEventListener(
      "scroll",
      this.windowScrollHandler.bind(this),
      true
    );

    window.removeEventListener("scroll", this.windowScrollHandler.bind(this), false);
  }

  removeWindowScrollListener(event) {
    if (this._commonService.isBrowser && event) {
      window.removeEventListener("scroll", this.windowScrollHandler.bind(this), false);
    }
  }

  windowScrollHandler() {
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
        this.metaUpdateEvent.emit(this.productCardCurrentyInViewPort);
      }
    } else {
      if (window.location.pathname !== ('/' + this.productBaseUrl)) {
        this.location.replaceState(this.productBaseUrl);
        this.metaUpdateEvent.emit(-1);
      }
    }
  }

  ngOnDestroy() {
    if (this._commonService.isBrowser) {
      window.removeEventListener("scroll", this.windowScrollHandler.bind(this), false);
    }
  }
}
