import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Inject,
  Injector,
  OnInit,
  Optional,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { LocalAuthService } from "../utils/services/auth.service";
import { CartService } from "../utils/services/cart.service";
import { CommonService } from "../utils/services/common.service";
import { DataService } from "@app/utils/services/data.service";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { environment } from "environments/environment";
import { LocalStorageService } from "ngx-webstorage";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { makeStateKey, TransferState } from "@angular/platform-browser";
declare var dataLayer;

@Component({
  selector: "app-pages",
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class PagesComponent implements OnInit, AfterViewInit {

  readonly REQUEST_CLIENT_IP = makeStateKey<object>('request-client-ip');

  isServer: boolean = false;
  isBrowser: boolean = false;
  iData: {
    footer?: true;
    logo?: boolean;
    title?: string;
    hideHeader?: boolean;
  };
  isFooter: boolean = true;
  isHomePage: boolean;
  isRoutedBack: boolean = false;

  //var for goldMembership
  goldMembershipInstance = null;
	@ViewChild('GoldMembershipComponent', { read: ViewContainerRef })
	goldMembershipContainerRef: ViewContainerRef;

  constructor(
    public _commonService: CommonService,
    private _localAuthService: LocalAuthService,
    private _cartService: CartService,
    private _localStorageService: LocalStorageService,
    private _router: Router,
    public router: Router,
    private _aRoute: ActivatedRoute,
    private dataService: DataService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private transferState: TransferState,
    @Optional() @Inject(CONSTANTS.SERVER_CLIENT_IP) private requestServerIp: string,
  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.isMoglixAppInstalled();

    this.router.events.subscribe((res) =>
    {
      this.createHeaderData(this._aRoute);

      if (res instanceof NavigationEnd) {
        this.enableBodyScoll();
        if (res['url'] === '/' || res['url'] == "/?back=1") {
          this.isHomePage = true;
        } else {
          this.isHomePage = false;
        }
        this.isRoutedBack = (res['url'] == "/?back=1") ? true : false;
      }
    });
    this.getRequestIpServer();
  }

  ngAfterViewInit(): void {
    this.initialize();
    if(this._commonService.isBrowser){
      this.intiaizeV2();
    }
    this._commonService.getGoldMembershipPopup().subscribe(res => {
      this.showGoldMembershipPopUp();
    })
  }

  ngOnInit()
  {
  }

  checkForSession() {
    // console.log('requestServerIp', this.requestServerIp);
    const queryParams = this._aRoute.snapshot.queryParams;
    const orderId = queryParams['orderId'];
    if (orderId) return;
  }

  intiaizeV2(){
    // separately checking for back param, because on angular router navigation this param is not getting updated
    if (this.isBrowser) {
      this.isRoutedBack = window.location.toString().includes('back=1');
      this.checkAndRedirect();
    }
  }

  getRequestIpServer() {
    if (this._commonService.isBrowser) {
      if (this.transferState.hasKey(this.REQUEST_CLIENT_IP)) {
        const ipObj = this.transferState.get<object>(this.REQUEST_CLIENT_IP, null);
        // console.log('getRequestIpServer browser', ipObj);
        this.dataService.clientIpFromServer = ipObj['ipAddress'];
      }
    } else {
      // console.log('getRequestIpServer server', this.requestServerIp);
      this.dataService.clientIpFromServer = this.requestServerIp;
      this.transferState.set(this.REQUEST_CLIENT_IP, { ipAddress: this.requestServerIp });
    }
  }

  initialize()
  {
    /**
     * Handles cart and user session globally for application on all pages
     * Also, for page refresh
     */
    if (this.isBrowser) {
      // this.dataService.startHistory();
      this.setEnvIdentiferCookie();
      this.setConnectionType();
      this.checkWebpSupport();
      this.checkForSession();
    }
  }

  enableBodyScoll()
  {
    // incase body scroll is disabled then enable it on page refresh
    // console.log('page. enableBodyScoll ', this._commonService.bodyScrollStatus);
    setTimeout(() =>
    {
      this._commonService.setBodyScroll(null, true);
    }, 200);
  }

  checkAndRedirect()
  {
    const queryParams = this._aRoute.snapshot.queryParams;
    if (GLOBAL_CONSTANT.pageOnWhichBharatPaySupported.includes(window.location.pathname) && queryParams.hasOwnProperty("token")) {
      this.loginUserIfUserRedirectedFromBharatpay(queryParams);
      return;
    }
    this.checkForUserAndCartSession();
  }

  loginUserIfUserRedirectedFromBharatpay(queryParams)
  {
    const token = queryParams["token"];

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
      .subscribe((res) =>
      {
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
          this.handleRedirectionOfPages(queryParams);
          this.checkForUserAndCartSession();
        }
      });
  }

  handleRedirectionOfPages(queryParams)
  {
    if (
      window.location.pathname ===
      GLOBAL_CONSTANT.pageOnWhichBharatPaySupported[0] &&
      queryParams.hasOwnProperty("msn")
    ) {
      this.redirectToProductPage(queryParams["msn"]);
    } else {
      this._commonService.bharatcraftUserSessionArrived.next(true);
    }
  }

  redirectToProductPage(msn)
  {
    const params = {
      filter: {},
      queryParams: this._aRoute.snapshot.queryParams,
      pageName: "SEARCH",
    };
    const actualParams = this._commonService.formatParams(params);
    actualParams["str"] = msn;
    this.dataService
      .callRestful("GET", environment.BASE_URL + ENDPOINTS.SEARCH_V1, {
        params: actualParams,
      })
      .subscribe((res) =>
      {
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

  

  isMoglixAppInstalled()
  {
    if (this.isBrowser) {
      window.addEventListener("load", () =>
      {
        // Check to see if the API is supported.
        if ("getInstalledRelatedApps" in navigator) {
          this.updateAppStatus();
        }
      });
    }
  }

  checkWebpSupport()
  {
    const elem = document.createElement("canvas");
    if (!!(elem.getContext && elem.getContext("2d"))) {
      // was able or not to get WebP representation
      // console.log("was able or not to get WebP representation");
      this._commonService.setWebpSupportState(
        elem.toDataURL("image/webp").indexOf("data:image/webp") == 0
      );
    } else {
      // very old browser like IE 8, canvas not supported
      console.log("very old browser like IE 8, canvas not supported");
      this._commonService.setWebpSupportState(false);
    }
  }

  setConnectionType()
  {
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

  updateAppStatus()
  {
    navigator["getInstalledRelatedApps"]().then((relatedApps) =>
    {
      if (relatedApps && relatedApps.length > 0) {
        this._commonService.isAppInstalled = true;
      }
    });
  }

  checkForUserAndCartSession()
  {
    this._cartService.refreshCartSesion();
  }

  createHeaderData(_aRoute)
  {
    this._commonService.getRoutingData(_aRoute).subscribe((rData) =>
    {
      this.iData = rData;
    });
  }

  setEnvIdentiferCookie()
  {
    const abTesting = this.dataService.getCookie("AB_TESTING");
    const PWA = this.dataService.getCookie("PWA");
    const buildVersion = this.dataService.getCookie("BUILD_VERSION") || null;
    const updatedBuildaVersion = environment.buildVersion.toString();

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

    if (!buildVersion) {
      this.dataService.setCookie("BUILD_VERSION", updatedBuildaVersion, 90);
    } else {
      if (buildVersion != updatedBuildaVersion) {
        this.dataService.deleteCookieV2("BUILD_VERSION");
        setTimeout(() =>
        {
          this.dataService.setCookie("BUILD_VERSION", updatedBuildaVersion, 90);
        }, 100);
      }
    }
  }

  async showGoldMembershipPopUp() {
    const { GoldMembershipComponent } = await import('../modules/goldMembership/goldMembership.component');
    const factory = this.cfr.resolveComponentFactory(GoldMembershipComponent);
    this.goldMembershipInstance = this.goldMembershipContainerRef.createComponent(
      factory,
      null,
      this.injector
    );
    (
      this.goldMembershipInstance.instance['closePopup'] as EventEmitter<boolean>
    ).subscribe(data => {
      this.goldMembershipContainerRef.remove();
      this._commonService.setBodyScroll(null, true);
    });
    (
      this.goldMembershipInstance.instance['closePopupOnOutsideClick'] as EventEmitter<{}>
    ).subscribe(data => {
      this.goldMembershipContainerRef.remove();
      this._commonService.setBodyScroll(null, true);
    });
  }
 
  get isCheckout()
  {
    return this.router.url.includes("checkout");
  }
}
