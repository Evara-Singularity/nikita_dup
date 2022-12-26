import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';

@Component({
  selector: 'product-bulk-quantity',
  templateUrl: './product-bulk-quantity.component.html',
  styleUrls: ['./product-bulk-quantity.component.scss']
})
export class ProductBulkQuantityComponent implements OnInit {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input() rawProductData;
  @Input() productOutOfStock;
  @Input() isCommonProduct;
  @Input() priceQuantityCountry;
  @Input() productBulkPrices;
  @Input() cartQunatityForProduct;
  @Input() qunatityFormControl;
  @Output() checkBulkPriceMode$: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectProductBulkPrice$: EventEmitter<number> = new EventEmitter<number>();
  @Input() productMinimmumQuantity;

  constructor(private _tms: ToastMessageService,private _commonService:CommonService) { }

  ngOnInit(): void {
    // this.getEachItem();
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
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
