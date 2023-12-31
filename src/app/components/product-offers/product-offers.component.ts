import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductService } from '../../utils/services/product.service';
import { Subscribable, Subscription, forkJoin} from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { ActivatedRoute, NavigationEnd, NavigationExtras, NavigationStart, Router } from "@angular/router";
import { CommonService } from '@app/utils/services/common.service';
import { DataService } from '@app/utils/services/data.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'app-product-offers',
    templateUrl: './product-offers.component.html',
    styleUrls: ['./product-offers.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductOffersComponent implements OnInit
{
    productStaticData = this.common.defaultLocaleValue;
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    @Input() allofferData: any = [];
    @Output() promoCodePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() viewPopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() emaiComparePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Input() price = 0;
    @Input() gstPercentage;
    @Input() productmsn;
    @Input() brandName;
    @Input() categoryId;
    @Input() categoryName;
    @Input() isHindiMode: boolean = false;;
    disableEMIView = false;
    @Input() promoCodes: any = null;
    @Input() couponForbrandCategory:any=null;
    @Input() pageLinkName;
    @Input() user: any;
    @Input() msn: any;
    minimumRequiredPriceforCoupon: any;
    couponForbrandCategoryDiscount: any;
    isCouponCopied=false;
    copiedCouponSubscription: Subscription 
    changeStaticSubscription: Subscription = null;
    promosChecked = false;
    constructor(
        public localStorageService: LocalStorageService,
        private common: CommonService,
        private cdr: ChangeDetectorRef,
        private _analytics: GlobalAnalyticsService,
        private productService: ProductService
    ) { }

    get isUserLoggedIn() {
      return this.user && this.user['authenticated'] == 'true';
    }

    ngOnInit(): void {
      this.changeStaticSubscription = this.common.changeStaticJson.subscribe(staticJsonData => {
        this.common.defaultLocaleValue = staticJsonData;
        this.productStaticData = staticJsonData;
        this.cdr.detectChanges();
      });
    }

    ngOnDestroy() {
      if(this.changeStaticSubscription) {
        this.changeStaticSubscription.unsubscribe();
      }
    }
  ngAfterViewInit() {
    this.couponOnPDPBrandCategory(this.couponForbrandCategory);
    this.updateCouponsForLoggedInUser();
    if (this.common.isBrowser) {
      this.copiedCouponSubscription = this.common.getCopiedCoupon().subscribe(coupon => {
        if (this.promoCodes.promoCode && (this.promoCodes.promoCode == coupon)) {
          this.isCouponCopied = true
        } else {
          this.isCouponCopied = false
        }
        this.cdr.detectChanges();
      })
    }
  }

  updateCouponsForLoggedInUser() {
    if(this.user && this.user['authenticated'] == 'true') {
      let url = '?msn=' + this.msn + `&userId=${this.user.userId}`;
      this.productService.getAllPromoCodeOffers(url).subscribe((resp) => {
        if(resp && resp['status']) {
          this.promoCodes['totalCoupons'] = resp && resp['data'] && resp['data']['applicablePromoCodeList'].length || 0;
        } else {
          this.promoCodes= null;
        }
        this.promosChecked = true;
        this.cdr.detectChanges();
      })
    }
  }

  couponOnPDPBrandCategory(response) {
    if (response) {
      this.minimumRequiredPriceforCoupon = response['minimumCartValue']
      this.couponForbrandCategoryDiscount = this.couponForbrandCategory['absoluteDiscount'] ? ('₹' + this.couponForbrandCategory['absoluteDiscount']) : (this.couponForbrandCategory['percentageDiscount'] + '%')
    } else {
      this.couponForbrandCategory = null;
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

    copyCouponTextArea(){
      this.isCouponCopied=true
      const copiedCouponText = document.getElementById('couponText');
      this._analytics.sendAdobeCall({ page: { channel: 'pdp', linkPageName: this.pageLinkName, linkName: 'main:coupon:' + copiedCouponText.innerText } }, 'genericClick')
      this.copyToClipboard(copiedCouponText.innerText);
    }

    copyToClipboard(text:any) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.common.updateCopiedCoupon(text);
    }


}
@NgModule({
    declarations: [ProductOffersComponent],
    imports: [
        CommonModule,
        MathCeilPipeModule,
    ],
    exports: [ProductOffersComponent]
})
export class ProductOffersModule
{

}
