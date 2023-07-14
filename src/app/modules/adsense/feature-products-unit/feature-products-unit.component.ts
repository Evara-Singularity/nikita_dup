import { AfterViewInit, Component, Input } from "@angular/core";
import {
  ProductCardFeature,
  ProductCardMetaInfo,
  ProductsEntity,
} from "@app/utils/models/product.listing.search";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { ProductService } from "@app/utils/services/product.service";
import { ProductListService } from "@app/utils/services/productList.service";

@Component({
  selector: "adsense-feature-products-unit",
  templateUrl: "./feature-products-unit.component.html",
  styleUrls: ["./feature-products-unit.component.scss"],
})
export class FeatureProductsUnitComponent implements AfterViewInit {
  @Input() data: string[] | null = null;
  @Input("pageName") pageName = "pdp";
  @Input("moduleUsedIn") moduleUsedIn = "PRODUCT_RECENT_PRODUCT";
  @Input() analytics = null;
  @Input() analyticsIdentifier: string = null;
  public msnListData: ProductsEntity[] = null;
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

  constructor(
    private _productService: ProductService,
    private _productListService: ProductListService,
    public _analytic: GlobalAnalyticsService
  ) {}

  ngAfterViewInit(): void {
    this.getAllProducts();
  }

  getAllProducts() {
    if (this.data && this.data.length > 0) {
      this._productService.getProductList(this.data).subscribe((result) => {
        if (
          result &&
          result["searchProductList"] &&
          result["searchProductList"].length > 0
        ) {
          this.msnListData = this._productListService.getSerachProductList(
            result["searchProductList"]
          );
        }
      });
    }
  }

  analyticsImpresssion() {
    if (this.data && this.analyticsIdentifier) {
      const monet = {
        adType: "impression_" + this.analyticsIdentifier,
      };
      this._analytic.sendAdobeCall(monet, "genericClick");
    }
  }

  onVisisble(event) {
    // console.log('log', 'on visible');
    this.analyticsImpresssion();
  }
}
