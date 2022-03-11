import { Component, OnInit } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';

@Component({
  selector: 'app-checkout-address',
  templateUrl: './checkout-address.component.html',
  styleUrls: ['./checkout-address.component.css']
})
export class CheckoutAddressComponent implements OnInit {

  constructor(public _cartService: CartService) { }

  ngOnInit(): void {
  }

}
