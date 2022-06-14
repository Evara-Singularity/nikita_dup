import { Component, NgModule, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Input('productService') productService; 
  @Input('imagePathAsset') imagePathAsset;
  @Input('isProductCrouselLoaded') isProductCrouselLoaded;
  @Input('productCrouselInstance') productCrouselInstance; 
  @Input('iOptions') iOptions; 
  @Input('productTags') productTags; 
  @Output() loadProductShare: EventEmitter<any> = new EventEmitter<any>();
  @Output() addToPurchaseList: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrollToId: EventEmitter<any> = new EventEmitter<any>();
  @Output() openPopUpcrousel: EventEmitter<any> = new EventEmitter<any>(); 
  @Output() onRotateNext: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRotatePrevious: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadProductCrousel: EventEmitter<any> = new EventEmitter<any>();
  

}

@NgModule({
  declarations: [ProductCarouselSectionComponent],
  imports: [
    CommonModule
  ],
  exports: [
    ProductCarouselSectionComponent
  ]
})
export class ProductCarouselSectionModule { }
