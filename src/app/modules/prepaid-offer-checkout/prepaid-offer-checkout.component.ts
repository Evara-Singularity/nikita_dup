import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';

@Component({
  selector: 'prepaid-offer-checkout',
  templateUrl: './prepaid-offer-checkout.component.html',
  styleUrls: ['./prepaid-offer-checkout.component.scss']
})
export class PrepaidOfferCheckoutComponent implements OnInit {

  constructor(public _cartService: CartService) { }

  ngOnInit() {
  }

}


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PrepaidOfferCheckoutComponent],
  exports: [PrepaidOfferCheckoutComponent]
})
export class PrepaidOfferCheckoutModule { }
