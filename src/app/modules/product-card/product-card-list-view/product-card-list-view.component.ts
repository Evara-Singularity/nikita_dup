import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductCardFeature, ProductsEntity } from '@app/utils/models/product.listing.search';

@Component({
  selector: 'product-card-list-view',
  templateUrl: './product-card-list-view.component.html',
  styleUrls: ['./product-card-list-view.component.scss']
})
export class ProductCardListViewComponent implements OnInit {

  @Input() cardFeaturesConfig: ProductCardFeature
  @Input() product: ProductsEntity;
  @Input() prodUrl: string;
  @Input() imageCdnPath: string;
  @Input() isOutOfStockByPrice: string;
  @Input() isOutOfStockByQuantity: string;
  @Input() productReviewCount: string;
  @Input() defaultImage: string;
  @Input() isPDPImageLazyLoaded: boolean = false;

  @Output() $isVisible: EventEmitter<any> = new EventEmitter<any>();
  @Output() $showYTVideo: EventEmitter<string> = new EventEmitter<string>();
  @Output() $naviagteToPDP: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() $buyNow: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() $showRfqForm: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() $tracking: EventEmitter<any> = new EventEmitter<any>();
  @Output() $titleTracking: EventEmitter<any> = new EventEmitter<any>();


  constructor() { }

  ngOnInit(): void {
  }

  cardVisisble(event) {
    this.$isVisible.emit(event);
  }

  showYTVideo(videoLink) {
    this.$showYTVideo.emit(videoLink);
  }

  navigateToPDP() {
    this.$naviagteToPDP.emit(true);
  }

  buyNow(isBuynow: boolean = false) {
    this.$buyNow.emit(isBuynow);
  }

  openRfqForm(){
    this.$showRfqForm.emit(true);
  }

  sendTracking(name){
    this.$tracking.emit(name);
  }

  trackProductTitle(name){
    this.$titleTracking.emit(name);
  }


}
