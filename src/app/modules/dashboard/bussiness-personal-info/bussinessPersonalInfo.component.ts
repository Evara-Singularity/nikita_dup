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
  isEmailAvailable: boolean = false;
  user: any;
  isServer: boolean;
  isHomePage: boolean;
  public isMenuCollapsed: boolean = false;
  currentRoute: string;
  isNameInputDisabled: boolean =true;
  isEmailInputDisabled: boolean =true;
  set showLoader(value){
    this.loaderService.setLoaderState(value);
  }
  imgAssetPath: string = environment.IMAGE_ASSET_URL
  selectLanguagePopUp: boolean = false;
  selectedLanguage: string;

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
    this.selectedLanguage = this.user['preferredLanguage'] || 'en';
    this._dashboardService.getPersonalInfo(obj).subscribe((res) => {
      if(res && res['email']){
        this.isEmailAvailable = true;
      }
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
    if (type =="name" && !firstName) {
      this._tms.show({type: "success", text: "Kindly enter your name."});
      return;
    }
    if (type =="email" && !firstName) {
      this._tms.show({type: "success", text: "Kindly enter your email id."});
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
        this._tms.show({ type: 'success', text: 'Kindly enter your valid email id.'});
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
            text: "E-mail ID updated successfully" ,
          });
          this.isEmailAvailable = true;
          this.isEmailInputDisabled=true;
        }
        // else {
        //   this.error = true;
        //   this.errorMsg = "Something went wrong";
        // }
      }, error => {
        // const str = JSON.parse(error.error.message)
        this._tms.show({ type: 'error', text: "This email id already registered with other account, try entering different email id" })});
   }
  }

  toPasswordPage() {
    this._router.navigate(["dashboard/password"]);
  }

  activateInput(type:string){
    if(type=='name'){this.isNameInputDisabled = false;}
    if(type=='email'){this.isEmailInputDisabled=false;}
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

  loadSelectLanguagePopUp() {
    this.selectLanguagePopUp = true;
  }

  updateLanguage(language){
    if(language == null){
      this.selectLanguagePopUp = false;
      return;
    }
    const params = "customerId=" + this.user["userId"] + "&languageCode=" + language;
    this._commonService.postUserLanguagePrefrence(params).subscribe(result=>{
      if(result && result['status'] == true){
        this.selectedLanguage = result['data'] && result['data']['languageCode'];
        this.localStorageService.store("languagePrefrence", this.selectedLanguage);
        const userSession = this._localAuthService.getUserSession();
        const newUserSession = Object.assign({},userSession);
        newUserSession.preferredLanguage = this.selectedLanguage;
        this._localAuthService.setUserSession(newUserSession);
        this.selectLanguagePopUp = false;
        if(this.selectedLanguage == 'en'){
          this._tms.show({type: "success", text: "You choose ‘English’ as your preferred language"});
        }else{
          this._tms.show({type: "success", text: "आपने अपनी पसंदीदा भाषा के रूप में ’हिंदी’ को चुना हैं"});
        }
      }else{
        this._tms.show({type: "error", text: result['statusDescription']});
        this.selectLanguagePopUp = false;
      }
    })
  }

}