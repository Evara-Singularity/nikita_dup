import { Injectable, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable, Subject } from 'rxjs';
import { AuthFlowType } from './modals';
declare var dataLayer;
declare var digitalData: {};
declare var _satellite;

@Injectable({providedIn: 'root'})
export class SharedAuthUtilService implements OnInit
{
    readonly HOME_URL = "/";
    readonly SINGUP_REQUEST = { source: 'signup', userType: 'online', phoneVerified: true, emailVerified: false };
    redirectUrl = this.HOME_URL;
    private _checkoutLoginHandler: Subject<number> = new Subject<number>();

    constructor(private _localStorage: LocalStorageService,
        private _globalLoader: GlobalLoaderService, private _cartService: CartService, private _localAuthService: LocalAuthService,
        private _toastService: ToastMessageService, private _commonService: CommonService, private _checkoutLoginService: CheckoutLoginService,
        private _router: Router, private _activatedRoute: ActivatedRoute,) { }


    ngOnInit(): void
    {
        let cartSession = this._cartService.getCartSession();
        //TODO:handle for checkout
        this._activatedRoute.queryParams.subscribe(
            data => { this.redirectUrl = data['backurl'] || this.HOME_URL; }
        );
    }

    setAuthFlow(isUserExists, flowType, authIdentifierType, authIdentifier, data = null)
    {
        const MAUTH: AuthFlowType = { isUserExists: isUserExists, flowType: flowType, identifierType: authIdentifierType, identifier: authIdentifier, data: data };
        this.clearAuthFlow();
        this._localStorage.store("authflow", MAUTH);
    }

    getAuthFlow(): AuthFlowType { return this._localStorage.retrieve("authflow"); }

    clearAuthFlow() { this._localStorage.clear("authflow"); }

    getUserType(flowType:string , identifierType: string)
    {
        return flowType.includes("SIGNUP") || identifierType.includes("PHONE") ? "p" : "e";
    }

    processAuthentication(response, isCheckout, redirectUrl)
    {
        this._localAuthService.setUserSession(response);
        this.clearAuthFlow();
        if (window) {
            this.sendCriteoLayerTags(response);//ATUL
        }
        let cartSession = Object.assign(this._cartService.getCartSession());
        cartSession['cart']['userId'] = response['userId'];
        this.updateCartSession('Sign in successful', isCheckout, redirectUrl);
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
                if (isCheckout) {
                    // value: 2 should be emited for checkout login
                    this.emitCheckoutLogin(2); 
                } else {
                    this._commonService.redirectPostAuth(redirectUrl);
                    this._toastService.show({ type: 'success', text: message });
                }
            } else {
                this._toastService.show({ type: 'error', text: 'Something went wrong' });
            }
        });
    }

    //common section
    postSignup(params, response, isCheckout, redirectUrl)
    {
        if (response['status'] !== undefined && response['status'] === 500) {
            if (isCheckout) {
                this._checkoutLoginService.signUpCheckout(false);
            } else {
                this._toastService.show({ type: 'error', text: response['message'] });
            }
        } else {
            this._localStorage.clear('tocd');
            this._localStorage.store('user', response);
            if (window) {
                this.sendCriteoDataLayerTags(response['userId'], params);
            }
            let cartSession = Object.assign(this._cartService.getCartSession());
            cartSession['cart']['userId'] = response['userId'];
            this.updateCartSession('Signup successful', isCheckout, redirectUrl);
        }
        this.clearAuthFlow();
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

    //tracking section
    sendAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:login page",
            'channel': "login/signup",
            'subSection': "moglix:login page:otp details",
        }
        digitalData["page"] = page;
        if (_satellite) {
            _satellite.track("genericPageLoad");
        }
    }

    //NOTE:if login is from OTP Page and password
    // sendLoginAdobeAnalysis()
    // {
    //     let page = {
    //         'pageName': "moglix:login page",
    //         'channel': "login/signup",
    //         'subSection': "moglix:login page",
    //     }
    //     digitalData["page"] = page;
    //     if (_satellite) {
    //         _satellite.track("genericPageLoad");
    //     }
    // }

    sendSignupAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:signup form",
            'channel': "login/signup",
            'subSection': "moglix:signup form",
        }
        digitalData["page"] = page;
        if (_satellite) {
            _satellite.track("genericPageLoad");
        }
    }


    sendCheckoutAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:order checkout:login page",
            'channel': "checkout",
            'subSection': "moglix:order checkout:login page:otp details",
        }
        digitalData["page"] = page;
        if (_satellite) {
            _satellite.track("genericPageLoad");
        }
    }

    sendCriteoLayerTags(data)
    {
        dataLayer.push({
            'event': 'setEmail',
            'PageType': 'OtpPage',
            'email': data['email'] ? data['email'] : data['phone']
        });
        dataLayer.push({
            'event': 'user_login',
            id: data["userId"],
            first_name: data["userName"],
            last_name: '',
            phone: data["phone"],
            email: data["email"],
            user_type: data["userType"]
        });
    }

    //NOTE:if login is from OTP Page and password
    // sendCriteoLayerTags(data)
    // {
    //     dataLayer.push({
    //         'event': 'setEmail',
    //         'PageType': 'LoginPage',
    //         'email': data['email'] ? data['email'] : data['phone']
    //     });
    //     dataLayer.push({
    //         'event': 'user_login',
    //         id: data["userId"],
    //         first_name: data["userName"],
    //         last_name: '',
    //         phone: data["phone"],
    //         email: data["email"],
    //         user_type: data["userType"]
    //     });
    // }

    sendCriteoDataLayerTags(userId, params)
    {
        dataLayer.push({
            'event': 'setEmail',
            'email': params['email'] ? params['email'] : params['phone'],
            'phone': params['phone'] ? params['phone'] : "",
            'name': params['userName'] ? params['userName'] : "",
        });
        dataLayer.push({
            'event': 'user_login',
            id: userId,
            first_name: params.firstName,
            last_name: params.lastName,
            phone: params.phone,
            email: params.email,
            user_type: params.userType
        });
        dataLayer.push({
            'event': 'registerNormalUser',
        });
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

    emitCheckoutLogin(tabindex) {
        this._checkoutLoginHandler.next(tabindex);
    }

    getCheckoutLoginEvent(): Observable<number> {
        return this._checkoutLoginHandler.asObservable();
    }
}