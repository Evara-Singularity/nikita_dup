import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'product-variant-select-listing-page',
  templateUrl: './product-variant-select-listing-page.component.html',
  styleUrls: ['./product-variant-select-listing-page.component.scss']
})
export class ProductVariantSelectListingPageComponent implements OnInit {

  readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;

  @Input() product: ProductsEntity;
  @Input() productGroupData: AddToCartProductSchema;
  @Input() buyNow: boolean = false;
  @Input() isSelectedVariantOOO: boolean = false;
  @Output() selectedVariant$ = new EventEmitter<{ msn: string, buyNow: boolean }>();
  @Output() selectedVariantOOO$ = new EventEmitter<any>();
  @Output() continueToCart$ = new EventEmitter<{ product: AddToCartProductSchema, buyNow: boolean }>();
  @Output() hide$ = new EventEmitter<boolean>();
  currentlySelectedMSN: string

  ngOnInit(): void {
    this.currentlySelectedMSN = this.product.moglixPartNumber;
  }

  emitVariant(msn: string): void {
    this.currentlySelectedMSN = msn;
    this.selectedVariant$.emit({ msn, buyNow: this.buyNow });
  }

  continueToSendQuery(){
    this.selectedVariantOOO$.emit(this.currentlySelectedMSN);
  }

  continueToCart() {
    this.continueToCart$.emit({ product: this.productGroupData, buyNow: this.buyNow })
  }

  hide() {
    this.hide$.emit(true);
  }

}


@NgModule({
  declarations: [
    ProductVariantSelectListingPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RatingPipeModule,
    BottomMenuModule,
    MathFloorPipeModule
  ],
})
export class ProductVariantSelectListingPageModule { }
