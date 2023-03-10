import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardFeature,} from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { ProductService } from '@app/utils/services/product.service';
import { ProductBrowserService } from '@app/utils/services/product-browser.service';
import { RfqProductCardVerticalGridViewModule } from '@app/modules/product-card/rfq-product-card-vertical-grid-view/rfq-product-card-vertical-grid-view.module';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
@Component({
  selector: 'app-homeMiscellaneousCarousel',
  templateUrl: './homeMiscellaneousCarousel.component.html',
  styleUrls: ['./homeMiscellaneousCarousel.component.scss']
})
export class HomeMiscellaneousCarouselComponent implements OnInit {

  readonly RECENT_TAB_NAME = 'Recently Viewed';
  private readonly PAST_ORDER_TAB_NAME = 'Buy it Again';
  private readonly WISHLIST_TAB_NAME = 'Wishlist';
  private readonly RFQ_TAB_NAME = 'My RFQ';


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
  
  @Input("recentResponse") recentResponse = null;
  @Input("pastOrdersResponse") pastOrdersResponse = null;
  @Input("purcahseListResponse") purcahseListResponse = null;
  @Input("rfqReponse") rfqReponse = null;
  @Input("analytics") analytics = null;

  tabsArray: { id: number, name: string, data: any[], isSelected: boolean }[] = [];

  constructor(
    public localStorageService: LocalStorageService,
    public _commonService: CommonService,
    private _productService: ProductService,
    private _productBrowserService: ProductBrowserService,
    public _loaderService: GlobalLoaderService,
  ) {
  }

  ngOnInit() {
    if (this.recentResponse && (this.recentResponse['statusCode'] === 200) && this.recentResponse['data'] && this.recentResponse['data'].length > 0) {
      this.tabsArray.push({
        id: 1,
        name: this.RECENT_TAB_NAME,
        data: (this.recentResponse['data'] as any[]).map((item) => this._productService.recentProductResponseToProductEntity(item)) || [],
        isSelected: false,
      })
    }
    if(this.pastOrdersResponse && this.pastOrdersResponse['status'] && this.pastOrdersResponse['data'] && this.pastOrdersResponse['data'].length > 0){
      this.tabsArray.push({
        id: 2,
        name: this.PAST_ORDER_TAB_NAME,
        data: (this.pastOrdersResponse['data'] as any[]).slice(0, 10).map(product => this._productBrowserService.pastOrdersProductResponseToProductEntity(product)) || [],
        isSelected: false,
      })
    }

      if (this.purcahseListResponse && this.purcahseListResponse.length > 0) {
        this.tabsArray.push({
          id: 3,
          name: this.WISHLIST_TAB_NAME,
          data: this.purcahseListResponse.map(product => this._productService.wishlistToProductEntity(product)),
          isSelected: false,
        })
      }
      if (this.rfqReponse && this.rfqReponse['data'] && this.rfqReponse['data'].length > 0) {
        this.tabsArray.push({
          id: 4,
          name: this.RFQ_TAB_NAME,
          data: this.rfqReponse['data'].filter(rfq => (rfq && rfq.itemData && rfq.itemData.length > 0)).map(product => this._productService.myRfqToProductEntity(product)),
          isSelected: false,
        })
      }
      if (this.tabsArray.length > 0) {
        this.tabsArray[0].isSelected = true;

      }
    }

  setProductTab(tabName) {
    this.tabsArray.forEach((element, index) => {
      this.tabsArray[index].isSelected = false;
    });
    this.tabsArray.forEach((element, index) => {
      if(this.tabsArray[index].name ==  tabName){
        this.tabsArray[index].isSelected = true;
      }
    });
  }

  tabshift() {
    let containerId = document.getElementsByClassName("pwa-tabs-container");
    if (this._commonService.isBrowser && containerId && containerId) {
      for (let index = 0; index < containerId.length; index++) {
        const element = containerId[index] as HTMLElement;
        element.addEventListener(
          "click",
          () => {
            element.scroll({ left: 0, top: 0, behavior: "smooth" });
          },
          { passive: true }
        );
      }
    }
  }


}
@NgModule({
  declarations: [
    HomeMiscellaneousCarouselComponent
  ],
  imports: [
    CommonModule,
    ProductCardVerticalContainerModule,
    ProductCardVerticalGridViewModule,
    RfqProductCardVerticalGridViewModule
  ],
})
export class HomeMiscellaneousCarouselModule { }