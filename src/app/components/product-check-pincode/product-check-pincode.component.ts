import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ProductService } from '../../utils/services/product.service';

@Component({
  selector: 'app-product-check-pincode',
  templateUrl: './product-check-pincode.component.html',
  styleUrls: ['./product-check-pincode.component.scss']
})
export class ProductCheckPincodeComponent implements OnInit {

  @Input() openPinCodePopup: boolean = false;
  @Input() productInfo: any;
  @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sendAnalyticsCall: EventEmitter<any> = new EventEmitter<any>();
  @Output() out: EventEmitter<any> = new EventEmitter<any>();
  
  pinCodeForm: FormGroup;
  isPincodeAvailble: boolean = false;
  pincodeMessageServiceaAble: boolean = false;
  pincodeMessageCodAble: boolean = false;
  checkedPincode: any;
  deliveryDays = null;
  deliveryAnalytics = null;
  codDeliveryPincode: string;
  servicePincode: string;

  constructor(
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.createFrom();
  }

  createFrom() {
    this.pinCodeForm = this.formBuilder.group({
      pincode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]]
    });
  }

  checkPinocdeKey(event) {
    if (this.pinCodeForm.controls.pincode.value != this.checkedPincode) {
      this.isPincodeAvailble = false;
    } else {
      this.isPincodeAvailble = true;
    }
    if (event.which === 13 || event.key === "Enter") {

      this.checkAvailblityOnPinCode();
    }
    return (event.charCode >= 48 && event.charCode <= 57) || event.which === 8;
  }

  setAvgDeliveryInfo(days: number, analytics) {
    if (days > 0) {
      this.deliveryDays = days + ' day(s)';
      this.deliveryAnalytics = analytics;
    }
  }

  outData(data){
    this.out.emit(data);
  }

  checkAvailblityOnPinCode() {
    this.isPincodeAvailble = false;
    if (this.pinCodeForm.valid) {
      this.pincodeMessageServiceaAble = false;
      this.pincodeMessageCodAble = false;
      this.isPincodeAvailble = false;
      let pincode: number = this.pinCodeForm.controls['pincode'].value;
      const msnArr = [];
      msnArr.push(this.productInfo['partNumber']);
      //this.isLoading.emit(true);
      this.productService.getLogisticAvailability({ productId: msnArr, toPincode: pincode }).subscribe(
        (response: any) => {
          this.isPincodeAvailble = true;
          let pc = this.localStorageService.retrieve("pincode");
          if (!pc || !Object.keys(pc).length) {
            pc = {};
          }
          this.checkedPincode = pincode;
          pc[this.productInfo['partNumber']] = pincode;
          this.localStorageService.store("pincode", pc);
          // this.isLoading.emit(false);
          this.deliveryDays = null;
          this.deliveryAnalytics = 'NA';
          if (response.data !== null) {
            let partNumber = response.data[this.productInfo['partNumber']];
            if (partNumber.aggregate.codAvailable) {
              this.codDeliveryPincode = "COD available for " + pincode;
              this.pincodeMessageCodAble = true
            }
            else {
              this.pincodeMessageCodAble = false;

              this.codDeliveryPincode = "Cash On Delivery is unavailable for " + pincode;
            }
            if (partNumber.aggregate.serviceable) {
              let avgLogisticEstimated = null;
              let avgPlatformEstimated = null;
              if (partNumber['avgDay']) {
                avgLogisticEstimated = parseInt(partNumber['avgDay']);
              }
              if (this.productInfo['estimatedDelivery']) {
                let minPlatformEstimated = 0; let maxPlatformEstimated = 0;
                const week = /week/ig;
                let platformEstimated = (this.productInfo['estimatedDelivery'] as string);
                if (platformEstimated.indexOf('-') > -1) {
                  let tempArr = platformEstimated.split('-');
                  minPlatformEstimated = parseInt(tempArr[0]);
                  maxPlatformEstimated = parseInt(tempArr[1]);
                } else {
                  minPlatformEstimated = parseInt(platformEstimated);
                }
                if (week.test(platformEstimated)) {
                  minPlatformEstimated = minPlatformEstimated * 7;
                  maxPlatformEstimated = maxPlatformEstimated * 7;
                }
                avgPlatformEstimated = Math.floor((minPlatformEstimated + maxPlatformEstimated) / 2);
                avgPlatformEstimated = avgPlatformEstimated > 0 ? avgPlatformEstimated : 1;
              }
              if (avgLogisticEstimated && avgPlatformEstimated) {
                if (avgLogisticEstimated < avgPlatformEstimated) {
                  this.setAvgDeliveryInfo(avgLogisticEstimated, 'YES');
                } else if (avgPlatformEstimated < avgLogisticEstimated) {
                  this.setAvgDeliveryInfo(avgPlatformEstimated, 'NO');
                } else {//unexpected scenario
                  this.setAvgDeliveryInfo(avgPlatformEstimated, 'NO');
                }
              } else if (avgLogisticEstimated) {
                this.setAvgDeliveryInfo(avgLogisticEstimated, 'YES');
              } else if (avgPlatformEstimated) {
                this.setAvgDeliveryInfo(avgPlatformEstimated, 'NO');
              }
              this.pincodeMessageServiceaAble = true;
              this.servicePincode = "Service available for  " + pincode;
            }
            else {
              this.pincodeMessageServiceaAble = false;
              this.servicePincode = "Service is unavailable for  " + pincode;
            }
            this.sendAnalyticsCall.emit({
              serviceability: this.pincodeMessageServiceaAble,
              codserviceability: this.pincodeMessageCodAble,
              pincode: pincode,
              deliveryDays: this.deliveryDays,
              deliveryAnalytics: this.deliveryAnalytics,
            });
          }
          else {
            this.pincodeMessageServiceaAble = false;
            this.pincodeMessageCodAble = false;
            this.codDeliveryPincode = "COD is unavailable for " + pincode;
            this.servicePincode = "Service is unavailable for " + pincode;
          }
          // this.sendAdobeTrackingForServicing(this.pincodeMessageServiceaAble, this.pincodeMessageCodAble, pincode);
        },
        error => {
          this.isPincodeAvailble = false;
          this.isLoading.emit(false);
        }
      )
    }
  }

}


@NgModule({
  declarations: [ProductCheckPincodeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PopUpModule
  ]
})
export default class ProductCheckPincodeModule {

}
