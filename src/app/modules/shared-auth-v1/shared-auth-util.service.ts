import { FormArray, FormControl, Validators } from '@angular/forms';
import { Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';
import { map } from 'rxjs/operators';
import { AuthFlowType } from './modals';
import { SharedAuthService } from './shared-auth.service';
declare var dataLayer;
declare var digitalData: {};
declare var _satellite;

@Injectable({ providedIn: 'root' })
export class SharedAuthUtilService implements OnInit
{
    readonly HOME_URL = "/";

    readonly SINGUP_REQUEST = { source: 'signup', userType: 'online', phoneVerified: true, emailVerified: false };

    redirectUrl = this.HOME_URL;

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

    getUserType(identifierType: string) { return identifierType.includes("PHONE") ? "p" : "e"; }

    getSourceType(isUserExists) { return (isUserExists) ? "login_otp" : "signup"; }

    getUserData(source?)
    {
        const FLOW_DATA: AuthFlowType = this.getAuthFlow();
        if (!source) { source = this.getSourceType(FLOW_DATA.isUserExists); }
        let requestData = { email: '', phone: '', type: this.getUserType(FLOW_DATA.identifierType), source: source };
        if (FLOW_DATA.identifierType.includes("PHONE")) {
            requestData.phone = FLOW_DATA.identifier;
            return requestData;
        }
        requestData.phone = FLOW_DATA.identifier;
        return requestData;
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
        this.updateCartSession(isCheckout, redirectUrl);
    }

    updateCartSession(isCheckout, redirectUrl)
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
                    this._checkoutLoginService.setLoginUsingOTPStatus({
                        status: true,
                        message: 'Sign in successful'
                    })
                } else {
                    this._commonService.redirectPostAuth(redirectUrl);
                    this._toastService.show({ type: 'success', text: 'Sign in successful' });
                }
            } else {
                this._toastService.show({ type: 'error', text: 'Something went wrong' });
            }
        });
    }

    //common section
    initiateOTP(request)
    {
        this._globalLoader.setLoaderState(true);
        // this._sharedAuthService.sendOTP(request).subscribe(
        //     (response) =>
        //     {
        //         this._globalLoader.setLoaderState(false);
        //         if (response['statusCode'] !== 200) {
        //             this.processOTPError(response);
        //             return;
        //         }
        //         this._router.navigate(["/"]);
        //     },
        //     (error) => { this._globalLoader.setLoaderState(false); },
        // )
    }

    processOTPError(response)
    {
        const invalidOTPMessage = (response['message'] as string).toLowerCase();
        this._toastService.show({ type: 'error', text: invalidOTPMessage });
        this._router.navigate(["/"]);
    }

    signupUser(request, isCheckout)
    {
        this.pushNormalUser();
        const REQUEST = { ...this.SINGUP_REQUEST, request }
        this._globalLoader.setLoaderState(true);
        // this._sharedAuthService.signUp(REQUEST).subscribe(
        //     (response) =>
        //     {
        //         this._globalLoader.setLoaderState(false);
        //         if (response["status"])
        //         {
        //             this.postSignup(request, response, isCheckout, this.redirectUrl);
        //             return;
        //         }
        //         this._router.navigate(["/login"]);
        //     },
        //     (error) => { this._globalLoader.setLoaderState(false); }
        // );
    }

    postSignup(params, response, isCheckout, redirectUrl)
    {
        if (response['status'] !== undefined && response['status'] === 500) {
            if (isCheckout) {
                this.clearAuthFlow();
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
            this.updateCartSession(isCheckout, redirectUrl);
            this.clearAuthFlow();
        }
    }

    updateOTPControls(otpForm: FormArray,   length: number) 
    {
        for (let i = 0; i < length; i++) { otpForm.push(new FormControl("", [Validators.required])) }
        return otpForm;
    }

    //tracking sectoin 
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
}