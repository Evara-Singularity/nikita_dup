import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '@app/utils/services/product.service';
import { CommonService } from '@app/utils/services/common.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';

@Component({
  selector: 'app-product-rfq-update-popup',
  templateUrl: './product-rfq-update-popup.component.html',
  styleUrls: ['./product-rfq-update-popup.component.scss']
})
export class ProductRfqUpdatePopupComponent implements OnInit {
  //inputs
  @Input('product') product;
  @Input('productUrl') productUrl;
  @Input('rfqId') rfqId;

  //outputs
  @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('onRFQUpdateSuccess') onRFQUpdateSuccess = new EventEmitter();
  productMOQ = 1;
  productMAQ = 999;
  isRFQSubmitted: boolean = false;
  isPopup = true;

  rfqUpdateForm = new FormGroup({
    quantity: new FormControl(1),
    businessPurchase: new FormControl(false)
  });

  constructor(private productService: ProductService, private tms: ToastMessageService,
    public _commonService: CommonService) { }

  ngOnInit(): void {
    this.setProductDetails();
  }

  setProductDetails() {
    this.productMOQ = parseInt(this.product['moq']) ? parseInt(this.product['moq']) : 1;
    this.quantity.setValidators([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.min(this.productMOQ), Validators.max(this.productMAQ), Validators.maxLength(3)]);
    this.quantity.setValue(this.productMOQ ? this.productMOQ : 1);
    this.quantity.updateValueAndValidity();
  }

  increaseQuantity() {
    let value = parseInt(this.quantity.value);
    if (isNaN(value) || this.quantity.hasError('min')) {
      this.quantity.setValue(this.productMOQ);
    } else {
      let assumedQuantity = parseInt(this.quantity.value) + 1;
      if (assumedQuantity < this.productMAQ) {
        this.quantity.setValue(assumedQuantity);
      }
    }
  }

  decreaseQuantity() {
    let value = parseInt(this.quantity.value);
    if (isNaN(value)) {
      this.quantity.setValue(this.productMOQ);
    } else if (this.quantity.valid) {
      let assumedQuantity = parseInt(this.quantity.value) - 1;
      if (assumedQuantity > this.productMOQ) {
        this.quantity.setValue(assumedQuantity);
      } else {
        this.quantity.setValue(this.productMOQ);
      }
    }
  }

  close() {
    this.isPopup = false;
    this.isRFQSubmitted = false;
    this._commonService.oosSimilarCard$.next(false);
  }

  processRFQ(rfqDetails) {
    this.isRFQSubmitted = true;
    if (this.rfqUpdateForm.valid) {
      this.updateRFQ(rfqDetails);
    }
  }

  updateRFQ(rfqDetails) {
    let data = {
      "rfqEnquiryCustomer": {
        "id": this.rfqId,
        "businessUser": rfqDetails.businessPurchase ?? false,
      },
      "rfqEnquiryItemsList": [
        {
          "enquiryItemId": this.rfqId,
          "quantity": this.quantity.value
        }
      ]
    };
    this.productService.postBulkEnquiry(data).subscribe(
      (response) => {
        if (response['statusCode'] == 200) {
          this.isLoading.emit(false);
          this.close();
          this.rfqUpdateForm.markAsUntouched();
          this.isRFQSubmitted = false;
          this.onRFQUpdateSuccess.emit(true);
        } else {
          this.isLoading.emit(false);
          this.tms.show({ type: 'error', text: response['message']['statusDescription'] });
        }
      },
      err => { this.isLoading.emit(false); }
    );
  }

  get quantity() { return this.rfqUpdateForm.get('quantity') };
}

@NgModule({
  declarations: [
    ProductRfqUpdatePopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BottomMenuModule,
  ],
})
export class ProductRfqUpdatePopupModule { }
