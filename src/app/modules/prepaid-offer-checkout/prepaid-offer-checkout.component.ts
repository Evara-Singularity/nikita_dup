import { CommonModule } from '@angular/common';
import { Component, Input,Output,EventEmitter, NgModule, OnInit } from '@angular/core';
import { PopupService } from '@app/utils/services/popup.service';
import { CartService } from '@app/utils/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'prepaid-offer-checkout',
  templateUrl: './prepaid-offer-checkout.component.html',
  styleUrls: ['./prepaid-offer-checkout.component.scss']
})
export class PrepaidOfferCheckoutComponent implements OnInit {

  @Input('displayMode') displayMode: 'LABEL' | 'FLOATING' = 'FLOATING';
  @Input('displayName') displayText: string = 'UPI payment';
  @Input('bankDiscountAmount') bankDiscountAmount: string = null;

  payUOfferPopUpDataSubscription : Subscription;
  payUOfferPopupData : any ={};

  constructor(public _cartService:CartService ,public _popupService: PopupService) { }

  ngOnInit() {
    this.payUOfferPopUpDataSubscription= this._popupService.payUOfferPopUpData$.subscribe(data => {
      this.payUOfferPopupData = data;
    });
  }

  ngOnDestroy() {
    if (this.payUOfferPopUpDataSubscription) {
      this.payUOfferPopUpDataSubscription.unsubscribe();
    }
  }

  showPayUOfferPopUp() {
    this._popupService.showPayUOfferPopUp(true);
  }

}


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PrepaidOfferCheckoutComponent],
  exports: [PrepaidOfferCheckoutComponent]
})
export class PrepaidOfferCheckoutModule {}