import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { delay, map } from 'rxjs/operators';
import { LocalAuthService } from '../utils/services/auth.service';
import { CartService } from '../utils/services/cart.service';
import { CommonService } from '../utils/services/common.service';
import * as kfooter from '../config/k.footer';
import { ClientUtility } from '../utils/client.utility';
import { filter, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DataService } from '@app/utils/services/data.service';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { SharedAuthService } from '@app/modules/shared-auth/shared-auth.service';
import { LocalStorageService } from 'ngx-webstorage';
import * as crypto from 'crypto-browserify';

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
  isHomePage: boolean;
  constructor(
    public _commonService: CommonService,
    private _localAuthService: LocalAuthService,
    private _cartService: CartService,
    private _localStorageService: LocalStorageService,
    private _router: Router,
    @Inject(PLATFORM_ID) platformId,
    public router: Router,
    private _aRoute: ActivatedRoute,
    private dataService: DataService
  ) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.isMoglixAppInstalled();

    this.router.events.subscribe(res => {
      this.createHeaderData(this._aRoute);

      if (res instanceof NavigationEnd) {
        if (res['url'] === '/') {
          this.isHomePage = true;
        } else {
          this.isHomePage = false;
        }
      }
    })
  }

  checkAndRedirect() {
    const queryParams = this._aRoute.snapshot.queryParams;
    if (queryParams.hasOwnProperty('token')) {
      this.loginUserIfUserRedirectedFromBharatpay(queryParams);
    } else {
      this.setUserSession();
    }
  }

  encryptKey(plain_text, encryptionMethod, secret, iv) {
    const encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    const aes_encrypted = encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');
    return Buffer.from(aes_encrypted).toString('base64');
  };

  loginUserIfUserRedirectedFromBharatpay(queryParams) {
    const token = queryParams['token'];
    const secret_key = CONSTANTS.SECRET_KEY;
    const secret_iv = 'smslt';
    const encryptionMethod = 'AES-256-CBC';
    const key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substr(0, 32);
    const iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substr(0, 16);
    const encryptedToken = this.encryptKey(token, encryptionMethod, key, iv);
    
    console.log(encryptedToken);
    const url = (environment.BASE_URL.replace('v1', 'v2')) + ENDPOINTS.BHARATPAY_URL;

    this.dataService.callRestful("POST", url, { body: { tokenId: encryptedToken, sessionId: (this._localAuthService.getUserSession() ? this._localAuthService.getUserSession().sessionId : null) } }).subscribe(res => {
      if (res['status']) {
        const obj = {
          authenticated: "true",
          cart: JSON.stringify(res['cart']),
          email: res['userInfo']['email'],
          emailVerified: null,
          phone: res['userInfo']['phone'],
          phoneVerified: true,
          sessionId: res['cart']['sessionId'],
          token: encryptedToken,
          userId: res['userInfo']['userId'],
          userName: res['userInfo']['firstName'],
          userType: null
        }
        this._localStorageService.store('user', obj);
        this.setUserSession();
        if (queryParams.hasOwnProperty('msn')) {
          this.redirectToProductPage(queryParams['msn']);
        }
      }
    });
  }

  redirectToProductPage(msn) {
    const params = {
      filter: {},
      queryParams: this._aRoute.snapshot.queryParams,
      pageName: "SEARCH"
    };

    const actualParams = this._commonService.formatParams(params);
    actualParams['str'] = msn;
    this.dataService.callRestful('GET', environment.BASE_URL + ENDPOINTS.SEARCH, { params: actualParams }).subscribe(res => {
      if (res.hasOwnProperty('productSearchResult') && res['productSearchResult']['totalCount'] === 1) {
        this._router.navigateByUrl(res['productSearchResult']['products'][0]['productUrl'])
      }
    })

  }

  ngOnInit() {
    /**
     * Handles cart and user session globally for application on all pages
     * Also, for page refresh
     */

    this.checkAndRedirect();

    if (this.isBrowser) {
      // this.dataService.startHistory();
      this.setEnvIdentiferCookie()
    }
  }

  isMoglixAppInstalled() {
    if (this.isBrowser) {
      window.addEventListener('load', () => {
        // Check to see if the API is supported.
        if ('getInstalledRelatedApps' in navigator) {
          this.updateAppStatus()
        }
      });
    }
  }

  updateAppStatus() {
    navigator['getInstalledRelatedApps']().then((relatedApps) => {
      if (relatedApps && relatedApps.length > 0) {
        this._commonService.isAppInstalled = true;
      }
    });
  }

  setUserSession() {
    if (this.isBrowser) {
      this._commonService.getSession()
        .pipe(
          map((res) => res)
        )
        .subscribe((res) => {
          this._localAuthService.setUserSession(res);
          // Below quick order condition is added because getcartbysession is called seperately on quick order page
          if ((this.router.url.indexOf('/quickorder') == -1) && (this.router.url.indexOf('/checkout') == -1)) {
            this.updateCartSession();
          }
          this._localAuthService.login$.next();
        });
    }
  }


  updateCartSession() {
    const userSession = this._localAuthService.getUserSession();
    console.log(userSession);

    let params = { "sessionid": userSession.sessionId };
    this._cartService.getCartBySession(params).subscribe((cartSession) => {
      if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 200) {
        let cs = this._cartService.updateCart(cartSession);
        this._cartService.setCartSession(cs);
        const val = cartSession["cart"] != undefined ? cartSession['noOfItems'] : 0;
        this._cartService.cart.next({ count: val });
        this._cartService.orderSummary.next(cartSession);
      }
      /**
       * Below else if is used, because sometime we are getting session id missmatch. so updating session and cart
       */
      else if (cartSession['statusCode'] != undefined && cartSession['statusCode'] == 202) {
        let cs = this._cartService.updateCart(cartSession['cart']);
        this._cartService.setCartSession(cs);
        const val = cartSession["cart"]["cart"] != undefined ? cartSession['cart']['noOfItems'] : 0;
        this._cartService.cart.next(val);
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
      })
  }

  clickFooter() {
    this.footerVisible = !this.footerVisible;
    if (this.footerVisible && document.getElementById('footerContainer')) {
      let footerOffset = document.getElementById('footerContainer').offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset - 50);
    }
  }

  setEnvIdentiferCookie() {
    const abTesting = this.dataService.getCookie('AB_TESTING');
    const PWA = this.dataService.getCookie('PWA');

    if (!PWA) {
      this.dataService.setCookie('PWA', 'true', 90);
    }

    if (abTesting) {
      if (abTesting != CONSTANTS.AB_TESTING.STATUS.toString()) {
        this.dataService.deleteCookie('AB_TESTING');
        this.dataService.setCookie('AB_TESTING', CONSTANTS.AB_TESTING.STATUS.toString(), 90);
      }
    } else {
      this.dataService.setCookie('AB_TESTING', CONSTANTS.AB_TESTING.STATUS.toString(), 90);
    }
  }

}
