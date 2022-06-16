import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ClientUtility } from '@app/utils/client.utility';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';

@Component({
  selector: 'product-description',
  templateUrl: './product-description.component.html',
  styleUrls: ['./product-description.component.scss']
})
export class ProductDescriptionComponent implements OnInit {
  @Input() productPrice;
  @Input() productName;
  @Input() productTags;
  @Input() refinedProdTags;
  @Input() productMrp;
  @Input() priceWithoutTax;
  @Input() productDiscount;
  @Input() bulkPriceWithoutTax;
  @Input() bulkDiscount;
  @Input() taxPercentage;
  @Input() bulkSellingPrice;
  @Input() productOutOfStock;
  @Input() productMinimmumQuantity;
  @Input() priceQuantityCountry;
  @Input() starsCount;
  @Input() rawReviewsData;
  @Input() rawProductCountMessage;
  @Input() qunatityFormControl;
  @Input() isBulkPricesProduct;
  @Input() productBulkPrices;
  @Input() selectedProductBulkPrice;
 // @Output() checkBulkPriceMode$: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrollToResults$: EventEmitter<any> = new EventEmitter<any>();
  singlePeacePrice:any;


  constructor(private _tms: ToastMessageService) { }

  ngOnInit(): void {
   this.singlePeacePrice = this.priceWithoutTax;
  }

  updateProductQunatity(type: 'INCREMENT' | 'DECREMENT') {
    switch (type) {
      case 'DECREMENT':
        this.checkCartQuantityAndUpdate((this.cartQunatityForProduct - 1))
        break;
      case 'INCREMENT':
        this.checkCartQuantityAndUpdate((this.cartQunatityForProduct + 1))
        break;
      default:
        break;
    }
  }

  get cartQunatityForProduct() {
    return parseInt(this.qunatityFormControl.value) || 1;
  }

  private checkCartQuantityAndUpdate(value): void {
    if (!value) {
      this._tms.show({
        type: 'error',
        text: (value == 0) ? 'Minimum qty can be ordered is: 1' : 'Please enter a value quantity',
      })
      this.qunatityFormControl.setValue(this.productMinimmumQuantity);
    } else {
      if (parseInt(value) < parseInt(this.productMinimmumQuantity)) {
        this._tms.show({
          type: 'error',
          text: 'Minimum qty can be ordered is: ' + this.productMinimmumQuantity
        })
        this.qunatityFormControl.setValue(this.productMinimmumQuantity);
      } else if (parseInt(value) > parseInt(this.priceQuantityCountry['quantityAvailable'])) {
        this._tms.show({
          type: 'error',
          text: 'Maximum qty can be ordered is: ' + this.priceQuantityCountry['quantityAvailable']
        })
        this.qunatityFormControl.setValue(this.priceQuantityCountry['quantityAvailable']);
      } else if (isNaN(parseInt(value))) {
        this.qunatityFormControl.setValue(this.productMinimmumQuantity);
        this.checkBulkPriceMode();
      } else {
        this.qunatityFormControl.setValue(value);
        this.checkBulkPriceMode();
      }
    }
  }

  checkBulkPriceMode() {
    if (this.isBulkPricesProduct) {
      const selectedProductBulkPrice = this.productBulkPrices.filter(prices => (this.cartQunatityForProduct >= prices.minQty && this.cartQunatityForProduct <= prices.maxQty));
      this.selectedProductBulkPrice = (selectedProductBulkPrice.length > 0) ? selectedProductBulkPrice[0] : null;
      if(this.cartQunatityForProduct > 1 && this.selectedProductBulkPrice){
        this.priceWithoutTax = this.selectedProductBulkPrice['bulkSPWithoutTax'] ?? this.priceWithoutTax;
      }else{
        this.priceWithoutTax = this.singlePeacePrice;
      }
    }
  }

  onChangeCartQuanityValue() {
    this.checkCartQuantityAndUpdate(this.qunatityFormControl.value);
  }

  scrollToResults(id: string, offset) {
    if (document.getElementById(id)) {
      let footerOffset = document.getElementById(id).offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset + offset);
    }
  }
}

@NgModule({
  declarations: [ProductDescriptionComponent],
  imports: [ReactiveFormsModule,
    NumberDirectiveModule,
    MathFloorPipeModule,
    CommonModule
  ],
  exports: [ProductDescriptionComponent]
})

export default class ProductDescriptionModule {
}