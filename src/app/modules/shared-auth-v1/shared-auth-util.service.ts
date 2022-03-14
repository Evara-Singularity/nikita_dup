import { Injectable, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, Subject } from 'rxjs';
declare var dataLayer;

@Injectable({ providedIn: 'root' })
export class SharedAuthUtilService implements OnInit
{
    readonly HOME_URL = "/";
    readonly SINGUP_REQUEST = { source: 'signup', userType: 'online', phoneVerified: true, emailVerified: false };
    redirectUrl = this.HOME_URL;
    private _checkoutLoginHandler: Subject<number> = new Subject<number>();

    constructor(private _localStorage: LocalStorageService,
        private _globalLoader: GlobalLoaderService, private _cartService: CartService, private _localAuthService: LocalAuthService,
        private _toastService: ToastMessageService, private _commonService: CommonService,
        private _router: Router, private _activatedRoute: ActivatedRoute, private _globalAnalyticsService: GlobalAnalyticsService) { }


    ngOnInit(): void
    {
        let cartSession = this._cartService.getGenericCartSession;
        //TODO:handle for checkout
        this._activatedRoute.queryParams.subscribe(
            data => { this.redirectUrl = data['backurl'] || this.HOME_URL; }
        );
    }

    getUserType(flowType: string, identifierType: string)
    {
        return flowType.includes("SIGNUP") || identifierType.includes("PHONE") ? "p" : "e";
    }

    processAuthentication(response, isCheckout, redirectUrl)
    {
        this._localAuthService.setUserSession(response);
        this._localAuthService.clearAuthFlow();
        const queryParams = this._commonService.extractQueryParamsManually(location.search.substring(1))
        if (queryParams.hasOwnProperty('state') && queryParams.state === 'raiseRFQQuote') {
            redirectUrl += '?state=' + queryParams['state'];
        }
        let cartSession = Object.assign(this._cartService.getGenericCartSession);
        cartSession['cart']['userId'] = response['userId'];
        this.updateCartSession(`Welcome to Moglix, ${response['userName']}`, isCheckout, redirectUrl);
    }

    updateCartSession(message, isCheckout, redirectUrl)
    {
        this._globalLoader.setLoaderState(true);
        this._cartService.performAuthAndCartMerge({
            enableShippingCheck: isCheckout,
            redirectUrl: redirectUrl,
        }).subscribe(cartSession =>
        {
            this._globalLoader.setLoaderState(false);
            if (cartSession) {
                this._commonService.redirectPostAuth(redirectUrl);
                this._toastService.show({ type: 'success', text: message });
            } else {
                this._toastService.show({ type: 'error', text: 'Something went wrong' });
            }
        });
    }

    //common section
    postSignup(params, response, isCheckout, redirectUrl)
    {
        this._localStorage.clear('tocd');
        this._localStorage.store('user', response);
        let cartSession = Object.assign(this._cartService.getGenericCartSession);
        cartSession['cart']['userId'] = response['userId'];
        this.updateCartSession(`Welcome to Moglix, ${params['firstName']}`, isCheckout, redirectUrl);
    }

    updateOTPControls(otpForm: FormArray, length: number) 
    {
        for (let i = 0; i < length; i++) { otpForm.push(new FormControl("", [Validators.required])) }
        return otpForm;
    }

    processOTPError(response)
    {
        const invalidOTPMessage = (response['message'] as string).toLowerCase();
        this._toastService.show({ type: 'error', text: invalidOTPMessage });
        this._router.navigate(["/"]);
    }

    extractBackURL()
    {
        //_activatedRoute
        const REDIRECT_1 = this._activatedRoute.snapshot.queryParams['backurl'];
        //_localAuthService
        const BACKURLTITLE = this._localAuthService.getBackURLTitle();
        const REDIRECT_2: string = ((BACKURLTITLE && BACKURLTITLE['backurl']) as string);
        //localstorage
        const BACK_URL_STRING = decodeURIComponent(localStorage.getItem("backRedirectUrl"));
        let REDIRECT_3: string = (BACK_URL_STRING.split("backurl=")[1] as string);
        if (REDIRECT_3.includes("&")) {
            REDIRECT_3 = REDIRECT_2.split("&")[0];
        }
        //home
    }

    pushNormalUser()
    {
        let pushData = true;
        for (let i = 0; i < dataLayer.length; i++) {
            if (dataLayer[i]['event'] == 'registerBusinessUser')
                pushData = false;
        }
        if (pushData) {
            dataLayer.push({
                'event': 'registerBusinessUser'
            });
        }
    }

    emitCheckoutLogin(tabindex)
    {
        this._checkoutLoginHandler.next(tabindex);
    }

    getCheckoutLoginEvent(): Observable<number>
    {
        return this._checkoutLoginHandler.asObservable();
    }

    logoutUserOnError()
    {
        this._cartService.logOutAndClearCart()
    }

    //tracking
    sendLoginSignupGenericPageLoadTracking(subSection)
    {
        let page = {
            channel: "login/signup",
            pageName: "moglix:login/signup first page",
            subSection: `moglix:login page:${subSection}`,
            loginStatus: "guest"
        };
        this._globalAnalyticsService.sendAdobeCall({ page }, "genericPageLoad");
    }

    sendOTPGenericPageLoadTracking(isUserExists, subSection)
    {
        let page = {
            channel: "login/signup",
            pageName: isUserExists ? "moglix:login page" : "moglix:signup form",
            subSection: isUserExists ? "moglix:login page:otp:repeat" : `moglix:signup form:otp:new:${subSection}`,
            loginStatus: isUserExists ? "registered user" : "guest"
        };
        this._globalAnalyticsService.sendAdobeCall({ page }, "genericPageLoad");
    }

    sendSingupDetailsPageLoadTracking(subSection)
    {
        let page = {
            channel: "login/signup",
            pageName: "moglix:signup form",
            subSection: `moglix:signup form:${subSection}:userdetail`,
            loginStatus: "guest"
        };
        this._globalAnalyticsService.sendAdobeCall({ page }, "genericPageLoad");
    }

    sendGenericPageClickTracking(isLogin)
    {
        let page = {
            channel: "login/signup",
            linkPageName: isLogin ? "moglix:login page" : "moglix:signup form",
            subSection: isLogin ? "moglix:login page: Login Success" : "moglix:signup form:Sign up success",
            linkName: isLogin ? "Login CTA" : "Sign up CTA",
            loginStatus: isLogin ? "registered" : "guest",
        };
        let custData = {};
        let order = {}
        this._globalAnalyticsService.sendAdobeCall({ page, custData, order }, "genericClick");
    }

    sendGenericPageErrorTracking()
    {
        let page = {
            channel: "login/signup",
            pageName: "moglix:login/signup post",
            linkName: "post login/signup",
            loginStatus: "guest",
            error: "Authentication Failure"
        };
        let custData = {};
        let order = {}
        this._globalAnalyticsService.sendAdobeCall({ page, custData, order }, "genericClick"); 
    }
}