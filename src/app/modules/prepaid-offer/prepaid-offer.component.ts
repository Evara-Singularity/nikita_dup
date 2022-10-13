import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';

@Component({
  selector: 'prepaid-offer',
  templateUrl: './prepaid-offer.component.html',
  styleUrls: ['./prepaid-offer.component.scss']
})
export class PrepaidOfferComponent implements OnInit {

  constructor(public _cartService: CartService,) { }

  ngOnInit() {
    this.totalPayableAmountCalculation();
    this._cartService.getCartUpdatesChanges().subscribe(cartSession => {
      if (cartSession && cartSession.itemsList && cartSession.itemsList.length > 0) {
        this.totalPayableAmountCalculation();
      }
    });
  }

  totalPayableAmountCalculation() {
    // TODO: OPTIMIZE 
    const cartSession = this._cartService.getCartSession();
    const updatedCartSessionAfterShipping = this._cartService.generateGenericCartSession(cartSession);
    this._cartService.setShippingPriceChanges(updatedCartSessionAfterShipping);
    this._cartService.totalPayableAmountAfterPrepaid = 0;
    this._cartService.totalPayableAmountWithoutPrepaid = 0

    if (this._cartService.getGenericCartSession.cart.totalOffer == 0 || this._cartService.getGenericCartSession.cart.totalOffer == null) {
      this._cartService.totalPayableAmountWithoutPrepaid = (this._cartService.getGenericCartSession.cart.tawot + this._cartService.getGenericCartSession.cart.tpt
        + this._cartService.getGenericCartSession.cart.shippingCharges)
    } else if (this._cartService.getGenericCartSession.cart.totalOffer !== 0 && this._cartService.getGenericCartSession.cart.totalOffer !== null) {
      this._cartService.totalPayableAmountWithoutPrepaid = (this._cartService.getGenericCartSession.cart.tawot + this._cartService.getGenericCartSession.cart.tpt
        + this._cartService.getGenericCartSession.cart.shippingCharges -
        this._cartService.getGenericCartSession.cart.totalOffer)
    }

    if (this._cartService.totalPrepaidSaving == 0) {
      if (this._cartService.getGenericCartSession.cart.totalOffer == 0 || this._cartService.getGenericCartSession.cart.totalOffer == null) {
        this._cartService.totalPayableAmountAfterPrepaid = (this._cartService.getGenericCartSession.cart.tawot + this._cartService.getGenericCartSession.cart.tpt
          + this._cartService.getGenericCartSession.cart.shippingCharges)
      } else if (this._cartService.getGenericCartSession.cart.totalOffer !== 0 && this._cartService.getGenericCartSession.cart.totalOffer !== null) {
        this._cartService.totalPayableAmountAfterPrepaid = (this._cartService.getGenericCartSession.cart.tawot + this._cartService.getGenericCartSession.cart.tpt
          + this._cartService.getGenericCartSession.cart.shippingCharges -
          this._cartService.getGenericCartSession.cart.totalOffer)
      }
    } else if (this._cartService.totalPrepaidSaving > 0) {
      if (this._cartService.getGenericCartSession.cart.totalOffer == 0 || this._cartService.getGenericCartSession.cart.totalOffer == null) {
        this._cartService.totalPayableAmountAfterPrepaid = (this._cartService.getGenericCartSession.cart.tawot + this._cartService.getGenericCartSession.cart.tpt
          + this._cartService.getGenericCartSession.cart.shippingCharges - this._cartService.totalPrepaidSaving)
      } else if (this._cartService.getGenericCartSession.cart.totalOffer !== 0 && this._cartService.getGenericCartSession.cart.totalOffer !== null) {
        this._cartService.totalPayableAmountAfterPrepaid = (this._cartService.getGenericCartSession.cart.tawot + this._cartService.getGenericCartSession.cart.tpt
          + this._cartService.getGenericCartSession.cart.shippingCharges -
          this._cartService.getGenericCartSession.cart.totalOffer - this._cartService.totalPrepaidSaving)
      }
    }
  }

}


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PrepaidOfferComponent],
  exports: [PrepaidOfferComponent]
})
export class PrepaidOfferModule { }

