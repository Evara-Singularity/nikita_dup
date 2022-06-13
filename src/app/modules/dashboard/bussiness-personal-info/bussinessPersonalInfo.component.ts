import { LocalStorageService } from "ngx-webstorage";
import { DashboardService } from "../dashboard.service";
import { map } from "rxjs/operators";
import { delay } from "rxjs/operators";
import { mergeMap } from "rxjs/operators";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { Component } from "@angular/core";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalState } from "@app/utils/global.state";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "bussiness-info",
  templateUrl: "bussinessPersonalInfo.component.html",
  styleUrls: ["bussinessPersonalInfo.component.scss"],
})
export class BussinessInfoComponent {
  error: boolean = true;
  errorMsg: string = "";
  userInfo:any;
  isBrowser: boolean;
  user: any;
  isServer: boolean;
  isHomePage: boolean;
  public isMenuCollapsed: boolean = false;
  currentRoute: string;
  isNameInputDisabled: boolean =true;
  set showLoader(value){
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private _state: GlobalState,
    private _router: Router,
    private _location: Location,
    private _localStorageService: LocalStorageService,
    private _commonService: CommonService,
    private _cartService: CartService,
    private _localAuthService: LocalAuthService,
    public localStorageService: LocalStorageService,
    private _dashboardService: DashboardService,
    private loaderService:GlobalLoaderService,
    private _tms: ToastMessageService) {
    
    this.showLoader=false;
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
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
    this._localAuthService.clearAuthFlow();
    this._localAuthService.clearBackURLTitle();
    this._cartService.logOutAndClearCart('/');
  }

  onSubmit(data) {
    if (!data) {
      this._tms.show({type: "success", text: "User name cannot be empty."});
      return;
    }
    let userSession = this._localAuthService.getUserSession();
    this.showLoader = true;
    let user = this.localStorageService.retrieve("user");
    let obj = {
      userid: user.userId,
      pname: data.substring(0, data.indexOf(' ')),
      lname: data.substring(data.indexOf(' ') + 1),
    };

    this._dashboardService.updatePersonalInfo(obj).subscribe((res) => {
      this.showLoader = false;
      if (res["status"]) {
        this.error = false;
        this.errorMsg = res["statusDescription"];
        this._tms.show({
          type: "success",
          text: "Profile updated successfully.",
        });
        this.isNameInputDisabled = true;
        userSession['userName'] = data;
        if (this.localStorageService.retrieve("user")) {
          let user = this.localStorageService.retrieve("user");
          if (user.authenticated == "true") {
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

  activateInput(){
    this.isNameInputDisabled = false;
  }

}