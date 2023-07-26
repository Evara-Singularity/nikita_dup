import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { ProductService } from '../../utils/services/product.service';
import CONSTANTS from '../../config/constants';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'recent-viewed-products',
  templateUrl: './recent-viewed-products.component.html',
  styleUrls: ['./recent-viewed-products.component.scss']
})
export class RecentViewedProductsComponent implements OnInit {
  productStaticData = this._commonService.defaultLocaleValue;
  recentProductItems: ProductsEntity[] = null;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Input() recentProductList: ProductsEntity [] = [];
  @Output() noRecentlyViewed$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() outOfStock: boolean = false;
  @Input() analytics = null;
  @Input('pageName') pageName = "pdp";
  @Input('moduleUsedIn') moduleUsedIn = "PRODUCT_RECENT_PRODUCT";
  @Input() currentProductMsn=''

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
  }
  cardMetaInfo: ProductCardMetaInfo = null;

  constructor(
    private productService: ProductService,
    public _router: Router,
    private localStorageService: LocalStorageService,
    private _commonService:CommonService,
  ) { }

  ngOnInit(): void {
    this.cardMetaInfo = {
      redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
      redirectedSectionName: this.outOfStock ? 'recent_products_oos' : 'recent_productss'
    }
    if(!this.recentProductList || this.recentProductList.length == 0){
      this.getRecents();
    }else{
      this.recentProductItems = this.recentProductList.filter(
        (item) =>
          item.moglixPartNumber.toLowerCase() !=this.currentProductMsn.toLowerCase()
      );
    }
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }
  getRecents() {
    let user = this.localStorageService.retrieve('user');
    const userId = (user['userId']) ? user['userId'] : null;
    this.productService.getrecentProduct(userId).subscribe(result => {
      if (result['statusCode'] === 200) {
        this.recentProductItems = (result['data'] as any[]).map(product => this.productService.recentProductResponseToProductEntity(product));
        if (this.recentProductItems.length <= 1 ) { this.noRecentlyViewed$.emit(true);}
      }
    })
  }

}

@NgModule({
  declarations: [
    RecentViewedProductsComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    MathCeilPipeModule,
    MathFloorPipeModule,
    ProductCardVerticalGridViewModule,
    ProductCardVerticalContainerModule
  ],
})
export class RecentViewedProductsModule { }
