import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { LocalStorageService } from 'ngx-webstorage';
import { Subscription, timer } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; 
import CONSTANTS from '../../../../app/config/constants';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';
import { switchMap, takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


export interface BackurlWithTitle
{
    backurl: string,
    title: string
}

@Component({
    selector: 'shared-login',
    templateUrl: './shared-login.component.html',
    styleUrls: ['./shared-login.component.scss']
})
export class SharedLoginComponent implements OnInit, OnDestroy
{
    readonly CHECKOUT_ADDRESS = "/checkout/address";
    readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
    readonly LOGIN_USING_PHONE = this._sharedAuthService.AUTH_USING_PHONE;
    readonly LOGIN_USING_EMAIL = this._sharedAuthService.AUTH_USING_EMAIL;
    readonly SUGGESTION_EMAIL_HOST = ['gmail.com', 'yahoo.com', 'live.com', 'rediffmail.com', 'outlook.com']
    @Input('isCheckout') isCheckout = false;
    loginNumberForm = this._fb.group({
        phone: ['', [Validators.required, UsernameValidator.validatePhone]]
    })
    loginEmailForm = this._fb.group({
        email: ['', [Validators.required, UsernameValidator.validateAuthEmail]]
    });
    @Input('isLoginPopup') isLoginPopup = false;
    @Output() togglePopUp$: EventEmitter<any> = new EventEmitter<any>();
    @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

    loginType = this.LOGIN_USING_PHONE; // default login using phone number
    isLoginNumberFormSuisLoginNumberFormSubmitted: boolean = false; bmitted: boolean = false;
    isLoginNumberFormSubmitted: boolean = false;
    isLoginEmailFormSubmitted: boolean = false;
    emailAutoCompleteSuggestion: string[] = [];
    bURLTitleSubscriber: Subscription = null;
    headerTitle:string = null;
    displaySuggestion = true;
    authFlow:AuthFlowType = null;
    paramsSubscriber = null;
    state;
    private truecallerRequestId:string = ""
    private timeoutId: any;

    constructor(
        private _fb: FormBuilder,
        private _sharedAuthService: SharedAuthService,
        private _sharedAuthUtilService: SharedAuthUtilService,
        private _localAuthService: LocalAuthService,
        private _loader: GlobalLoaderService,
        private _tms: ToastMessageService,
        private activatedRoute: ActivatedRoute,
        private _router: Router,
        private _route: ActivatedRoute,
        private _common: CommonService,
        public localStorageService: LocalStorageService,
        private http: HttpClient,
        private _commonService: CommonService,
    ) {
        this.truecallerRequestId = uuidv4()
     }

    ngOnInit(): void
    {
        if (this._common.isBrowser) {
            this.initializeTruecaller()
            this.authFlow = this._localAuthService.getAuthFlow();
            if (this.authFlow) { 
                this.updateControls(this.authFlow.identifier)
            }
        }
        this.handleBackUrlTitle();
        this.addQueryParamSubscribers();
        // Tracking 
        this.isLoginPopup ? this._sharedAuthUtilService.sendLoginPopUpTracking() : this._sharedAuthUtilService.sendLoginSignupGenericPageLoadTracking(this.headerTitle || "mainpage")
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeoutId);
    }


    processAuthenticaton(response) {
        this._sharedAuthUtilService.sendGenericPageClickTracking(true);
        const BACKURLTITLE = this._localAuthService.getBackURLTitle();
        let REDIRECT_URL = (BACKURLTITLE && BACKURLTITLE['backurl']) || this._sharedAuthService.redirectUrl;
        const queryParams = this._commonService.extractQueryParamsManually(location.search.substring(1))
        if (queryParams.hasOwnProperty('state') && queryParams.state === 'raiseRFQQuote') {
            REDIRECT_URL += '?state=' + queryParams['state'];
        }
        this._localAuthService.setUserSession(response);
        this._localAuthService.clearAuthFlow();
        this._localAuthService.clearBackURLTitle();
        if (this.isLoginPopup) {
            // console.log('popup login', this.isLoginPopup);
            this._sharedAuthUtilService.loginPopUpAuthenticationProcess(response).subscribe(cartSession => {
                this.removeAuthComponent$.emit();
            })
        } else {
            // console.log('normal login', this.isLoginPopup);
            this._sharedAuthUtilService.processAuthentication(
                response,
                this.isCheckout,
                ((this.isCheckout) ? this.CHECKOUT_ADDRESS : REDIRECT_URL)
            );
        }
    }

    private fetchTruecallerUserFlow() {
        this._sharedAuthService.fetchTrueCallerUser({
            requestId: this.truecallerRequestId
        }).subscribe((response) => {
            alert(JSON.stringify(response))
            if (response["code"] == 200 && response["status"]) {
                // alert(JSON.stringify(response["data"]))
                this.processAuthenticaton(response["data"])
            } 
          });
      }

    initializeTruecaller(): void {
        console.log("initializeTruecaller: called")
        const params = {
            type: "btmsheet",
            requestNonce: this.truecallerRequestId,
            partnerKey: "o68do1c71f3f1e8af4c13af239b29cd3b1eba",
            partnerName: "moglix-app-qa",
            lang: "en",
            privacyUrl: "",
            termsUrl: "",
            loginPrefix: "continue",
            loginSuffix: "signin",
            ctaPrefix: "continuewith",
            ctaColor: "%23f75d34",
            ctaTextColor: "%23f75d34",
            btnShape: "rect",
            skipOption: "",
            ttl: 8000,
          };
          
        let url = `truecallersdk://truesdk/web_verify?` + this.objectToQueryString(params);
        window.open(url);
        this.timeoutId = setTimeout(() => {
            this.fetchTruecallerUserFlow();
        }, 600);
    }

    addQueryParamSubscribers() {
        this.paramsSubscriber = this.activatedRoute.queryParams.subscribe(data => {
            this._sharedAuthService.redirectUrl = data['backurl'];
        });
    }

    intiatePopUpLogin(){
        this.removeAuthComponent$.emit();
    }

    objectToQueryString(obj) {
        const keyValuePairs = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value !== undefined && value !== null) {
                    keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }
        }
        return keyValuePairs.join('&');
    }

    updateControls(identifier:string)
    {
        if (identifier.includes("@")){
            this.emailFC.patchValue(identifier);
            this.loginType = this.LOGIN_USING_EMAIL;
            return;
        }
        this.phoneFC.patchValue(identifier);
        this.loginType = this.LOGIN_USING_PHONE;
    }

    handleBackUrlTitle()
    {
        this._route.queryParamMap.subscribe(params =>
        {
            this.headerTitle = params.get('title');
        })
        const DATA: BackurlWithTitle = this._localAuthService.getBackURLTitle();
        if (DATA) {
            this.headerTitle = DATA.title
        }
    }

    submit(logintype)
    {
        switch (logintype) {
            case this.LOGIN_USING_PHONE:
                this.isLoginNumberFormSubmitted = true;
                this.loginNumberForm.valid && this.validateUserWithPhone();
                break;
            case this.LOGIN_USING_EMAIL:
                this.isLoginEmailFormSubmitted = true;
                this.loginEmailForm.valid && this.validateUserWithEmail();
                break;
            default:
                break;
        }
    }

    /**
     * login flow with otp
     * action: redirect to otp with password option, as user is already registere   
     * signup flow with otp
     * action: redirect to otp without password option, as user registration is not done 
     * */
    validateUserWithPhone()
    {
        this._loader.setLoaderState(true);
        const body = { email: '', phone: this.phoneFC.value, type: 'p' };
        this._sharedAuthService.isUserExist(body).subscribe(response =>
        {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._localAuthService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_PHONE, this.phoneFC.value);
                if (this.isLoginPopup) { // navigate to next popup screen
                   this.navigateToNextPopUp(isUserExists);
                } else { 
                   this.navigateToNext(isUserExists);
                }
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    navigateToNextPopUp(isUserExists) {
        const LINK = (isUserExists) ? 'otp': 'sign-up';
        this.togglePopUp$.emit(LINK);
    }

    validateUserWithEmail()
    {
        this._loader.setLoaderState(true);
        const body = { email: this.emailFC.value, phone: '', type: 'e' };
        this._sharedAuthService.isUserExist(body).subscribe(response =>
        {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                //CHECK:Email with otp screen with password
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._localAuthService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_EMAIL, this.emailFC.value);
                if (this.isLoginPopup) {  // navigate to next popup screen
                    this.navigateToNextPopUp(isUserExists);
                } else {
                    this.navigateToNext(isUserExists);
                }          
              } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }
 
    clearSuggestion()
    {
        this.emailAutoCompleteSuggestion = [];
    }

    createEmailSuggestion(value)
    {
        const proposedHostValue = (value.split('@').length > 0) ? value.split('@')[1] : '';
        if (proposedHostValue) {
            // show only filtered suggestion as user types
            this.emailAutoCompleteSuggestion = this.SUGGESTION_EMAIL_HOST.filter(host => host.indexOf(proposedHostValue) > -1)
                .map(host => `${value.split('@')[0]}@${host}`);;
        } else {
            // show all suggestion
            this.emailAutoCompleteSuggestion = this.SUGGESTION_EMAIL_HOST.map(host => `${value}${host}`);
        }
    }

    // supporting functions
    navigateToNext(isUserExists)
    {
        const LINK = (isUserExists) ?
            ((this.isCheckout) ? "/checkout/otp" : "/otp") :
            ((this.isCheckout) ? "/checkout/sign-up" : "/sign-up");
        let navigationExtras: NavigationExtras = {
            queryParams: { 
                'backurl': this._sharedAuthService.redirectUrl,
                'state': this.activatedRoute.snapshot.queryParams.state
            },
        };
        this._router.navigate([LINK], navigationExtras);
    }

    toggleLoginType(type)
    {
        this.loginType = type;
        this.resetForms();
        this.clearSuggestion();
    }

    resetForms()
    {
        this.phoneFC.setValue('');
        this.emailFC.setValue('');
        this.isLoginEmailFormSubmitted = false;
        this.isLoginNumberFormSubmitted = false;
    }

    fillEmailSuggestion(value)
    {
        this.emailFC.patchValue(value);
        this.clearSuggestion();
        this.displaySuggestion = false;
    }

    toggleListDisplay(flag) { setTimeout(() => { this.displaySuggestion = flag; }, 100) }

    filter(value: string)
    {
        if (value.indexOf('@') > 0 && this.displaySuggestion) {
            this.createEmailSuggestion(value);
        } else {
            this.clearSuggestion();
        }
    }

    navigateSkipNow() {
        if (this.isLoginPopup) {
            this.removeAuthComponent$.emit();
        } else {
            this._localAuthService.handleBackURL(true);
            let backRedirectUrl = localStorage.getItem('backRedirectUrl');
            if (backRedirectUrl != '/') {
                let userSession = this.localStorageService.retrieve('user');
                if (userSession && userSession.authenticated == "true") {
                    if (backRedirectUrl === 'null') {
                        this._router.navigateByUrl(this._sharedAuthService.redirectUrl);
                        return;
                    } else {
                        this._router.navigateByUrl(backRedirectUrl);
                        return;
                    }
                } else {
                    if (backRedirectUrl != 'null'){
                        this._router.navigateByUrl(backRedirectUrl);
                    }else
                    this._router.navigateByUrl('/');
                }
            }
        }
    }
    
    removeAuthComponent(){
        this.removeAuthComponent$.emit();
    }
    navigateHome() { 
       if(this.isLoginPopup){
          this.removeAuthComponent();
          this._router.navigate(["."]);
          return;
       }
       this._router.navigate(["."]);
    }
    get isAuthHeader() { return this.isCheckout === false && this.headerTitle !== null }
    get phoneFC() { return this.loginNumberForm.get("phone"); }
    get emailFC() { return this.loginEmailForm.get("email"); }
    get isNormalLogin() { return this.isCheckout === false && !(this.headerTitle)  }
    get isWhiteHeader() { return this.isCheckout || (this.headerTitle && this.headerTitle.length>0)}
}
