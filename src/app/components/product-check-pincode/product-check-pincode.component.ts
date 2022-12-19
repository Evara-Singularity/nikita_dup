import { CartService } from '@services/cart.service';
import { CommonService } from './../../utils/services/common.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { ProductService } from '../../utils/services/product.service';
import CONSTANTS from '@app/config/constants';


@Component({
    selector: 'product-check-pincode',
    templateUrl: './product-check-pincode.component.html',
    styleUrls: ['./product-check-pincode.component.scss']
})
export class ProductCheckPincodeComponent implements OnInit
{
    productStaticData = this._commonService.defaultLocaleValue;
    readonly FALSE = false;
    readonly TRUE = true;
    @Input() pageData: any;
    @Input() isHindiMode: boolean;
    @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() sendAnalyticsCall: EventEmitter<any> = new EventEmitter<any>();
    pincode = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]);
    isPincodeAvailble: boolean = this.FALSE;
    isServiceable: boolean = this.FALSE;
    isCashOnDelivery: boolean = this.FALSE;
    checkedPincode: any;
    deliveryDays = null;
    deliveryAnalytics = null;
    itemShippingAmount = 0;
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    isSubmitted: boolean = false;
    

    constructor(
        private localStorageService: LocalStorageService,
        private productService: ProductService,
        public _commonService: CommonService,
        private _cartService: CartService,
    ) { }

    ngOnInit(): void
    {
        this.getStaticSubjectData();
        this.checkShippingCharges();
        const user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            let params = { customerId: user.userId, invoiceType: "retail" };
            this._commonService.getAddressList(params).subscribe((res) =>
            {
                if (res["statusCode"] == 200 && res["addressList"] && res["addressList"].length > 0) {
                    this.pincode.setValue(res["addressList"][0].postCode);
                    this.checkAvailblityOnPinCode();
                }
            });
        }
    }
    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          console.log("hello got it",staticJsonData)
          this._commonService.defaultLocaleValue = staticJsonData;
          this.productStaticData = staticJsonData;
        });
      }

    checkShippingCharges()
    {
        const categoryDetails = this.pageData['categoryDetails'];
        const request = {
            "itemsList": [
                {
                    "productId": this.pageData['partNumber'],
                    "categoryId": categoryDetails['categoryCode'],
                    "taxonomy": categoryDetails['taxonomyCode']
                }
            ],
            "totalPayableAmount": this.pageData['productPrice']
        }
        this._cartService.getShippingValue(request).subscribe((response) =>
        {
            if (response['status'] && response['data'])
            {
                this.itemShippingAmount = response['data']['totalShippingAmount'];
            }
        });
    }

    checkAvailblityOnPinCode()
    {
        this.isSubmitted = true;
        const PINCODE = "pincode";
        const PARTNUMBER = this.pageData['partNumber'];
        this.isPincodeAvailble = this.FALSE;
        if (this.pincode.valid) {
            let pincode: number = this.pincode.value;
            this.isServiceable = this.FALSE;
            this.isCashOnDelivery = this.FALSE;
            const msnArr = [];
            msnArr.push(PARTNUMBER);
            this.isLoading.emit(true);
            this.productService.getLogisticAvailability({ productId: msnArr, toPincode: pincode, price: this.pageData['productPrice'] }).subscribe(
                (response: any) =>
                {
                    this.isLoading.emit(false);
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
                        this.isServiceable = (pincodeResponse.aggregate.serviceable) || this.FALSE;
                        if (this.isServiceable) {
                            if(pincodeResponse['orderToDelivery']){
                                this.setAvgDeliveryInfo(pincodeResponse['orderToDelivery'], 'YES');
                            }
                            else {
                                let avgLogisticEstimated = pincodeResponse['avgDay'] || null;
                                let avgPlatformEstimated = null;
                                let estimatedDelivery = this.pageData['estimatedDelivery'] || null;
                                this.processEstimationInfo(avgLogisticEstimated, avgPlatformEstimated, estimatedDelivery);
                            }
                        }
                        this.sendAnalyticsCall.emit({
                            serviceability: this.isServiceable,
                            codserviceability: this.isCashOnDelivery,
                            pincode: pincode,
                            deliveryDays: this.deliveryDays,
                            deliveryAnalytics: this.deliveryAnalytics,
                        });
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

    get getCodAvailable(): boolean {
        if (this.pageData['productPrice'] < CONSTANTS.GLOBAL.codMin || this.pageData['productPrice'] > CONSTANTS.GLOBAL.codMax) {
            return this.FALSE;
        }
        return true;
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
        if(this.pincode.value != null && this.pincode.value != undefined){
            this.isPincodeAvailble = (this.pincode.value == this.checkedPincode);
            if (event.which === 13 || event.key === "Enter") {
                this.checkAvailblityOnPinCode();
            }
            return (event.charCode >= 48 && event.charCode <= 57) || event.which === 8;
        }else{
            this.pincode.reset();
            return 0;
        }
       
    }


    setAvgDeliveryInfo(days: number, analytics)
    {
        if (days > 0) {
            this.deliveryDays = days + ' day(s)';
            this.deliveryAnalytics = analytics;
        }
    }

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
