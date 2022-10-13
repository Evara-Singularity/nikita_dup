import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { ProductCardHorizontalListViewModule } from '../product-card/product-card-horizontal-list-view/product-card-horizontal-list-view.module';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { ProductService } from '@app/utils/services/product.service';


@Component({
  selector: 'app-cartAddProduct',
  templateUrl: './cartAddProduct.component.html',
  styleUrls: ['./cartAddProduct.component.scss']
})
export class CartAddProductComponent implements OnInit {

  @Input() similarProductData
  readonly pageName = "CartAddSimilarproduct";

  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: true,
    enableBuyNow: false,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    // design config
    enableCard: true,
    verticalOrientation: false,
    horizontalOrientation: true,
    lazyLoadImage: false
  }
  cartAddProductSimilarData

  constructor(private productService: ProductService,) { }

  ngOnInit() {
    this.getCartAddProductSimilarData(this.similarProductData.products);
  }

  getCartAddProductSimilarData(products: object[]) {
    return this.cartAddProductSimilarData = products.map(product => {
      return this.productService.addCartSimilarProductToProductEntity(product)
    });
  }

}

@NgModule({
  imports: [
    CommonModule,
    BottomMenuModule,
    ProductCardHorizontalListViewModule
  ],
  declarations: [CartAddProductComponent],
  exports: [CartAddProductComponent]
})
export class CartAddProductModule { }

