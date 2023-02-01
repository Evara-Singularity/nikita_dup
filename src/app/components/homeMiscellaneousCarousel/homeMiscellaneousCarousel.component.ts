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

  miscTabArray={
    'Recently Viewed':[],
    'Buy it Again':[],
    'Wishlist':[],
    // 'My RFQ':[]
  }

// miscTabArray=[
//   {'Recently Viewed':[]},
//   {'Buy it Again':[]},
//   {'Wishlist':[]},
//   {'My RFQ':[]}
// ]

  @Input("selectedProducts") selectedProducts;
  @Input("analytics") analytics = null;
  recentlyViewedProducts: ProductsEntity[] = [];
  selectedIndex: any;
  userId:any;

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
      console.log("nikkkkkkkkkkk",this.userId)
			this.getRecentViewed(this.userId || 'null');
      this.PastOrders();
      this.getPurcahseList();
		}
    
  }

//recently viewed items config
	private getRecentViewed(setCId) {
		this._dataservice
			.callRestful(
				'GET',
				CONSTANTS.NEW_MOGLIX_API +
				ENDPOINTS.RECENTLY_VIEWED +
				setCId
			)
			.subscribe((res) => {
				if ((res['statusCode'] === 200) && res['data'] && res['data'].length > 0) {
					this.miscTabArray['Recently Viewed'] = (res['data'] as any[]).map((item) => this._productService.recentProductResponseToProductEntity(item));
				}
			});
	}

  //buy again items config
  PastOrders()
  {
    if (this.userId)
      this._productBrowserService.getPastOrderProducts(this.userId).subscribe((response) => {
        if (response['status']) {
          this.miscTabArray['Buy it Again'] = (response['data'] as any[]).slice(0, 10).map(product => this._productBrowserService.pastOrdersProductResponseToProductEntity(product));
        }
      });
  }

  //wishlist item data

  getPurcahseList()
  {
    console.log("heyyyyyyyyyy")
    let request = { idUser: this.userId, userType: "business" };
    this._commonService
      .getPurchaseList(request)
      .pipe(
        map((res) =>
        {
          let index = 0;
          res = res.sort((a, b) =>
          {
            return b.updated_on - a.updated_on;
          });
          return res.map((item) =>
          {
            item["matCodeMode"] = false;
            if (item["matCodeFlag"] == undefined || item["matCodeFlag"] == null)
              item["matCodeFlag"] = false;
            //TODO-REMOVE
            /*below is temporary solution, will remove below line after search is implemented from backend*/
            /*below index is added because after searching on purchase list, index passed by for loop in view doesn't matches the index of object in array*/
            item["index"] = index;
            index++;
            return item;
          });
        })
      )
      .subscribe((res) =>
      {
        return this.miscTabArray['Wishlist'] = res.map(product => {
          return this._productService.wishlistToProductEntity(product)
        });
      })
  }


  setProductList(index, products) {
    this.selectedIndex = index;
    if (1) {
      this.selectedProducts = products 
      //   as any[]).map(
      //   (product) => this._productService.searchResponseToProductEntity(product)
      // );
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
    HomeMiscellaneousCarouselComponent
  ],
  imports: [
      CommonModule,
      ProductCardVerticalContainerModule,
      ProductCardVerticalGridViewModule
  ],
})
export class HomeMiscellaneousCarouselModule { }