import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { ProductCardVerticalGridViewModule } from '@app/modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { SimilarProductModule } from '../similar-products/similar-products.component';

@Component({
  selector: 'simillar-products-popup',
  templateUrl: './simillar-products-popup.component.html',
  styleUrls: ['./simillar-products-popup.component.scss']
})
export class SimillarProductsPopupComponent {

  @Input('wishListData') wishListData: Array<object>  = [];
  @Output('closePopup$') closePopup$ = new EventEmitter();
  @Input('msnid') msnid: string = ""; 
  @Input('msnid') productName: string = "";
  isSimilarDataLoaded: Boolean = true;

  readonly cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: false,
    enableBuyNow: false,
    enableFeatures: false,
    enableRating: true,
    enableVideo: false,
    enableFullAddToCart: true,
    // design config
    enableCard: true,
    verticalOrientation: true,
    horizontalOrientation: false,
    lazyLoadImage: false,
  }

  constructor() { }

  closePopup(){
    this.closePopup$.emit(true);
  }

  similarDataLoaded(isLoaded){
    this.isSimilarDataLoaded = isLoaded;
  }

}

@NgModule({
  declarations: [SimillarProductsPopupComponent],
  imports: [
    CommonModule,
    BottomMenuModule,
    ProductCardVerticalGridViewModule,
    ProductCardVerticalContainerModule,
    SimilarProductModule
  ]
})
export class SimillarProductsPopupModule { }
