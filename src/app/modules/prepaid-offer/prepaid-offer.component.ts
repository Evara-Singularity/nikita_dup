import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { MathRoundPipeModule } from '@app/utils/pipes/math-round';
import { CartService } from '@app/utils/services/cart.service';

@Component({
  selector: 'prepaid-offer',
  templateUrl: './prepaid-offer.component.html',
  styleUrls: ['./prepaid-offer.component.scss']
})
export class PrepaidOfferComponent implements OnInit {

  constructor(public _cartService: CartService,) { }

  ngOnInit() {
  }

}


@NgModule({
  imports: [
    CommonModule,
    MathRoundPipeModule
  ],
  declarations: [PrepaidOfferComponent],
  exports: [PrepaidOfferComponent]
})
export class PrepaidOfferModule { }

