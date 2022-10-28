import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { MathCeilPipeModule } from './../../utils/pipes/math-ceil';

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
    MathCeilPipeModule
  ],
  declarations: [PrepaidOfferComponent],
  exports: [PrepaidOfferComponent]
})
export class PrepaidOfferModule { }

