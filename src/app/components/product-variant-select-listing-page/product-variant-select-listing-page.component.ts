import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';

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
  @Output() selectedVariant$ = new EventEmitter<{ msn: string, buyNow: boolean }>();
  @Output() continueToCart$ = new EventEmitter<{ product: AddToCartProductSchema, buyNow: boolean }>();

  constructor() { }

  ngOnInit(): void {
  }

  emitVariant(msn: string, isSecleted, isActive): void {
    if (!isSecleted && isActive) {
      this.selectedVariant$.emit({ msn, buyNow: this.buyNow });
    }
  }

  continueToCart() {
    this.continueToCart$.emit({ product: this.productGroupData, buyNow: this.buyNow })
  }

}


@NgModule({
  declarations: [
    ProductVariantSelectListingPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RatingPipeModule
  ],
})
export class ProductVariantSelectListingPageModule { }
