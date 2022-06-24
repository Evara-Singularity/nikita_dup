import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { NavigationExtras,Router,  RouterModule } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { ProductService } from '@app/utils/services/product.service';
import { CommonService } from '@app/utils/services/common.service';
import { ProductUtilsService } from '@app/utils/services/product-utils.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';

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
  isRFQSubmitted:boolean = false;
  isUserLoggedIn = false;
  userSession = null;
  isBrowser = false;
  isPopup = true;

  rfqUpdateForm = new FormGroup({
    quantity: new FormControl(1),
    businessPurchase: new FormControl(false)
  });

  constructor(private localStorageService: LocalStorageService, private productService: ProductService, private productUtil: ProductUtilsService, private tms: ToastMessageService,
    private router: Router, private localAuthService: LocalAuthService,  private cd: ChangeDetectorRef, public _commonService: CommonService) {
    this.isBrowser = _commonService.isBrowser;
}

  ngOnInit(): void {
    this.setProductDetails();
    this.userSession = this.localStorageService.retrieve('user');
    this.isUserLoggedIn = (this.userSession && this.userSession.authenticated == 'true');
  }

  setProductDetails() {
    this.productMOQ = parseInt(this.product['moq']) ? parseInt(this.product['moq']) : 1;
    this.quantity.setValidators([Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.min(this.productMOQ), Validators.max(this.productMAQ), Validators.maxLength(3)]);
    this.quantity.setValue(this.productMOQ ? this.productMOQ : 1);
    this.quantity.updateValueAndValidity();
}

increaseQuantity() {
  if (this.isUserLoggedIn) {
      let value = parseInt(this.quantity.value);
      if (isNaN(value) || this.quantity.hasError('min')) {
          this.quantity.setValue(this.productMOQ);
      } else {
          let assumedQuantity = parseInt(this.quantity.value) + 1;
          if (assumedQuantity < this.productMAQ) {
              this.quantity.setValue(assumedQuantity);
          }
      }
  } else {
      this.initiateLogin();
  }
}

decreaseQuantity() {
  if (this.isUserLoggedIn) {
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
  } else {
      this.initiateLogin();
  }
}

close() {
  this.isPopup = false;
  this.isRFQSubmitted = false;
  this._commonService.oosSimilarCard$.next(false);
}

  initiateLogin($event?) {
    if ($event) {
      $event.preventDefault();
    }
    if (!this.isUserLoggedIn) {
      //use locaauthservice as it is hard to carry back url in otp
      this.localAuthService.setBackURLTitle(this.product['url'], "Continue to raise RFQ");
      let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this.product['url'] } };
      this.router.navigate(['/login'], navigationExtras);
    }
  }

  processRFQ(rfqDetails) {
    if (this.isUserLoggedIn) {
      this.verifyData(rfqDetails);
    } else {
      this.initiateLogin();
    }
  }

  verifyData(rfqDetails) {
    this.isRFQSubmitted = true;
    this.rfqUpdateForm.markAllAsTouched();
    if (this.rfqUpdateForm.valid) {
      console.log("rfqDetails ---> ",rfqDetails);
    // api is not integrated  yet thus output of onRFQUpdateSuccess sent true
    this.isRFQSubmitted = true;
    this.onRFQUpdateSuccess.emit(true);
    // end ...........
    //this.updateRFQ(rfqDetails);
    }
  }

  updateRFQ(rfqDetails) {
    let data = {};
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
       PopUpModule,
       BottomMenuModule,
       RouterModule 
  ],
})
export class ProductRfqUpdatePopupModule { }
