import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit, OnDestroy {

  readonly STEPPER: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: true }];
  private routerSubscriber: any;

  constructor(
    private _cartService: CartService,
    private router: Router,
    private loader: GlobalLoaderService,
  ) { }

  ngOnInit(): void {
    this.checkForValidRedirection();
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.routerSubscriber = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
      }
    });

  }

  checkForValidRedirection() {
    if (
      (this._cartService.getGenericCartSession && Object.keys(this._cartService.getGenericCartSession?.cart).length == 0) ||
      !((this._cartService.invoiceType == 'retail' && this._cartService.shippingAddress) ||
        (this._cartService.invoiceType == 'tax' && this._cartService.shippingAddress && this._cartService.billingAddress))
    ) {
      this.loader.setLoaderState(true);
      this._cartService.checkForUserAndCartSessionAndNotify().subscribe(res => {
        this.loader.setLoaderState(false);
        this.router.navigateByUrl('/checkout/address', { replaceUrl: true });
      }, error => {
        this.loader.setLoaderState(false);
        this.router.navigateByUrl('/', { replaceUrl: true });
      });
    } else {
      console.log('redirecting to payment ==>', this._cartService.getGenericCartSession);
    }
    // console.log('payment logs', this._cartService.invoiceType, this._cartService.shippingAddress, this._cartService.billingAddress)
  }

  ngOnDestroy(): void {
    if (this.routerSubscriber) {
      this.routerSubscriber.unsubscribe();
    }
  }

}
