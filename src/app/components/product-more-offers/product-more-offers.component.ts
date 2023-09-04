import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { ModalModule } from '../../modules/modal/modal.module';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { CommonService } from '../../utils/services/common.service';
import { Subscription } from 'rxjs';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
  selector: 'app-product-more-offers',
  templateUrl: './product-more-offers.component.html',
  styleUrls: ['./product-more-offers.component.scss']
})
export class ProductMoreOffersComponent implements OnInit, AfterViewInit {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input() data: any ;
  @Output() out: EventEmitter<any> = new EventEmitter<any>();
  @Output() isLoading : EventEmitter<any> = new EventEmitter<any>();
  @Input() pageLinkName;
  promoCodeOffers: any;
  activeIndex: any;
  copiedCouponSubscription: Subscription; 
  changeStaticSubscription: Subscription = null;
  constructor(private _commonService:CommonService, private _analytics: GlobalAnalyticsService) { }

  ngOnInit(): void {
    const promos = [...this.data];
    this.promoCodeOffers= promos.splice(1);
    this.isLoading.emit(false);
  }

  ngAfterViewInit(): void {
    if (this._commonService.isBrowser) {
    }
  }

  getStaticSubjectData(){
    this.changeStaticSubscription = this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }

  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
  }

  outData(data) {
    this.out.emit(data);
  }
  
  copyCouponTextArea(text,activeIndex){
    this.activeIndex=activeIndex
    this.copyToClipboard(text);
  }

  copyToClipboard(text:any) {
    this._analytics.sendAdobeCall({page: { channel: 'pdp', linkPageName: this.pageLinkName, linkName: 'popup:coupon:' + text }}, "genericClick")
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this._commonService.updateCopiedCoupon(text);
  }
}


@NgModule({
  declarations: [ProductMoreOffersComponent],
  imports: [
    CommonModule,
    PopUpModule,
    ModalModule,
    BottomMenuModule
  ]
})
export default class ProductMoreOffersModule {

}