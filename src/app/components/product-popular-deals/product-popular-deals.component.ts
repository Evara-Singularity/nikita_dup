import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../../utils/services/product.service';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { Subscription } from 'rxjs';

@Component({
  selector: "product-popular-deals",
  templateUrl: "./product-popular-deals.component.html",
  styleUrls: ["./product-popular-deals.component.scss"],
})
export class ProductPopularDealsComponent implements OnInit {
  @Input() productStaticData = this.commonService.defaultLocaleValue;
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  polpularDealsProducts: ProductsEntity[] = null;
  @Input("outOfStock") outOfStock = false;
  @Input('analytics') analytics = {};
  @Input() apiResponse: any;

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
    lazyLoadImage: true,
  };
  cardMetaInfo: ProductCardMetaInfo = null;
  resultArray: any[];
  selectedIndex: any;
  selectedProducts: ProductsEntity[] = null;
  isBrowser: boolean;
  changeStaticSubscription: Subscription = null;
  constructor(
    public commonService: CommonService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = commonService.isBrowser;
  }

  ngOnInit(): void {
    this.getProductPopularDeals(this.apiResponse);
    this.cardMetaInfo = {
      redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
      redirectedSectionName: this.outOfStock
        ? "product_popular_deals_oos"
        : "product_popular_deals_oos",
    };
  }

  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
  }
  
  getStaticSubjectData(){
    this.changeStaticSubscription = this.commonService.changeStaticJson.subscribe(staticJsonData => {
      this.commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
      this.cdr.detectChanges();
    });
  }
  
  getProductPopularDeals(response: any) {
    this.resultArray = response;
    this.setProductList(0, this.resultArray[0]);        // to set first default value
  }

  setProductList(index, products) {
    this.selectedIndex = index;
    if (products["productList"] && (products["productList"] as []).length > 0) {
      this.selectedProducts = (products["productList"] as any[]).map(
        (product) => this.productService.searchResponseToProductEntity(product)
      );
    }
  }

  onClick(e) {
    let containerId = document.getElementById("topDealsContainer");
    let tabsId = document.getElementById("tabs");

    if (this.isBrowser && containerId && tabsId) {
      tabsId.addEventListener(
        "click",
        () => {
          containerId.scroll({ left: 0, top: 0, behavior: "smooth" });
        },
        { passive: true }
      );
    }
  }
  
}

@NgModule({
    declarations: [
        ProductPopularDealsComponent
    ],
    imports: [
        CommonModule,
        ProductCardVerticalContainerModule,
        ProductCardVerticalGridViewModule
    ],
    exports: [ProductPopularDealsComponent]
})
export class ProductDealsModule { }