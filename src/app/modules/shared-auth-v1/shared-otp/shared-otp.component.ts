import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Subscription, timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { SharedAuthUtilService } from './../shared-auth-util.service';
import { SharedAuthService } from './../shared-auth.service';
/**
 * Flows
 * 1. Login(mobile) + OTP + (backurl/home).
 * 2. Login(email) + OTP + (backurl/home).
 * 3. Singup(mobile) + OTP + signup(mobile details) + (backurl/home).
 * 4. Singup(email) + signup(singup details)  + OTP(signup) +  +(backurl/home).
 */

@Component({
    selector: 'shared-otp',
    templateUrl: './shared-otp.component.html',
    styleUrls: ['./shared-otp.component.scss']
})
export class SharedOtpComponent implements OnInit
{
    readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
    readonly LOGIN_URL = "/login";
    readonly FORGOT_PASSWORD_URL = "/forgot-password";
    readonly OTP_FIELDS_LENGTH = 6;
    @Input('isCheckout') isCheckout = false;
    authFlow: AuthFlowType;//gives flowtype & identifier information
    //otp
    otpForm: FormArray = new FormArray([]);
    isOTPFlow = true;//Decides whether otp or password flow
    isOTPLimitExceeded = false;
    OTP_INPUTS: HTMLCollectionOf<HTMLInputElement>;
    invalidOTPMessage: string = null;
    timer = 0;
    verifiedOTP = "";//to save verified otp + in template number verified or not
    otpFormSubscriber: Subscription = null;
    //password
    isPasswordType = true;//to set input[type] = text/password.
    password: FormControl = null;
    isPasswordSubmitted = false;
    incorrectPassword = null;
    paramsSubscriber: Subscription = null;
    
    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService, private _cartService: CartService,
        private _localAuthService:LocalAuthService,
        private activatedRoute: ActivatedRoute,) { }

    ngOnInit()
    {
        this.authFlow = this._localAuthService.getAuthFlow();
        if (!(this.authFlow)) { this.navigateToLogin(); return; }
        this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
        this.password = new FormControl("", [Validators.required, Validators.minLength(8)]);
        this.isOTPFlow = (this.authFlow.identifierType === this._sharedAuthService.AUTH_USING_PHONE);
        this.updateFlow(this.authFlow.identifier);
        this.addQueryParamSubscribers();
    }

    addQueryParamSubscribers() {
        this.paramsSubscriber = this.activatedRoute.queryParams.subscribe(data => {
            this._sharedAuthService.redirectUrl = data['backurl'];
            if (data['state']) {
                this._sharedAuthService.redirectUrl += '?state=' + data['state'];
            }
        });
    }

    /**
     * @description:depending identifier,decides the flow.
     * @param identifier:string.
     */
    updateFlow(identifier)
    {
        if (window) {
            (this.isCheckout) ? this._sharedAuthUtilService.sendCheckoutAdobeAnalysis() : this._sharedAuthUtilService.sendAdobeAnalysis();
        }
        if (this.isOTPFlow) { this.startOTPTimer(); }
        
    }

    /**
     * @description toggle between otp & password flow
     * @param $event 
     */
    toggleOTPPassword($event: MouseEvent)
    {
        $event.stopPropagation();
        this.isOTPFlow = !(this.isOTPFlow)
        if (this.isOTPFlow) {
            this.resetOTPInfo();
        }
        else {
            this.resetPasswordInfo();
        }
    }

    /**@description to reset all otp information.*/
    resetOTPInfo()
    {
        this.otpForm.controls.forEach((control: FormControl) => control.patchValue(""));
    }

    /** @description to handle otp timer*/
    startOTPTimer()
    {
        timer(0, 1000).pipe(scan(acc => --acc, 21), takeWhile(x => x >= 0)).subscribe((time) =>
        {
            this.timer = time;
        })
    }

    //password section
    resetPasswordInfo()
    {
        this.isPasswordSubmitted = false;
        this.password.patchValue("");
    }

    submitPassword()
    {
        if(this.password.invalid)return
        this._globalLoader.setLoaderState(true);
        let requestData = { password: this.password.value };
        if (this.authFlow.identifierType.includes("PHONE")) {
            requestData['phone'] = this.authFlow.identifier;
        }
        else {
            requestData['email'] = this.authFlow.identifier;
        }
        this._sharedAuthService.authenticate(requestData).subscribe(
            (response) =>
            {
                if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                    this.incorrectPassword = response['message'];
                    //this._cartService.logOutAndClearCart();
                } else {
                    this.incorrectPassword = null;
                    this.processAuthenticaton(response);
                }
                this._globalLoader.setLoaderState(false);
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        )
    }

    captureOTP(otpValue)
    {
        if (!otpValue)return;
        this._globalLoader.setLoaderState(true);
        const REQUEST = { email: '', phone: '',  source: "login_otp" };
        REQUEST['type'] = this._sharedAuthUtilService.getUserType(this.authFlow.flowType, this.authFlow.identifierType);
        REQUEST['otp'] = otpValue;
        if (this.authFlow.identifierType.includes("PHONE")) {
            REQUEST.phone = this.authFlow.identifier;
        }else{
            REQUEST.email = this.authFlow.identifier;
        }
        this._sharedAuthService.authenticate(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                    this._toastService.show({ type: "error", text: response['status'] });
                    this._cartService.logOutAndClearCart();
                    return;
                } 
                this.processAuthenticaton(response);
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        )
    }

    processAuthenticaton(response)
    {
        const BACKURLTITLE = this._localAuthService.getBackURLTitle();
        const REDIRECT_URL = (BACKURLTITLE && BACKURLTITLE['backurl']) || this._sharedAuthService.redirectUrl;
        this._localAuthService.clearAuthFlow();
        this._localAuthService.clearBackURLTitle();
        this._sharedAuthUtilService.processAuthentication(response, this.isCheckout, REDIRECT_URL);
    }

    navigateToLogin() {
        if (this.isCheckout) {
            this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.LOGIN_TAB);
        } else {
            let navigationExtras: NavigationExtras = {
                queryParams: { 'backurl': this._sharedAuthService.redirectUrl },
            };
            this._router.navigate([this.LOGIN_URL], navigationExtras)
        }
    }

    navigateToForgotPassword() {
        if (this.isCheckout) {
            this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.FORGET_PASSWORD_TAB);
        } else {
            let navigationExtras: NavigationExtras = {
                queryParams: { 'backurl': this._sharedAuthService.redirectUrl },
            };
            this._router.navigate([this.FORGOT_PASSWORD_URL], navigationExtras)
        }
    }

    get isOTPVerified() { return (this.verifiedOTP === this.otpValue) && (this.timer === 0); }
    get disableContinue() { return this.verifiedOTP && this.otpForm.valid }
    get otpValue() { return ((this.otpForm.value as string[]).join("")); }
    get isLoginUsingEmail() { return this.authFlow && (this.authFlow.identifierType === this._sharedAuthService.AUTH_USING_EMAIL);}
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }

    ngOnDestroy() {
        if (this.paramsSubscriber) {
            this.paramsSubscriber.unsubscribe()
        }
    }
}
