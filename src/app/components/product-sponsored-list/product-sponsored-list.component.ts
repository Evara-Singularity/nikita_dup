import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductHorizontalCardModule } from '@app/modules/product-horizontal-card/product-horizontal-card.module';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
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
  @Input() categoryCode: string;

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
  }
  cardMetaInfo: ProductCardMetaInfo = null;

  constructor(
    private productService: ProductService,
  ) { }

  ngOnInit() {
    this.cardMetaInfo = {
      redirectedIdentifier: CONSTANTS.PRODUCT_CARD_MODULE_NAMES.PDP,
      redirectedSectionName: this.outOfStock ? 'sponsered_products_oos' : 'sponsered_products'
    }
    this.getProductList();
  }

  getProductList() {
    this.productService.getSimilarProducts(this.productName, this.categoryCode).subscribe((response: any) => {
      let products = response['products'];
      if (products && (products as []).length > 0) {
        this.productList = (products as any[]).map(product => this.convertToProductEntity(product));
      }
    })
  }

  convertToProductEntity(product: any) {
    const partNumber = product['partNumber'] || product['defaultPartNumber'] || product['moglixPartNumber'];
    const productMrp = product['mrp'];
    const productPrice = product['salesPrice'];
    const priceWithoutTax = product['priceWithoutTax'];
    return {
      moglixPartNumber: partNumber,
      moglixProductNo: product['moglixProductNo'] || null,
      mrp: productMrp,
      salesPrice: productPrice,
      priceWithoutTax: priceWithoutTax,
      productName: product['productName'],
      variantName: product['productName'],
      productUrl: product['productUrl'],
      shortDesc: product['shortDesc'],
      brandId: product['brandId'],
      brandName: product['brandName'],
      quantityAvailable: product['quantityAvailable'],
      discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(0),
      rating: product['rating'] || null,
      categoryCodes: null,
      taxonomy: product['taxonomy'],
      mainImageLink: (product['moglixImageNumber']) ? product['mainImageLink'] : '',
      productTags: [],
      filterableAttributes: {},
      avgRating: product.avgRating,
      itemInPack: null,
      ratingCount: product.ratingCount,
      reviewCount: product.reviewCount
    } as ProductsEntity;
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
