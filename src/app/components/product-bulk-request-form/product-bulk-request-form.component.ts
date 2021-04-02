import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, NgModule, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ProductService } from '../../utils/services/product.service';
import { Step } from '../../utils/validators/step.validate';
import { stateList } from '../../utils/data/state';
import { PincodeValidator } from '../../utils/validators/pincode.validator';

@Component({
  selector: 'app-product-bulk-request-form',
  templateUrl: './product-bulk-request-form.component.html',
  styleUrls: ['./product-bulk-request-form.component.scss'],
})
export class ProductBulkRequestFormComponent implements OnInit {

  outOfStockForm: FormGroup;
  isChecked: boolean = false;
  isOutOfStockSuccessfull: boolean = false;
  @Input() openBulkRequestPopup: boolean = true;
  @Input() productName: string;
  @Input() productInfo: any;
  stateList: Array<{ "idState": number, "idCountry": number, "name": string }>;
  verifiedGSTINValue = '';
  @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isSubmitted: EventEmitter<boolean> = new EventEmitter<boolean>();
  isGSTINVerified = false;
  isPincodeNotValid = false;
  gstinError = '';

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.stateList = stateList["dataList"];
    this.createForm();
  }

  createForm() {
    const user = this.localStorageService.retrieve('user');
    this.outOfStockForm = this.formBuilder.group({
        tin: [null],
        quantity: [this.productInfo['minimal_quantity'], [Validators.required]],
        first_name: [user && user["userName"] != null ? user["userName"] : "", [Validators.required]],
        email: [(user != null && user.authenticated == "true") ? user.email : "", [Validators.required, Step.validateEmail]],
        description: ['', []],
        phone: [(user != null && user.authenticated == "true") ? user.phone : "", [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
        rfq_pincode: ['', PincodeValidator.validatePincode],
        city: [null, Validators.required],
        stateName: [null, Validators.required],
        brandName: [this.productInfo['brand']],
        usertype: [this.isChecked, [Validators.required]],
      }
    );
  }

  verifyGSTIN(formValue) {
    this.isLoading.emit(true);
    let gstin = (this.outOfStockForm.get('tin').value) ? (this.outOfStockForm.get('tin').value as string).toLocaleUpperCase() : '';
    if (this.isChecked && (this.verifiedGSTINValue != gstin)) {
      this.productService.getGSTINDetails(gstin).subscribe(
        (response) => {
          if (response['statusCode'] == 200 && response['taxpayerDetails'] != null) {
            this.isGSTINVerified = response['valid'];
            this.verifiedGSTINValue = (gstin as string).toUpperCase();
            this.outOfStockBtn(formValue);
          } else {
            this.resetGSTINVarification(response['message']);
          }
          this.isLoading.emit(false);
        },
        (error) => { this.isLoading.emit(false); this.resetGSTINVarification(''); }
      );
    } else {
      this.outOfStockBtn(formValue);
    }
  }

  outOfStockBtn(data){
      let user = this.localStorageService.retrieve('user');
      let obj = {
          "rfqEnquiryCustomer": {
              "firstName": data['first_name'],
              "lastName": data['last_name'],
              "email": data['email'],
              "mobile": data['phone'],
              "designation": data['designation'],
              "company": data['company_name'],
              "description": data['description'],
              "city": data['city'],
              "state": data['stateName'],
              "pincode": parseInt(data['rfq_pincode']),
              "buyerId": data['buyertype'],
              "tin": this.isChecked ? data['tin'] : "",
              "customerId": (user != undefined && user != null && user.authenticated == "true") ? user.userId : "",
              "rfqValue": this.productInfo["price"] * data["quantity"],
              "device": "mobile"
          },
          "rfqEnquiryItemsList": [{
              productName: this.productInfo['productName'],
              brand: this.productInfo['brand'],
              quantity: data["quantity"],
              prodReference: this.productInfo['partNumber'],
              taxonomyCode: this.productInfo['taxonomy']
          }]
      };

      this.productService.postBulkEnquiry(obj).subscribe(
          res =>
          {
              if (res['statusCode'] == 200) {
                  this.isOutOfStockSuccessfull = true;
                  this.openBulkRequestPopup = false;
                  this.isSubmitted.emit(true);
                  setTimeout(() =>
                  {
                     this.closeAlert();
                  }, 5000)
              }
          }
      );

  }

  resetGSTINVarification(message){
      this.isGSTINVerified = false;
      this.verifiedGSTINValue = '';
      this.gstinError = message;
  }

  closeAlert(){
      this.isOutOfStockSuccessfull = false;
  }

  changeOosUserType()
  {
      this.isChecked = !this.isChecked;

      if (this.isChecked) {
          this.outOfStockForm.get("tin").setValidators([Validators.required, Validators.pattern('[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9a-zA-Z]{1}')]);
      } else {
          this.outOfStockForm.get("tin").clearValidators();
          this.outOfStockForm.get("tin").updateValueAndValidity();
      }

      this.outOfStockForm.patchValue({
          buyertype: "",
          usertype: this.isChecked
      });
       
      this.outOfStockForm.get("tin").updateValueAndValidity();
      return this.isChecked;
  }

  checkQuantityCode(event){
      return event.charCode >= 48 && event.charCode <= 57;
  }


  getByPincode(){
      //form controls of Pincode
      let pincode = this.outOfStockForm.controls['rfq_pincode'];
      let city = this.outOfStockForm.controls['city'];
      let stateName = this.outOfStockForm.controls['stateName'];

      if (pincode.status == 'VALID') {
          this.isPincodeNotValid = false;
          this.productService.getStateCityByPinCode(pincode.value).subscribe((res) =>
          {
              if (res['status']) {
                  let dataList = res['dataList'][0];
                  city.setValue(dataList.city);
                  this.stateList.forEach(element =>
                  {
                      if (element.idState == parseInt(dataList['state'])) {
                          stateName.setValue(element.name);
                      }
                  });
              }
              else {
                  this.isPincodeNotValid = true;
                  this.resetCityState();
              }
          }, (error) => { this.resetCityState(); }
          )
      }

      else {
          this.resetCityState();
      }
  }
  
  resetCityState(){
      let city = this.outOfStockForm.controls['city'];
      let stateName = this.outOfStockForm.controls['stateName'];
      city.setValue(null);
      stateName.setValue(null);
  }

  close(){
    this.openBulkRequestPopup = false;
  }

  get rfqQuantity() { return this.outOfStockForm.get('quantity'); };

}


@NgModule({
  declarations: [ProductBulkRequestFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModule
  ],
})
export class ProductBulkRequestFormModule {
  constructor( ) {
  }
}
