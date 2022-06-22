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
  @Output() selectProductBulkPrice$: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _tms: ToastMessageService) { }

  ngOnInit(): void {
  }

  selectProductBulkPrice(qunatity) {
    this.qunatityFormControl.setValue(qunatity);
    this.selectProductBulkPrice$.emit(qunatity);
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
