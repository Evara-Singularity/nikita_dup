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
import { RfqProductCardVerticalGridViewModule } from '@app/modules/product-card/rfq-product-card-vertical-grid-view/rfq-product-card-vertical-grid-view.module';
import * as G from 'glob';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';


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
      data: [],
      isSelected: true,
    },
    {
      id: 2,
      name: 'Buy it Again',
      data: [],
      isSelected: false,
    },
    {
      id: 3,
      name: 'Wishlist',
      data: [],
      isSelected: false,
    },
    {
      id: 4,
      name:'My RFQ',
      data: [],
      isSelected: false,
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
  showRfqGrid=false;

  constructor(
    public localStorageService: LocalStorageService,
    public _commonService: CommonService,
    private _dataservice: DataService,
    private _productService: ProductService,
    private _productBrowserService: ProductBrowserService,
    public _loaderService: GlobalLoaderService,

  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;

  }

  ngOnInit() {
    if (this.isBrowser) {
      this.userId = this.localStorageService.retrieve('user').userId;
      this.getRecentViewed();
    }
  }

  //recently viewed items config
  private getRecentViewed() {
    this.miscTabArray['0']['data'] = [];
    this._dataservice
      .callRestful(
        'GET',
        CONSTANTS.NEW_MOGLIX_API +
        ENDPOINTS.RECENTLY_VIEWED +
        this.userId
      )
      .subscribe((res) => {
        this._loaderService.setLoaderState(false);
        if ((res['statusCode'] === 200) && res['data'] && res['data'].length > 0) {
          this.miscTabArray[0]['data'] = (res['data'] as any[]).map((item) => this._productService.recentProductResponseToProductEntity(item));
        }
      });
  }

  //buy again items config
  pastOrders() {
    if (this.userId)
      this.miscTabArray[1]['data'] = [];
      this._productBrowserService.getPastOrderProducts(this.userId).subscribe((response) => {
        this._loaderService.setLoaderState(false);
        if (response['status']) {
          this.showRfqGrid = false;
          this.miscTabArray[1]['data'] = (response['data'] as any[]).slice(0, 10).map(product => this._productBrowserService.pastOrdersProductResponseToProductEntity(product));
        }
      });
  }

  //wishlist item data
  getPurcahseList() {
    let request = { idUser: this.userId, userType: "business" };
    this.miscTabArray[2]['data'] = [];
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
        this._loaderService.setLoaderState(false);
        this.showRfqGrid=false;
        this.miscTabArray[2]['data'] = res.map(product => {
          return this._productService.wishlistToProductEntity(product)
        });
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
    this.miscTabArray[3]['data'] = [];
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
        this._loaderService.setLoaderState(false);
        this.showRfqGrid=true;
        this.miscTabArray[3]['data'] = res['data'].map(product => {
          return this._productService.myRfqToProductEntity(product)
        });
        console.log('miscTabArray', this.miscTabArray);
      });
  }

  setProductList(index) {
    this.miscTabArray.forEach((element, index) => {
      this.miscTabArray[index].isSelected = false;
    });
    this.miscTabArray[index].isSelected = true;
    this._loaderService.setLoaderState(true);
    switch (index) {
      case 0:
        this.getRecentViewed();
        break;
      case 1:
        this.pastOrders();
        break;
      case 2:
        this.getPurcahseList();
        break;
      case 3:
        this.getMyRfqList();
        break;
      default:
        break;
    }
  }

  tabshift() {
    let containerId = document.getElementsByClassName("pwa-tabs-container");
    if (this.isBrowser && containerId && containerId) {
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