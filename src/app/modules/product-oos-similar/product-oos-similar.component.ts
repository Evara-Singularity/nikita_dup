import { EventEmitter, Component, Input, OnInit, Output, Renderer2 } from "@angular/core";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ProductService } from "@app/utils/services/product.service";
import { Location } from "@angular/common";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";

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
  @Output("updateScrollToTop") updateScrollToTop = new EventEmitter();

  listener;

  constructor(
    public productService: ProductService,
    private _commonService: CommonService,
    private renderer2: Renderer2,
    private location: Location,
    private _globalLoader: GlobalLoaderService,
  ) {
  }

  ngAfterViewInit() {
    this.attachScrollHandler();
  }

  handleCheckEventToStopLoader(index) {
    const visibleSimilarCardLength = (this.productService.oosSimilarProductsData.similarData.slice(0, GLOBAL_CONSTANT.oosSimilarCardCountBottom + GLOBAL_CONSTANT.oosSimilarCardCountTop)).length;

    if ((visibleSimilarCardLength - 1) == index) {
      this._globalLoader.setLoaderState(false);
    }

    setTimeout(() => {
      this._globalLoader.setLoaderState(false);
    }, 5000)
  }

  attachScrollHandler() {
    this.listener = this.renderer2.listen('window', 'scroll', (e) => {
      this.windowScrollHandler();
    });
  }

  removeWindowScrollListener(event) {
    if (this._commonService.isBrowser && event) {
      this.listener();
    }
  }

  windowScrollHandler() {
    if (document.getElementById('similarProductsOos') &&
      this.productService.oosSimilarProductsData.similarData &&
      this.productService.oosSimilarProductsData.similarData.length > 0 &&
      ((window.pageYOffset + 400) > document.getElementById('similarProductsOos').offsetTop)
    ) {
      this.checkWhichElementIsInViewport();
      this.updateScrollToTop.emit(true);
    } else {
      if ((window.pageYOffset > document.getElementById('similarProductsOos').offsetTop)) {
        this.updateScrollToTop.emit(true);
      } else {
        this.updateScrollToTop.emit(false);
      }
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
      this.listener();
    }
  }
}
