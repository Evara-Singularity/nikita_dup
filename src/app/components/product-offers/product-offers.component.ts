import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductService } from '../../utils/services/product.service';
import { forkJoin} from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
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

    constructor(
        private productService: ProductService,
        public localStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void
    {
      let user: any = this.localStorageService.retrieve('user');
      if (user && user.authenticated == "true") {
        if (this.price < 3000) { this.disableEMIView = true; }
        this.getOfferAllData(user.userId);
      }
    }

    getOfferAllData(user){
         forkJoin([
            this.productService.getAllOffers(),
            this.productService.getAllPromoCodeOffers(user, this.productmsn, "web")
          ]).subscribe(
            (responses) => {
                console.log("responses --->>>", responses)
              let data1: any = responses[0] || [];
              let data2: any = responses[1] || [];
              if (data1.statusCode == 200) {
                this.allofferData = (data1.data as any[]).map((item: any, index) => Object.assign({}, item, { index }));
              }
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
