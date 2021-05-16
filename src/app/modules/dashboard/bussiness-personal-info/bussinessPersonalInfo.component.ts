import { LocalStorageService } from "ngx-webstorage";
import { DashboardService } from "../dashboard.service";
import { map } from "rxjs/operators/map";
import { delay } from "rxjs/operators/delay";
import { mergeMap } from "rxjs/operators/mergeMap";
import { Location, isPlatformServer, isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { Component, PLATFORM_ID, Inject } from "@angular/core";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalState } from "@app/utils/global.state";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";

@Component({
  selector: "bussiness-info",
  templateUrl: "bussinessPersonalInfo.component.html",
  styleUrls: ["bussinessPersonalInfo.component.scss"],
})
export class BussinessInfoComponent {
  error: boolean = true;
  errorMsg: string = "";
  userInfo;
  isBrowser: boolean;
  user: any;
  isServer: boolean;
  isHomePage: boolean;
  public isMenuCollapsed: boolean = false;
  currentRoute: string;
  set showLoader(value){
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private _state: GlobalState,
    @Inject(PLATFORM_ID) platformId,
    private _router: Router,
    private _location: Location,
    private _localStorageService: LocalStorageService,
    private _commonService: CommonService,
    private _cartService: CartService,
    private _localAuthService: LocalAuthService,
    public localStorageService: LocalStorageService,
    private _dashboardService: DashboardService,
    private loaderService:GlobalLoaderService) {
    
    this.showLoader=false;
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this._state.subscribe("menu.isCollapsed", (isCollapsed) => { this.isMenuCollapsed = isCollapsed; });

    if (this._router.url == "/") {
      this.isHomePage = true;
      this.currentRoute = "home";
    } else {
      this.isHomePage = false;
      this.currentRoute = "other";
    }

    if (this.isBrowser) this.user = this._localAuthService.getUserSession();

    this._localAuthService.login$.subscribe((data) => {
      this.user = this._localAuthService.getUserSession();
    });

    /*Subscribe below event when user log out*/
    this._localAuthService.logout$.subscribe((data) => {
      this.user = this._localAuthService.getUserSession();
    });
  }

  ngOnInit() {
    let obj = {};
    obj["userId"] = this.localStorageService.retrieve("user").userId;

    this._dashboardService.getPersonalInfo(obj).subscribe((res) => {
      this.userInfo = res;
      this.showLoader = false;
    });
  }

  logout() {
    this._commonService.logout().subscribe((response) => {
      this._localStorageService.clear("user");
      console.log(this._localStorageService.retrieve("user"));
      this._cartService.cart.next(0);
      if (this.isBrowser) {
      }
      this._commonService
        .getSession()
        .pipe(
          map((res: any) => {
            this._localAuthService.setUserSession(res);
            this.user = this._localAuthService.getUserSession();
            return res;
          }),
          delay(100),
          mergeMap((data) => {
            let params = { sessionid: data["sessionId"] };
            return this._cartService.getCartBySession(params).pipe(
              map((res: any) => {
                return res;
              })
            );
          })
        )
        .subscribe((response: any) => {
          let cartSession = response;
          const cs = this._cartService.updateCart(cartSession);
          this._cartService.setCartSession(cs);
          this._cartService.cart.next(
            cartSession["cart"] != undefined ? cartSession["noOfItems"] : 0
          );
          this._cartService.orderSummary.next(cartSession);
        });
      this._localAuthService.logout$.emit();
      if (!this.isServer) {
        setTimeout(() => {
          this._location.replaceState("/"); // clears browser history so they can't navigate with back button
          this._router.navigateByUrl("/");
        }, 1000);
      }
    });
  }

  onSubmit(data) {
    let userSession = this._localAuthService.getUserSession();
    this.showLoader = true;
    let user = this.localStorageService.retrieve("user");
    let obj = {
      userid: user.userId,
      pname: data.fname,
      lname: data.lname,
    };

    this._dashboardService.updatePersonalInfo(obj).subscribe((res) => {
      this.showLoader = false;
      if (res["status"]) {
        this.error = false;
        this.errorMsg = res["statusDescription"];
        if (this.localStorageService.retrieve("user")) {
          let user = this.localStorageService.retrieve("user");
          if (user.authenticated == "true") {
            userSession.userName = data.fname + " " + data.lname;
            this._localAuthService.setUserSession(userSession);
            this._localAuthService.login$.next();
          }
        }
      } else {
        this.error = true;
        this.errorMsg = "Something went wrong";
      }
    });
  }

  toPasswordPage() {
    this._router.navigate(["dashboard/password"]);
  }
}