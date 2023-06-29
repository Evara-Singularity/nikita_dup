import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
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
  @Output() closeproductDiscInfoComponent$: EventEmitter<boolean> = new EventEmitter<boolean>();
  isCouponCopied=false;
  copiedCouponSubscription: Subscription; 
  copiedCoupon: string = '';

  constructor(
    public _cartService: CartService,
    public _commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getStaticSubjectData();
  }
  
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  ngAfterViewInit(): void {
    if(this._commonService.copiedCoupon){
      this.copiedCoupon = this._commonService.copiedCoupon;
    }
    if (this._commonService.isBrowser) {
      this.copiedCouponSubscription = this._commonService.getCopiedCoupon().subscribe(coupon => {
        if (this.promoCodes.promoCode && (this.promoCodes.promoCode ==  this.copiedCoupon)) {
          this.isCouponCopied = true
        } else {
          this.isCouponCopied = false
        }
      })
    }
  }


  copyCouponTextArea(){
    this.isCouponCopied=true
  const copiedCouponText = document.getElementById('coupon-text');
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
  
}
