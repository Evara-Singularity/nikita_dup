import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductService } from '../../utils/services/product.service';
import { forkJoin} from 'rxjs';
@Component({
    selector: 'app-product-offers',
    templateUrl: './product-offers.component.html',
    styleUrls: ['./product-offers.component.scss']
})
export class ProductOffersComponent implements OnInit
{
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    allofferData: any = null;
    @Output() viewPopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() emaiComparePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() promoCodePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Input() price = 0;
    @Input() gstPercentage;
    @Input() productmsn;
    disableEMIView = false;
    promoCodes: any;
    promoCodeOffers: any = {
        "status": true,
        "statusCode": 200,
        "statusDescription": "Total availables PromoCode for Product MSNIKIR0Z551 is 1",
        "validAttributes": null,
        "data": {
          "maxDiscountPromoCode": {
            "promoId": 130,
            "promoCode": "FLAT5",
            "discountApplicable": 27,
            "promoDescription": "Flat 5% Off on Selected Products",
            "displayMessage": null
          },
          "applicablePromoCodeList": [
            {
              "promoId": 130,
              "promoCode": "FLAT5",
              "promoDescription": "Flat 5% Off on Selected Products",
              "isVisible": true,
              "totalCoupons": 100000,
              "couponsRemaining": 99728,
              "maxCouponsPerCustomer": 1,
              "activationTime": 1561980326000,
              "expiryTime": 1690500334000,
              "onlyForNewUser": false,
              "device": "all",
              "discountApplicable": 27,
              "displayMessage": null,
              "exclusive": true,
              "enabled": true
            },
            {
                "promoId": 140,
                "promoCode": "FLAT15",
                "promoDescription": "Flat 15% Off on Selected Products",
                "isVisible": true,
                "totalCoupons": 100000,
                "couponsRemaining": 99728,
                "maxCouponsPerCustomer": 1,
                "activationTime": 1561980326000,
                "expiryTime": 1690500334000,
                "onlyForNewUser": false,
                "device": "all",
                "discountApplicable": 70,
                "displayMessage": null,
                "exclusive": true,
                "enabled": true
              }
          ]
        }
      }
     

    constructor(
        private productService: ProductService
    ) { }

    ngOnInit(): void
    {
        console.log("gstPercentage --->>", this.gstPercentage)
        if (this.price < 3000) { this.disableEMIView = true; }
        this.getOfferAllData();
    }

    getOfferAllData(){
         forkJoin([
            this.productService.getAllOffers(),
            this.productService.getAllPromoCodeOffers()
          ]).subscribe(
            (responses) => {
                console.log("responses --->>>", responses)
              let data1: any = responses[0] || [];
              let data2: any = responses[1] || [];
              if (data1.statusCode == 200) {
                this.allofferData = (data1.data as any[]).map((item: any, index) => Object.assign({}, item, { index }));
              }
              data2 = this.promoCodeOffers;
              if (data2.statusCode == 200) {
                this.promoCodes = (data2.data.applicablePromoCodeList as any[]).map((item: any, index) => Object.assign({}, item, { index }));
              }
            },
            (error) => {
              console.log(error)
            }
          );
    }

    sendOfferData(offerData)
    {
        this.viewPopUpHandler.emit(offerData);
    }

    openEmiPopup()
    {
        if (this.disableEMIView) return;
        this.emaiComparePopUpHandler.emit(true);
    }

    seeMoreOffers(){
        // const promoOffers = [...this.promoCodes];
        // console.log(promoOffers.splice(1, 1));
        // const promos= promoOffers.splice(1, 1)
        this.promoCodePopUpHandler.emit(this.promoCodes);
    }

}
@NgModule({
    declarations: [ProductOffersComponent],
    imports: [
        CommonModule
    ]
})
export class ProductOffersModule
{

}
