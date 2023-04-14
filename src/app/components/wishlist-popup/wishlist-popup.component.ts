import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, Output, EventEmitter } from '@angular/core';
import { ProductCardFeature } from '@app/utils/models/product.listing.search';
import { BottomMenuModule } from "../../modules/bottomMenu/bottom-menu.module";
import { ProductCardVerticalGridViewModule } from "../../modules/product-card/product-card-vertical-grid-view/product-card-vertical-grid-view.module";
import { ProductCardVerticalContainerModule } from "../../modules/ui/product-card-vertical-container/product-card-vertical-container.module";

@Component({
  selector: 'wishlist-popup',
  templateUrl: './wishlist-popup.component.html',
  styleUrls: ['./wishlist-popup.component.scss']
})
export class WishlistPopupComponent {
  @Input('wishListData') wishListData: Array<object>  = [];
  @Output('closePopup$') closePopup$ = new EventEmitter();

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

  closePopup(){
    this.closePopup$.emit(true);
  }

}

@NgModule({
    declarations: [
        WishlistPopupComponent
    ],
    imports: [
        CommonModule,
        BottomMenuModule,
        ProductCardVerticalGridViewModule,
        ProductCardVerticalContainerModule
    ]
})
export class WishlistPopupModule { }
