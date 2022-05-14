import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit {

  readonly STEPPER: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: true }];

  constructor(
    private _cartService: CartService,
    private router: Router,
    private loader: GlobalLoaderService,
  ) { }

  ngOnInit(): void {
    this.checkForValidRedirection();
  }

  checkForValidRedirection() {
    if (
      (this._cartService.getGenericCartSession && Object.keys(this._cartService.getGenericCartSession?.cart).length == 0) ||
      !((this._cartService.invoiceType == 'retail' && this._cartService.shippingAddress) ||
        (this._cartService.invoiceType == 'tax' && this._cartService.shippingAddress && this._cartService.billingAddress))
    ) {
      this.loader.setLoaderState(true);
      this._cartService.checkForUserAndCartSessionAndNotify().subscribe(res=>{
        this.loader.setLoaderState(false);
        this.router.navigateByUrl('/checkout/address', { replaceUrl: true }); 
      }); 
    }else{
      console.log('redirecting to payment ==>', this._cartService.getGenericCartSession);
    }
    // console.log('payment logs', this._cartService.invoiceType, this._cartService.shippingAddress, this._cartService.billingAddress)
  }

}
