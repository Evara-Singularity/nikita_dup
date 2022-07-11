import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { ProductService } from '../../utils/services/product.service';
import CONSTANTS from '../../config/constants';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';

@Component({
  selector: 'recent-viewed-products',
  templateUrl: './recent-viewed-products.component.html',
  styleUrls: ['./recent-viewed-products.component.scss']
})
export class RecentViewedProductsComponent implements OnInit {

  recentProductItems: ProductsEntity[] = null;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Input() outOfStock: boolean = false;
  @Input() analytics = null;

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
  ) { }

  ngOnInit(): void {
    this.cardMetaInfo = {
      redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
      redirectedSectionName: this.outOfStock ? 'recent_products_oos' : 'recent_productss'
    }
    this.getRecents();
  }

  getRecents() {
    let user = this.localStorageService.retrieve('user');
    const userId = (user['userId']) ? user['userId'] : null;
    this.productService.getrecentProduct(userId).subscribe(result => {
      if (result['statusCode'] === 200) {
        this.recentProductItems = (result['data'] as any[]).map(product => this.productService.recentProductResponseToProductEntity(product));
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
