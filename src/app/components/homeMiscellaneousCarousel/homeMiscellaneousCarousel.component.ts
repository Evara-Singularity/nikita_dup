import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { ProductService } from '@app/utils/services/product.service';
import { ProductBrowserService } from '@app/utils/services/product-browser.service';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-homeMiscellaneousCarousel',
  templateUrl: './homeMiscellaneousCarousel.component.html',
  styleUrls: ['./homeMiscellaneousCarousel.component.scss']
})
export class HomeMiscellaneousCarouselComponent implements OnInit {

  miscTabArray = [
    {
      id: 1,
      name: 'Recently Viewed',
      data: []
    },
    {
      id: 2,
      name: 'Buy it Again',
      data: []
    },
    {
      id: 3,
      name: 'Wishlist',
      data: []
    },
    {
      id: 4,
      name:'My RFQ',
      data: []
    }
  ]

  @Input("selectedProducts") selectedProducts;
  @Input("analytics") analytics = null;
  recentlyViewedProducts: ProductsEntity[] = [];
  selectedIndex: any;
  userId: any;

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
  isBrowser: boolean;
  isServer: boolean;

  constructor(
    public localStorageService: LocalStorageService,
    public _commonService: CommonService,
    private _dataservice: DataService,
    private _productService: ProductService,
    private _productBrowserService: ProductBrowserService,

  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;

  }

  ngOnInit() {
    if (this.isBrowser) {
      this.userId = this.localStorageService.retrieve('user').userId;
      this.getRecentViewed(this.userId || 'null', true);
    }
  }

  //recently viewed items config
  private getRecentViewed(setCId, isSelected = false) {
    this._dataservice
      .callRestful(
        'GET',
        CONSTANTS.NEW_MOGLIX_API +
        ENDPOINTS.RECENTLY_VIEWED +
        setCId
      )
      .subscribe((res) => {
        if ((res['statusCode'] === 200) && res['data'] && res['data'].length > 0) {
          this.miscTabArray['0']['data'] = (res['data'] as any[]).map((item) => this._productService.recentProductResponseToProductEntity(item));
          if (isSelected) {
            this.setProductList(0, this.miscTabArray['0']['data']);
          }
        }
      });
  }

  //buy again items config
  pastOrders() {
    if (this.userId)
      this._productBrowserService.getPastOrderProducts(this.userId).subscribe((response) => {
        if (response['status']) {
          this.miscTabArray['1']['data'] = (response['data'] as any[]).slice(0, 10).map(product => this._productBrowserService.pastOrdersProductResponseToProductEntity(product));
          this.setProductList(1, this.miscTabArray['1']['data']);
        }
      });
  }

  //wishlist item data
  getPurcahseList() {
    let request = { idUser: this.userId, userType: "business" };
    this._commonService
      .getPurchaseList(request)
      .pipe(
        map((res) => {
          let index = 0;
          res = res.sort((a, b) => {
            return b.updated_on - a.updated_on;
          });
          return res.map((item) => {
            item["matCodeMode"] = false;
            if (item["matCodeFlag"] == undefined || item["matCodeFlag"] == null)
              item["matCodeFlag"] = false;
            item["index"] = index;
            index++;
            return item;
          });
        })
      )
      .subscribe((res) => {
        this.miscTabArray['2']['data'] = res.map(product => {
          return this._productService.wishlistToProductEntity(product)
        });
        this.setProductList(2, this.miscTabArray['2']['data']);

      });
  }

  //get my rfq list

  getMyRfqList() {
    let user = this.localStorageService.retrieve("user");
    let obj = {};

    if (user.email != undefined && user.email != null)
      obj["email"] = user.email;

    if (user.phone != undefined && user.phone != null)
      obj["phone"] = user.phone;

    if (user.userId != undefined && user.userId != null)
      obj["idCustomer"] = user.userId;

    this._commonService
      .getRfqList(obj)
      .pipe(
        map((res) => {
          res["data"].map((item, index) => {
            if (index != 0) {
              item["toggle"] = false;
            } else {
              item["toggle"] = true;
            }
          });
          return res;
        })
      )
      .subscribe((res) => {
        this.miscTabArray['3']['data'] = res['data'].map(product => {
          return this._productService.myRfqToProductEntity(product)
        });
        this.setProductList(3, this.miscTabArray['3']['data']);
      });
  }

  setProductList(index, products) {
    this.selectedIndex = index;
    if (!products.length) {
      switch (index) {
        case 1:
          this.pastOrders();
          break;
        case 2:
          this.getPurcahseList();
          break;
        case 3:
          this.getMyRfqList();
          break;
      }
    }
    else if (products.length) {
      this.selectedProducts = products
      this.tabshift();
    }
  }

  tabshift() {
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
    HomeMiscellaneousCarouselComponent
  ],
  imports: [
    CommonModule,
    ProductCardVerticalContainerModule,
    ProductCardVerticalGridViewModule
  ],
})
export class HomeMiscellaneousCarouselModule { }