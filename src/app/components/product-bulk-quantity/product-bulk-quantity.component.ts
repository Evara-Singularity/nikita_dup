import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';

@Component({
  selector: 'product-bulk-quantity',
  templateUrl: './product-bulk-quantity.component.html',
  styleUrls: ['./product-bulk-quantity.component.scss']
})
export class ProductBulkQuantityComponent implements OnInit {

  @Input() rawProductData;
  @Input() productOutOfStock;
  @Input() isCommonProduct;
  @Input() priceQuantityCountry;
  @Input() productBulkPrices;
  @Input() cartQunatityForProduct;
  @Input() qunatityFormControl;
  @Output() checkBulkPriceMode$: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _tms: ToastMessageService) { }

  ngOnInit(): void {
  }

  selectProductBulkPrice(qunatity) {
    if (qunatity > this.priceQuantityCountry['quantityAvailable']) {
      this._tms.show({
        type: 'error',
        text: 'Maximum qty can be ordered is: ' + this.priceQuantityCountry['quantityAvailable']
      })
      return;
    }
    this.qunatityFormControl.setValue(qunatity);
    this.checkBulkPriceMode$.emit();
  }

}

@NgModule({
  declarations: [ProductBulkQuantityComponent],
  imports: [
    CommonModule,
    MathFloorPipeModule
  ],
  exports: [
    ProductBulkQuantityComponent
  ]
})
export class ProductBulkQuantityModule { }
