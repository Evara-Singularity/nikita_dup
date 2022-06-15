import { Component, NgModule, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrayFilterPipeModule } from "@app/utils/pipes/k-array-filter.pipe";
import { ProductService } from '@app/utils/services/product.service';

@Component({
  selector: 'app-product-carousel-section',
  templateUrl: './product-carousel-section.component.html',
  styleUrls: ['./product-carousel-section.component.scss']
})
export class ProductCarouselSectionComponent {

  @Input('productAllImages') productAllImages;
  @Input('carouselInitialized') carouselInitialized;
  @Input('isPurcahseListProduct') isPurcahseListProduct;
  @Input('productOutOfStock') productOutOfStock;
  @Input('imagePathAsset') imagePathAsset;
  @Input('isProductCrouselLoaded') isProductCrouselLoaded;
  @Input('productCrouselInstance') productCrouselInstance;
  @Input('iOptions') iOptions;
  @Input('productTags') productTags;
  @Input('productName') productName;
  @Output() loadProductShare: EventEmitter<any> = new EventEmitter<any>();
  @Output() addToPurchaseList: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrollToId: EventEmitter<any> = new EventEmitter<any>();
  @Output() openPopUpcrousel: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRotateNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRotatePrevious: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadProductCrousel: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendProductImageClickTracking: EventEmitter<any> = new EventEmitter<any>();

  constructor(public productService: ProductService) { }

  loadProductcrousel(i) {
    this.loadProductCrousel.emit(i);
  }

  loadProductshare() {
    this.loadProductShare.emit();
  }

  addToPurchaselist() {
    this.addToPurchaseList.emit();
  }

  scrollToid(data) {
    this.scrollToId.emit(data);
  }

  openPopUpCrousel(data) {
    this.openPopUpcrousel.emit(data);
  }

  onRotatenext() {
    this.onRotateNext.emit();
  }

  onRotateprevious() {
    this.onRotatePrevious.emit();
  }

  sendProductImageClicktracking() {
    this.sendProductImageClickTracking.emit();
  }

}

@NgModule({
  declarations: [ProductCarouselSectionComponent],
  imports: [
    CommonModule,
    ArrayFilterPipeModule
  ],
  exports: [
    ProductCarouselSectionComponent
  ]
})
export class ProductCarouselSectionModule { }
