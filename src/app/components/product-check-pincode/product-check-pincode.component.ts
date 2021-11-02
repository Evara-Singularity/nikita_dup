import { CommonService } from './../../utils/services/common.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { ProductService } from '../../utils/services/product.service';
@Component({
    selector: 'product-check-pincode',
    templateUrl: './product-check-pincode.component.html',
    styleUrls: ['./product-check-pincode.component.scss']
})
export class ProductCheckPincodeComponent implements OnInit
{
    readonly FALSE = false;
    readonly TRUE = true;
    @Input() pageData: any;
    @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() sendAnalyticsCall: EventEmitter<any> = new EventEmitter<any>();
    pincode = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]);
    isPincodeAvailble: boolean = this.FALSE;
    isServiceable: boolean = this.FALSE;
    isCashOnDelivery: boolean = this.FALSE;
    cashOnDeliveryMsg: string;
    serviceableMsg: string;
    checkedPincode: any;
    deliveryDays = null;
    deliveryAnalytics = null;

    constructor(
        private localStorageService: LocalStorageService,
        private productService: ProductService,
        private _commonService: CommonService
    ) { }

    ngOnInit(): void
    {
        const user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            let params = { customerId: user.userId, invoiceType: "retail" };
            this._commonService.getAddressList(params).subscribe((res) =>
            {
                if (res["statusCode"] == 200) {
                    this.pincode.setValue(res["addressList"][0].postCode);
                    this.checkAvailblityOnPinCode();
                }
            });
        }
    }

    checkAvailblityOnPinCode()
    {
        const PINCODE = "pincode";
        const PARTNUMBER = this.pageData['partNumber'];
        this.isPincodeAvailble = this.FALSE;
        if (this.pincode.valid) {
            let pincode: number = this.pincode.value;
            this.isServiceable = this.FALSE;
            this.isCashOnDelivery = this.FALSE;
            const msnArr = [];
            msnArr.push(PARTNUMBER);
            this.productService.getLogisticAvailability({ productId: msnArr, toPincode: pincode }).subscribe(
                (response: any) =>
                {
                    this.isPincodeAvailble = this.TRUE;
                    let pc = this.localStorageService.retrieve(PINCODE);
                    if (!pc || !Object.keys(pc).length) { pc = {}; }
                    this.checkedPincode = pincode;
                    pc[PARTNUMBER] = pincode;
                    this.localStorageService.store(PINCODE, pc);
                    this.deliveryDays = null;
                    this.deliveryAnalytics = 'NA';
                    if (response.data !== null) {
                        let pincodeResponse = response.data[PARTNUMBER];
                        this.isCashOnDelivery = (pincodeResponse.aggregate.codAvailable) || this.FALSE;
                        this.isServiceable = (pincodeResponse.aggregate.codAvailable) || this.FALSE;
                        this.updateCashOnDeliveryInfo(this.isCashOnDelivery, pincode);
                        this.updateServiceableInfo(this.isServiceable, pincode);
                        if (this.isServiceable) {
                            let avgLogisticEstimated = pincodeResponse['avgDay'] || null;
                            let avgPlatformEstimated = null;
                            let estimatedDelivery = this.pageData['estimatedDelivery'] || null;
                            this.processEstimationInfo(avgLogisticEstimated, avgPlatformEstimated, estimatedDelivery);
                        }
                        this.sendAnalyticsCall.emit({
                            serviceability: this.isServiceable,
                            codserviceability: this.isCashOnDelivery,
                            pincode: pincode,
                            deliveryDays: this.deliveryDays,
                            deliveryAnalytics: this.deliveryAnalytics,
                        });
                    }
                    else {
                        this.updateCashOnDeliveryInfo(this.FALSE, pincode);
                        this.updateServiceableInfo(this.FALSE, pincode);
                    }
                },
                error =>
                {
                    this.isPincodeAvailble = this.FALSE;
                    this.isLoading.emit(this.FALSE);
                }
            )
        }
    }

    processEstimationInfo(avgLogisticEstimated, avgPlatformEstimated, estimatedDelivery)
    {
        const ZERO = 0; const ONE = 1; const SEVEN = 7;
        const YES = "YES"; const NO = "NO";
        if (estimatedDelivery) {
            let minPlatformEstimated = ZERO; let maxPlatformEstimated = ZERO;
            const week = /week/ig;
            let platformEstimated = (estimatedDelivery as string);
            if (platformEstimated.indexOf('-') > -1) {
                let tempArr = platformEstimated.split('-');
                minPlatformEstimated = parseInt(tempArr[ZERO]);
                maxPlatformEstimated = parseInt(tempArr[ONE]);
            } else {
                minPlatformEstimated = parseInt(platformEstimated);
            }
            if (week.test(platformEstimated)) {
                minPlatformEstimated = minPlatformEstimated * SEVEN;
                maxPlatformEstimated = maxPlatformEstimated * SEVEN;
            }
            avgPlatformEstimated = Math.floor((minPlatformEstimated + maxPlatformEstimated) / 2);
            avgPlatformEstimated = avgPlatformEstimated > ZERO ? avgPlatformEstimated : ONE;
        }
        if (avgLogisticEstimated && avgPlatformEstimated) {
            if (avgLogisticEstimated < avgPlatformEstimated) {
                this.setAvgDeliveryInfo(avgLogisticEstimated, YES);
            } else if (avgPlatformEstimated < avgLogisticEstimated) {
                this.setAvgDeliveryInfo(avgPlatformEstimated, NO);
            } else {
                this.setAvgDeliveryInfo(avgPlatformEstimated, NO);
            }
        } else if (avgLogisticEstimated) {
            this.setAvgDeliveryInfo(avgLogisticEstimated, YES);
        } else if (avgPlatformEstimated) {
            this.setAvgDeliveryInfo(avgPlatformEstimated, NO);
        }
    }

    checkPinocdeKey(event)
    {
        this.isPincodeAvailble = (this.pincode.value == this.checkedPincode);
        if (event.which === 13 || event.key === "Enter") {
            this.checkAvailblityOnPinCode();
        }
        return (event.charCode >= 48 && event.charCode <= 57) || event.which === 8;
    }


    setAvgDeliveryInfo(days: number, analytics)
    {
        if (days > 0) {
            this.deliveryDays = days + ' day(s)';
            this.deliveryAnalytics = analytics;
        }
    }

    updateCashOnDeliveryInfo(isCOD, pincode) { this.cashOnDeliveryMsg = `Cash On Delivery is ${isCOD ? 'available' : 'unavailable'} for ${pincode}`; }

    updateServiceableInfo(isServiceable, pincode) { this.serviceableMsg = `Service is ${isServiceable ? 'available' : 'unavailable'} for ${pincode}`; }
}
@NgModule({
    declarations: [ProductCheckPincodeComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [ProductCheckPincodeComponent]
})
export default class ProductCheckPincodeModule { }
