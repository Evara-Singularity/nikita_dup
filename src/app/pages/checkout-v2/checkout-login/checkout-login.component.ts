import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-login',
  templateUrl: './checkout-login.component.html',
  styleUrls: ['./checkout-login.component.scss']
})
export class CheckoutLoginComponent implements OnInit {

  flow = "login"
  isCheckout = false;
  constructor(
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this.flow = this.removeQueryParams(this._router.url).split("/")[2];
  }

  removeQueryParams(url) {
    return url.split("?")[0];
  }

}
