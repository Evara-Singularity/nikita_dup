import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { LocalAuthService } from "../utils/services/auth.service";
import { CartService } from "../utils/services/cart.service";
import { CommonService } from "../utils/services/common.service";
import * as kfooter from "../config/k.footer";
import { ClientUtility } from "../utils/client.utility";
import { filter, mergeMap } from "rxjs/operators";
import { of } from "rxjs";
import { DataService } from "@app/utils/services/data.service";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { environment } from "environments/environment";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import crypto from "crypto-browserify";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
declare var dataLayer;
import { SpeedTestService } from "ng-speed-test";
import { HostListener } from "@angular/core";
import { Location } from "@angular/common";

@Component({
  selector: "app-pages",
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PagesComponent implements OnInit, AfterViewInit {
  isServer: boolean = false;
  isBrowser: boolean = false;
  iData: { footer?: true; logo?: boolean; title?: string };
  isFooter: boolean = true;
  kfooter: any = kfooter;
  footerVisible = false;
  isHomePage: boolean;
  constructor(
    private _location: Location,
    public _commonService: CommonService,
    private _localAuthService: LocalAuthService,
    private _cartService: CartService,
    private _localStorageService: LocalStorageService,
    private _router: Router,
    public router: Router,
    private _aRoute: ActivatedRoute,
    private dataService: DataService,
    private speedTestService: SpeedTestService,
    private _sessionStorageService: SessionStorageService
  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.isMoglixAppInstalled();

    this.router.events.subscribe((res) => {
      this.createHeaderData(this._aRoute);

      if (res instanceof NavigationEnd) {
        if (res["url"] === "/") {
          this.isHomePage = true;
        } else {
          this.isHomePage = false;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        // TODO: configure it with 500KB image
        this.speedTestService
          .getMbps({
            iterations: 1,
            file: {
              path: CONSTANTS.SPEED_TEST_IMAGE,
              shouldBustCache: true,
              size: 408949,
            },
            retryDelay: 1500,
          })
          .subscribe((speed) => {
            const absoluteSpeed = isNaN(speed) ? "INVALID" : speed.toFixed(0);
            this._sessionStorageService.store(
              "CLIENT_NETWORK_SPEED_SCORE",
              absoluteSpeed
            );
            this._commonService.setNetworkSpeedState(speed);
          });
      }, 0);
    }
  }

  checkAndRedirect() {
    const queryParams = this._aRoute.snapshot.queryParams;
    if (
      GLOBAL_CONSTANT.pageOnWhichBharatPaySupported.includes(
        window.location.pathname
      ) &&
      queryParams.hasOwnProperty("token")
    ) {
      this.loginUserIfUserRedirectedFromBharatpay(queryParams);
    } else if (
      GLOBAL_CONSTANT.pageOnWhichBharatPaySupported.includes(
        window.location.pathname
      )
    ) {
      const user = this._localStorageService.retrieve("user");
      if (!user) {
        this.router.navigateByUrl("/login");
      }
    } else {
      this.setUserSession();
    }
  }

  encryptKey(plain_text, encryptionMethod, secret, iv) {
    const encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    const aes_encrypted =
      encryptor.update(plain_text, "utf8", "base64") +
      encryptor.final("base64");
    return Buffer.from(aes_encrypted).toString("base64");
  }

  loginUserIfUserRedirectedFromBharatpay(queryParams) {
    const token = queryParams["token"];
    // const secret_key = CONSTANTS.SECRET_KEY;
    // const secret_iv = 'smslt';
    // const encryptionMethod = 'AES-256-CBC';
    // const key = crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substr(0, 32);
    // const iv = crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substr(0, 16);
    // const encryptedToken = this.encryptKey(token, encryptionMethod, key, iv);

    const url =
      environment.BASE_URL.replace("v1", "v2") + ENDPOINTS.BHARATPAY_URL;

    this.dataService
      .callRestful("POST", url, {
        body: {
          tokenId: token,
          sessionId: this._localAuthService.getUserSession()
            ? this._localAuthService.getUserSession().sessionId
            : null,
        },
      })
      .subscribe((res) => {
        if (res["status"]) {
          const obj = {
            authenticated: "true",
            cart: JSON.stringify(res["cart"]),
            email: res["userInfo"]["email"],
            emailVerified: null,
            phone: res["userInfo"]["phone"],
            phoneVerified: true,
            sessionId: res["cart"]["sessionId"],
            userId: res["userInfo"]["userId"],
            userName: res["userInfo"]["firstName"],
            userType: null,
            bharatcraft_session: true,
          };

          dataLayer.push({
            event: "bharatpay_user_login",
            id: obj["userId"],
            first_name: obj["userName"],
            last_name: "",
            phone: obj["phone"],
            email: obj["email"],
            user_type: obj["userType"],
          });

          this._localStorageService.store("user", obj);
          this.setUserSession();
          this.handleRedirectionOfPages(queryParams);
        }
      });
  }

  handleRedirectionOfPages(queryParams) {
    if (
      window.location.pathname ===
        GLOBAL_CONSTANT.pageOnWhichBharatPaySupported[0] &&
      queryParams.hasOwnProperty("msn")
    ) {
      this.redirectToProductPage(queryParams["msn"]);
    } else if (
      window.location.pathname ===
      GLOBAL_CONSTANT.pageOnWhichBharatPaySupported[1]
    ) {
      this.router.navigateByUrl(this.router.url);
    } else if (
      window.location.pathname ===
      GLOBAL_CONSTANT.pageOnWhichBharatPaySupported[2]
    ) {
      this.router.navigateByUrl(this.router.url);
    }
  }

  redirectToProductPage(msn) {
    const params = {
      filter: {},
      queryParams: this._aRoute.snapshot.queryParams,
      pageName: "SEARCH",
    };

    const actualParams = this._commonService.formatParams(params);
    actualParams["str"] = msn;
    this.dataService
      .callRestful("GET", environment.BASE_URL + ENDPOINTS.SEARCH, {
        params: actualParams,
      })
      .subscribe((res) => {
        if (
          res.hasOwnProperty("productSearchResult") &&
          res["productSearchResult"]["totalCount"] === 1
        ) {
          this._router.navigateByUrl(
            res["productSearchResult"]["products"][0]["productUrl"]
          );
        }
      });
  }

  ngOnInit() {
    /**
     * Handles cart and user session globally for application on all pages
     * Also, for page refresh
     */

    this.setUserSession();
    if (this.isBrowser) {
      this.checkAndRedirect();
      // this.dataService.startHistory();
      this.setEnvIdentiferCookie();
      this.setConnectionType();
      this.checkWebpSupport();
    }
  }

  isMoglixAppInstalled() {
    if (this.isBrowser) {
      window.addEventListener("load", () => {
        // Check to see if the API is supported.
        if ("getInstalledRelatedApps" in navigator) {
          this.updateAppStatus();
        }
      });
    }
  }

  checkWebpSupport() {
    const elem = document.createElement("canvas");
    if (!!(elem.getContext && elem.getContext("2d"))) {
      // was able or not to get WebP representation
      console.log("was able or not to get WebP representation");
      this._commonService.setWebpSupportState(
        elem.toDataURL("image/webp").indexOf("data:image/webp") == 0
      );
    } else {
      // very old browser like IE 8, canvas not supported
      console.log("very old browser like IE 8, canvas not supported");
      this._commonService.setWebpSupportState(false);
    }
  }

  setConnectionType() {
    let ISCHROME = false;
    if (navigator && navigator["connection"]) {
      const CONNECTION = navigator["connection"];
      if (navigator["connection"]["type"]) {
        const TYPE_COOKIE = this.dataService.getCookie("CONNECTION_TYPE");
        if (!TYPE_COOKIE) {
          this.dataService.setCookie("CONNECTION_TYPE", CONNECTION["type"], 90);
        }
      }
      if (navigator["connection"]["effectiveType"]) {
        const EFFECTIVE_TYPE_COOKIE = this.dataService.getCookie(
          "CONNECTION_EFFECTIVE_TYPE"
        );
        if (!EFFECTIVE_TYPE_COOKIE) {
          this.dataService.setCookie(
            "CONNECTION_EFFECTIVE_TYPE",
            CONNECTION["effectiveType"],
            90
          );
        }
      }
    }
  }

  updateAppStatus() {
    navigator["getInstalledRelatedApps"]().then((relatedApps) => {
      if (relatedApps && relatedApps.length > 0) {
        this._commonService.isAppInstalled = true;
      }
    });
  }

  setUserSession() {
    if (this.isBrowser) {
      this._commonService
        .getSession()
        .pipe(map((res) => res))
        .subscribe((res) => {
          let userSession = this._localAuthService.getUserSession();
          this._localAuthService.setUserSession(res);
          // Below quick order condition is added because getcartbysession is called seperately on quick order page
          if (
            this.router.url.indexOf("/quickorder") == -1 &&
            this.router.url.indexOf("/checkout") == -1
          ) {
            this.updateCartSession();
          }
          this._localAuthService.login$.next();
        });
    }
  }

  updateCartSession() {
    const userSession = this._localAuthService.getUserSession();

    let params = { sessionid: userSession.sessionId };
    this._cartService.getCartBySession(params).subscribe((cartSession) => {
      if (
        cartSession["statusCode"] != undefined &&
        cartSession["statusCode"] == 200
      ) {
        let cs = this._cartService.updateCart(cartSession);
        this._cartService.setCartSession(cs);
        const val =
          cartSession["cart"] != undefined ? cartSession["noOfItems"] : 0;
        this._cartService.cart.next({ count: val });
        this._cartService.orderSummary.next(cartSession);
      } else if (
        /**
         * Below else if is used, because sometime we are getting session id missmatch. so updating session and cart
         */
        cartSession["statusCode"] != undefined &&
        cartSession["statusCode"] == 202
      ) {
        let cs = this._cartService.updateCart(cartSession["cart"]);
        this._cartService.setCartSession(cs);
        const val =
          cartSession["cart"]["cart"] != undefined
            ? cartSession["cart"]["noOfItems"]
            : 0;
        this._cartService.cart.next(val);
        this._cartService.orderSummary.next(cartSession["cart"]);

        this._localAuthService.setUserSession(cartSession["userData"]);
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
        filter((route) => route.outlet === "primary"),
        mergeMap((route) => route.data)
      )
      .subscribe((rData) => {
        this.iData = rData;
      });
  }

  clickFooter() {
    this.footerVisible = !this.footerVisible;
    if (this.footerVisible && document.getElementById("footerContainer")) {
      let footerOffset = document.getElementById("footerContainer").offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset - 50);
    }
  }

  setEnvIdentiferCookie() {
    const abTesting = this.dataService.getCookie("AB_TESTING");
    const PWA = this.dataService.getCookie("PWA");

    if (!PWA) {
      this.dataService.setCookie("PWA", "true", 90);
    }

    if (abTesting) {
      if (abTesting != CONSTANTS.AB_TESTING.STATUS.toString()) {
        this.dataService.deleteCookie("AB_TESTING");
        this.dataService.setCookie(
          "AB_TESTING",
          CONSTANTS.AB_TESTING.STATUS.toString(),
          90
        );
      }
    } else {
      this.dataService.setCookie(
        "AB_TESTING",
        CONSTANTS.AB_TESTING.STATUS.toString(),
        90
      );
    }
  }
}
