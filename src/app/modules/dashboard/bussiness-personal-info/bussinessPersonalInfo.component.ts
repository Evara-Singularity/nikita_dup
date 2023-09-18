import { LocalStorageService } from "ngx-webstorage";
import { DashboardService } from "../dashboard.service";
import { Router } from "@angular/router";
import { Component } from "@angular/core";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalState } from "@app/utils/global.state";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { environment } from "environments/environment";

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
  isEditEmail=false;
  user: any;
  isServer: boolean;
  isHomePage: boolean;
  public isMenuCollapsed: boolean = false;
  currentRoute: string;
  isNameInputDisabled: boolean =true;
  set showLoader(value){
    this.loaderService.setLoaderState(value);
  }
  imgAssetPath: string = environment.IMAGE_ASSET_URL

  constructor(
    private _state: GlobalState,
    private _router: Router,
    public _commonService: CommonService,
    private _cartService: CartService,
    public _localAuthService: LocalAuthService,
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
  ngAfterViewInit(){
    this._commonService.callLottieScript();
    this.addLottieScript();
  }

  logout() {
    this._localAuthService.clearAuthFlow();
    this._localAuthService.clearBackURLTitle();
    this._cartService.logOutAndClearCart('/');
  }

  onSubmit(firstName:string, type:string) {
    console.log(firstName, " ====email ");
    if (type =="name" && !firstName) {
      this._tms.show({type: "success", text: "User name cannot be empty."});
      return;
    }
    if (type =="email" && !firstName) {
      this._tms.show({type: "success", text: "Email cannot be empty."});
      return;
    }
    let userSession = this._localAuthService.getUserSession();
    this.showLoader = true;
    let user = this.localStorageService.retrieve("user");
    let obj = {};
    if(type =="name"){
       obj = { userid: user.userId, pname: firstName || " ", lname: " ", };
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
          userSession['userName'] = firstName;
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
    if(type =="email"){
      let pattern: RegExp =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const isValid = pattern.test(firstName);
      if(!isValid) {
        this._tms.show({ type: 'success', text: 'please enter a valid details'});
        this.showLoader=false;
        return;
      }
      obj = { userid: user.userId,email:firstName ,pname: this.localStorageService.retrieve("user").userName || " ", lname: " ",};
      
      this._dashboardService.updatePersonalInfo(obj).subscribe((res) => {
        this.showLoader = false;
        if (res["status"]) {
          this.error = false;
          this.errorMsg = res["statusDescription"];
          this._tms.show({
            type: "success",
            text: "Profile updated successfully.",
          });
          this.isEditEmail = false;
        }
        // else {
        //   this.error = true;
        //   this.errorMsg = "Something went wrong";
        // }
      }, error => this._tms.show({ type: 'error', text: "Email Already in Use!" }));
   }
  }
  onUpdateEmail(){
     this.isEditEmail = true
    
  }

  cancelEdit(){
    if(this.isEditEmail){
      this.isEditEmail=false;
    }
  }

  toPasswordPage() {
    this._router.navigate(["dashboard/password"]);
  }

  activateInput(){
    this.isNameInputDisabled = false;
  }
  addLottieScript() {
    this._commonService.addLottieScriptSubject.subscribe(lottieInstance => {
      this._commonService.callLottieScript();
      lottieInstance.next();
    });
  }

  get userName() {
    if (!this.userInfo){return ""};
    const pname = this.userInfo['pname'] || "";
    return `${pname}`;
  }

}