import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductService } from '../../utils/services/product.service';
import { forkJoin} from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, NavigationEnd, NavigationExtras, NavigationStart, Router } from "@angular/router";
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { MathCeilPipeModule } from '@pipes/math-ceil';

@Component({
    selector: 'app-product-offers',
    templateUrl: './product-offers.component.html',
    styleUrls: ['./product-offers.component.scss']
})
export class ProductOffersComponent implements OnInit
{
    productStaticData = this.common.defaultLocaleValue;
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    allofferData: any = null;
    @Output() promoCodePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() viewPopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() emaiComparePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Input() price = 0;
    @Input() gstPercentage;
    @Input() productmsn;
    @Input() brandName;
    @Input() categoryId;
    @Input() categoryName;
    disableEMIView = false;
    promoCodes: any;
    couponForbrandCategory:any=null;
    minimumRequiredPriceforCoupon: any;
    couponForbrandCategoryDiscount: any;

    constructor(
        private productService: ProductService,
        public localStorageService: LocalStorageService,
        private common: CommonService,
        private route: ActivatedRoute,
        private router: Router,
        private _dataService: DataService,
        private _globalLoader: GlobalLoaderService,
    ) { }

    ngOnInit(): void
    {
      this.getStaticSubjectData();
      let user: any = this.localStorageService.retrieve('user');
      if (user && user.authenticated == "true") {
        if (this.price < 3000) { this.disableEMIView = true; }
        this.getOfferAllData(user.userId);
      }else { this.getOfferAllData(null);}

    }
    getStaticSubjectData(){
      this.common.changeStaticJson.subscribe(staticJsonData => {
        this.common.defaultLocaleValue = staticJsonData;
        this.productStaticData = staticJsonData;
      });
    }

    getOfferAllData(user){
          let url : any ;
          if(user != null && user != undefined){
            url= "?userId="+ user + "&msn=" + this.productmsn + "&device=web";
          }else {
            url= "?msn=" + this.productmsn + "&device=web";
          }
         forkJoin([
          this.productService.getAllPromoCodeOffers(url),
          this.productService.getAllOffers()
          ]).subscribe(
            (responses) => {
              let data1: any = responses[0] || [];
              let data2: any = responses[1] || [];
              if (data1.statusCode == 200) {
                this.promoCodes = (data1.data.applicablePromoCodeList as any[]).map((item: any, index) => Object.assign({}, item, { index }));
              }
              if (data2.statusCode == 200) {
                this.allofferData = (data2.data as any[]).map((item: any, index) => Object.assign({}, item, { index }));
              }
            },
            (error) => {
              console.log(error)
            }
          );
    }

    ngAfterViewInit(){
      this.couponOnPDPBrandCategory();
  }

  couponOnPDPBrandCategory() {
    if (this.brandName && this.categoryId) {
      this._globalLoader.setLoaderState(true);
      this._dataService.getCouponOnBrandCategory(this.brandName, this.categoryId).subscribe(response => {
        if (response['statusCode'] == 200 && response['data'] != null) {
          this.couponForbrandCategory = response['data'];
          this.minimumRequiredPriceforCoupon = response['data']['minimumCartValue']
          this.couponForbrandCategoryDiscount = this.couponForbrandCategory['absoluteDiscount'] ? ('₹' + this.couponForbrandCategory['absoluteDiscount']) : (this.couponForbrandCategory['percentageDiscount'] + '%')
        } else {
          this.couponForbrandCategory = null;
        }
        this._globalLoader.setLoaderState(false)
      })

    }
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
        this.promoCodePopUpHandler.emit(this.promoCodes);
    }

}
@NgModule({
    declarations: [ProductOffersComponent],
    imports: [
        CommonModule,
        MathCeilPipeModule
    ]
})
export class ProductOffersModule
{

}
