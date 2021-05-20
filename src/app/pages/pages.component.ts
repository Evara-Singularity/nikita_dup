import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { LocalAuthService } from '../utils/services/auth.service';
import { CartService } from '../utils/services/cart.service';
import { CommonService } from '../utils/services/common.service';
import * as kfooter from '../config/k.footer';
import { ClientUtility } from '../utils/client.utility';
import { filter, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PagesComponent implements OnInit {

  isServer: boolean = false;
  isBrowser: boolean = false;
  iData: { footer?: true, logo?: boolean, title?: string };
  isFooter: boolean = true;
  kfooter: any = kfooter;
  footerVisible = false;
  constructor(
    public _commonService: CommonService,
    private _localAuthService: LocalAuthService,
    private _cartService: CartService,
    @Inject(PLATFORM_ID) platformId,
    public router: Router,
    private _aRoute: ActivatedRoute,
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.router.events.subscribe(res => {
      this.createHeaderData(this._aRoute);
    })
  }

  ngOnInit() {
    /**
     * Handles cart and user session globally for application on all pages
     * Also, for page refresh
     */
    this.setUserSession();
  }

  setUserSession() {
    if (this.isBrowser) {
      this._commonService.getSession()
        .pipe(
          map((res) => res)
        )
        .subscribe((res) => {
          let userSession = this._localAuthService.getUserSession();
          this._localAuthService.setUserSession(res);
          // Below quick order condition is added because getcartbysession is called seperately on quick order page
          if (this.router.url != "/quickorder" && this.router.url != "/checkout") {
            this.updateCartSession();
          }
          this._localAuthService.login$.next();
        });
    }
  }


  updateCartSession() {
    const userSession = this._localAuthService.getUserSession();
    let params = { "sessionid": userSession.sessionId };
    this._cartService.getCartBySession(params).subscribe((cartSession) => {
      if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 200) {
        let cs = this._cartService.updateCart(cartSession);
        this._cartService.setCartSession(cs);
        this._cartService.cart.next(cartSession["cart"] != undefined ? cartSession['noOfItems'] : 0);
        this._cartService.orderSummary.next(cartSession);
      }
      /**
       * Below else if is used, because sometime we are getting session id missmatch. so updating session and cart
       */
      else if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 202) {
        let cs = this._cartService.updateCart(cartSession['cart']);
        this._cartService.setCartSession(cs);
        this._cartService.cart.next(cartSession["cart"]["cart"] != undefined ? cartSession['cart']['noOfItems'] : 0);
        this._cartService.orderSummary.next(cartSession['cart']);

        this._localAuthService.setUserSession(cartSession['userData']);
        this._localAuthService.logout$.emit();
      }
    });
  }

  createHeaderData(_aRoute) {
    of(_aRoute)
      .pipe(
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      )
      .subscribe((rData) => {
        this.iData = rData;
      });
  }

  clickFooter() {
    this.footerVisible = !this.footerVisible;
    if (this.footerVisible) {
      let footerOffset = document.getElementById('footerContainer').offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset - 50);
    }
  }

}
