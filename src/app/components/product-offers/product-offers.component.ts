import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductService } from '../../utils/services/product.service';
import { forkJoin} from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, NavigationEnd, NavigationExtras, NavigationStart, Router } from "@angular/router";
import { CommonService } from '@app/utils/services/common.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
    selector: 'app-product-offers',
    templateUrl: './product-offers.component.html',
    styleUrls: ['./product-offers.component.scss']
})
export class ProductOffersComponent implements OnInit
{
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    allofferData: any = null;
    // @Output() viewPopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    // @Output() emaiComparePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() promoCodePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Input() price = 0;
    @Input() gstPercentage;
    @Input() productmsn;
    disableEMIView = false;
    promoCodes: any;

    constructor(
        private productService: ProductService,
        public localStorageService: LocalStorageService,
        private common: CommonService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void
    {
      let user: any = this.localStorageService.retrieve('user');
      if (user && user.authenticated == "true") {
        if (this.price < 3000) { this.disableEMIView = true; }
        this.getOfferAllData(user.userId);
      }else { this.getOfferAllData(null);}
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

    sendOfferData(offerData)
    {
        // this.viewPopUpHandler.emit(offerData);
        this.productService.productCouponItem=offerData;
        this.router.navigate([this.common.currentUrl], { fragment: CONSTANTS.PDP_POPUP_FRAGMENT.PRODUCT_OFFERS });

    }

    openEmiPopup()
    {
        if (this.disableEMIView) return;
        // this.emaiComparePopUpHandler.emit(true);
        this.router.navigate([this.common.currentUrl], { fragment: CONSTANTS.PDP_POPUP_FRAGMENT.PRODUCT_EMIS });
    }

    seeMoreOffers(){
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
