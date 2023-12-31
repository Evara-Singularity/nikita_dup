import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-floating-coupon-widget',
  templateUrl: './floating-coupon-widget.component.html',
  styleUrls: ['./floating-coupon-widget.component.scss']
})
export class FloatingCouponWidgetComponent implements OnInit, AfterViewInit {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input() isBulkPricesProduct
  @Input() selectedProductBulkPrice
  @Input() productMrp;
  @Input() productPrice = 0;
  @Input() gstPercentage;
  @Input() productmsn;
  @Input() promoCodes;
  @Input() productName
  @Input() priceWithoutTax
  @Input() productDiscount
  @Input() pageLinkName;
  @Output() closeproductDiscInfoComponent$: EventEmitter<boolean> = new EventEmitter<boolean>();
  isCouponCopied=false;
  copiedCouponSubscription: Subscription; 
  copiedCoupon: string = '';
  changeStaticSubscription: Subscription = null;
  constructor(
    public _cartService: CartService,
    public _commonService: CommonService,
    private _analytics: GlobalAnalyticsService
  ) { }

  ngOnInit(): void {
    this.getStaticSubjectData();
  }
  
  getStaticSubjectData(){
    this.changeStaticSubscription = this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  ngAfterViewInit(): void {
    if(this._commonService.copiedCoupon){
      this.copiedCoupon = this._commonService.copiedCoupon;
    }
    if (this._commonService.isBrowser) {
      this.copiedCouponSubscription = this._commonService.getCopiedCoupon().subscribe(coupon => {
        if (this.promoCodes.promoCode && (this.promoCodes.promoCode ==  coupon)) {
          this.isCouponCopied = true
        } else {
          this.isCouponCopied = false
        }
      })
    }
  }

  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
  }


  copyCouponTextArea() {
    this.isCouponCopied = true
    const copiedCouponText = document.getElementById('coupon-text');
    this._analytics.sendAdobeCall({page: { channel: 'pdp', linkPageName: this.pageLinkName, linkName: 'floating:coupon:' + this.copiedCoupon }}, "genericClick")
    this.copyToClipboard(copiedCouponText.innerText);
  }

  copyToClipboard(text:any) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this._commonService.updateCopiedCoupon(text);
  }

  setAdobeDataTracking() {
    this._analytics.sendAdobeCall({page: {channel: 'pdp',linkPageName: this.pageLinkName,linkName: 'Price Overlay Closed'}},"genericClick");
    this.closeproductDiscInfoComponent$.emit(false);
  }
  
}
