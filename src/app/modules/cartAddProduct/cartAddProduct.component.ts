import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { ProductCardHorizontalListViewModule } from '../product-card/product-card-horizontal-list-view/product-card-horizontal-list-view.module';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { ProductService } from '@app/utils/services/product.service';
import { CommonService } from '@app/utils/services/common.service';


@Component({
  selector: 'app-cartAddProduct',
  templateUrl: './cartAddProduct.component.html',
  styleUrls: ['./cartAddProduct.component.scss']
})
export class CartAddProductComponent implements OnInit, AfterViewInit {

  @Input() similarProductData
  readonly pageName = "CartAddSimilarproduct";
  @Output() closePopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closePopupOnOutsideClick: EventEmitter<{}> = new EventEmitter<{}>();

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

  constructor(private productService: ProductService, private commonService: CommonService) { }

  ngOnInit() {
    this.getCartAddProductSimilarData(this.similarProductData.products);
  }

  ngAfterViewInit(): void {
    this.commonService.setBodyScroll(null, false);
  }

  close(data) {
    console.log("close at cartaAddProduct component");
    this.closePopup.emit(data);
  }

  popupOnOutsideClick(data) {
    this.closePopupOnOutsideClick.emit(data)
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

