import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductHorizontalCardModule } from '@app/modules/product-horizontal-card/product-horizontal-card.module';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { CommonService } from '@app/utils/services/common.service';
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'app-product-sponsored-list',
  templateUrl: './product-sponsored-list.component.html',
  styleUrls: ['./product-sponsored-list.component.scss']
})
export class ProductSponsoredListComponent implements OnInit {

  productList: ProductsEntity[] = null;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Input() outOfStock: boolean = false;
  @Input() productName: string;
  @Input() productId: string;
  @Input() categoryCode: string;
  @Input('analytics') analytics = null;
  @Output('sponseredDataLoaded$') sponseredDataLoaded$ = new EventEmitter();
  readonly lowestCountToDisplay: number = 2

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
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    this.cardMetaInfo = {
      redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
      redirectedSectionName: this.outOfStock ? 'sponsered_products_oos' : 'sponsered_products'
    }
    this.getProductList();
  }

  getProductList() {
    const query = {
      a_type: 'PRODUCT',
      client_id: 302211,
      sku_ids: encodeURIComponent(this.productId ? this.productId.toLowerCase() : ''),
      pcnt: 10,
      page_type: 'PRODUCT',
      device_id: this.commonService.getUniqueGAId()
    }
    this.productService.getSponseredProducts(query).subscribe((response: any) => {
      let products = response['products'];
      if (products && (products as []).length > this.lowestCountToDisplay) {
        this.productList = (products as any[]).map(product => this.productService.searchResponseToProductEntity(product));
        this.sponseredDataLoaded$.emit(true);
      }
    });
  }

}

@NgModule({
  declarations: [
    ProductSponsoredListComponent
  ],
  imports: [
    CommonModule,
    ProductHorizontalCardModule
  ],
})
export class RecentViewedProductsModule { }
