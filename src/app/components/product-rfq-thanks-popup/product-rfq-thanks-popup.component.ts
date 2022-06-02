import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'product-rfq-thanks-popup',
  templateUrl: './product-rfq-thanks-popup.component.html',
  styleUrls: ['./product-rfq-thanks-popup.component.scss']
})
export class ProductRfqThanksPopupComponent implements OnInit {

  public isBrowser: boolean = false;
  public isServer: boolean = false;
  @Input() isRFQSuccessfull: boolean;
  @Input() imagePathAsset: string;
  @Input() rfqTotalValue: any;
  @Input() similarProducts: any[] = [];
  @Input() hasGstin: boolean;
  @Input() productOutOfStock: boolean;
  @Input() getWhatsText: string;
  @Output() closeRFQAlert$: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrollToId$: EventEmitter<any> = new EventEmitter<any>();
  @Output() navigateToCategory$: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    private _commonService: CommonService
  ) {
    this.isBrowser = this._commonService.isBrowser
    this.isServer = this._commonService.isServer
  }

  ngOnInit(): void {
  }

  closeRFQAlert() {
    this.closeRFQAlert$.emit();
  }

  openDialer() {
    if (this._commonService.isBrowser) {
      window.location.href = "tel:+91 99996 44044";
    }
  }

  navigateToWhatsapp() {
    if (this.isBrowser) {
      window.location.href = CONSTANTS.WHATS_APP_API + GLOBAL_CONSTANT.whatsapp_number + '&text=' + encodeURIComponent(this.getWhatsText);
    }
  }

  scrollToId(id) {
    this.scrollToId$.emit(id);
  }

  navigateToCategory() {
    this.navigateToCategory$.emit();
  }

}


@NgModule({
  declarations: [
    ProductRfqThanksPopupComponent
  ],
  imports: [
    CommonModule,
    BottomMenuModule
  ],
  exports: [
    ProductRfqThanksPopupComponent
  ]
})
export class ProductRfqThanksPopupModule { }