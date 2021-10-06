import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { ProductService } from '../../utils/services/product.service';
import CONSTANTS from '../../config/constants';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { ProductHorizontalCardModule } from '@app/modules/product-horizontal-card/product-horizontal-card.module';

@Component({
  selector: 'app-recent-viewed-products',
  templateUrl: './recent-viewed-products.component.html',
  styleUrls: ['./recent-viewed-products.component.scss']
})
export class RecentViewedProductsComponent implements OnInit {

  recentProductItems: ProductsEntity[] = null;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Input() outOfStock: boolean = false;

  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: false,
    enableBuyNow: false,
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
        this.recentProductItems = (result['data'] as any[]).map(product => this.convertToProductEntity(product));
      }
    })
  }

  convertToProductEntity(product: any) {
    const partNumber = product['partNumber'] || product['defaultPartNumber'] || product['moglixPartNumber'];
    const productMrp = product['priceMrp'];
    const productPrice = product['priceWithTax'];
    const priceWithoutTax = product['priceWithoutTax'];
    return {
      moglixPartNumber: partNumber,
      moglixProductNo: product['moglixProductNo'] || null,
      mrp: productMrp,
      salesPrice: productPrice,
      priceWithoutTax: priceWithoutTax,
      productName: product['productName'],
      variantName: product['productName'],
      productUrl: product['url'],
      shortDesc: product['shortDesc'] || null,
      brandId: product['brandId'] || null,
      brandName: product['brandName'],
      quantityAvailable: 1,
      discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(0),
      rating: product['rating'] || null,
      categoryCodes: null,
      taxonomy: product['taxonomy'] || null,
      mainImageLink: (product['productImage']) ? product['productImage'] : '',
      mainImageMediumLink: (product['productImage']) ? product['productImage'] : '',
      mainImageThumnailLink: (product['productImage']) ? product['productImage'] : '',
      productTags: [],
      filterableAttributes: {},
      avgRating: product.avgRating || 0,
      itemInPack: null,
      ratingCount: product.ratingCount || 0,
      reviewCount: product.reviewCount || 0
    } as ProductsEntity;
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
    ProductHorizontalCardModule
  ],
})
export class RecentViewedProductsModule { }
