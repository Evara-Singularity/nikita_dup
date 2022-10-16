import { Validators } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { PasswordValidator } from '@app/utils/validators/password.validator';
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
export class    SharedOtpComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
    readonly LOGIN_URL = "/login";
    readonly CHECKOUT_LOGIN_URL = "/checkout/login";
    readonly CHECKOUT_ADDRESS = "/checkout/address";
    readonly FORGOT_PASSWORD_URL = "/forgot-password";
    readonly CHECKOUT_PASSWORD_URL = "/checkout/forgot-password";
    readonly OTP_FIELDS_LENGTH = 6;
    @Input('isCheckout') isCheckout = false;

    @Input('isLoginPopup') isLoginPopup = false;
    @Output() togglePopUp$: EventEmitter<any> = new EventEmitter<any>();
    @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

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
    incorrectPassword = null;
    passwordValueSubscription: Subscription = null;

    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService, private _cartService: CartService,
        private _localAuthService: LocalAuthService, private _commonService: CommonService, private _activatedRoute: ActivatedRoute
    ) { }

    ngOnInit()
    {
        this.authFlow = this._localAuthService.getAuthFlow();
        if (!(this.authFlow)) { this.navigateToLogin(); return; }
        this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
        this.password = new FormControl("", [PasswordValidator.validatePassword]);
        this.isOTPFlow = (this.authFlow.identifierType === this._sharedAuthService.AUTH_USING_PHONE);
        this.updateFlow(this.authFlow.identifier);
    }

    ngAfterViewInit(): void
    {
        this.passwordValueSubscription = this.password.valueChanges.subscribe(
            (value) => { this.incorrectPassword = null; }
        )
    }

    /**
     * @description:depending identifier,decides the flow.
     * @param identifier:string.
     */
    updateFlow(identifier)
    {
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
        this.otpForm.reset()
        this.otpForm.controls.forEach((control: FormControl) => control.setValue(""));
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
        (this.password as FormControl).reset();
        (this.password as FormControl).setValue("");
    }

    submitPassword()
    {
        if (this.password.invalid) return
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
        if (!otpValue) return;
        this._globalLoader.setLoaderState(true);
        const REQUEST = { email: '', phone: '', source: "login_otp" };
        REQUEST['type'] = this._sharedAuthUtilService.getUserType(this.authFlow.flowType, this.authFlow.identifierType);
        REQUEST['otp'] = otpValue;
        if (this.authFlow.identifierType.includes("PHONE")) {
            REQUEST.phone = this.authFlow.identifier;
        } else {
            REQUEST.email = this.authFlow.identifier;
        }
        this._sharedAuthService.authenticate(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                    this._toastService.show({ type: "error", text: response['status'] || response['message'] });
                    this._cartService.logOutAndClearCart();
                    return;
                }
                this.processAuthenticaton(response);
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        )
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

    navigateToLogin() {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                'backurl': this._sharedAuthService.redirectUrl,
                'state': this._activatedRoute.snapshot.queryParams.state
            },
        };
        if(this.isLoginPopup){
            this.navigateToPopUp('login')
        }
        else if (this.isCheckout) {
            this._router.navigate([this.CHECKOUT_LOGIN_URL])
        } else {
            this._router.navigate([this.LOGIN_URL], navigationExtras)
        }
    }

    navigateToForgotPassword()
    {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                'backurl': this._sharedAuthService.redirectUrl,
                'state': this._activatedRoute.snapshot.queryParams.state
            },
        };
        if(this.isLoginPopup){
            this.navigateToPopUp('forgot-password')
        }
        else if (this.isCheckout) {
            this._router.navigate([this.CHECKOUT_PASSWORD_URL])
        } else {
            this._router.navigate([this.FORGOT_PASSWORD_URL], navigationExtras)
        }
    }

    navigateToPopUp(component){
        this.togglePopUp$.emit(component);
    }

    get isOTPVerified() { return (this.verifiedOTP === this.otpValue) && (this.timer === 0); }
    get disableContinue() { return this.verifiedOTP && this.otpForm.valid }
    get otpValue() { return ((this.otpForm.value as string[]).join("")); }
    get isLoginUsingEmail() { return this.authFlow && (this.authFlow.identifierType === this._sharedAuthService.AUTH_USING_EMAIL); }
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }

    ngOnDestroy()
    {
        if (this.passwordValueSubscription) this.passwordValueSubscription.unsubscribe();
    }
}
