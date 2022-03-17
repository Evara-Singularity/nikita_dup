import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '@app/utils/services/cart.service';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit {

  constructor(
    private _cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkForValidRedirection();
  }

  checkForValidRedirection() {
    if (
      (this._cartService.invoiceType == 'retail' && this._cartService.shippingAddress) ||
      (this._cartService.invoiceType == 'tax' && this._cartService.shippingAddress && this._cartService.billingAddress)
    ) {
      console.log('payment logs', this._cartService.invoiceType, this._cartService.shippingAddress, this._cartService.billingAddress)
    } else {
      this.router.navigate(['/checkout/address']);
    }
  }

}
