import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { StartWithSpaceValidator } from '@app/utils/validators/startwithspace.validator';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';

/**
 * User must have auth flow information
 * User registering using email will be redirected to OTP for mobile verification
 * User registering using OTP will be processed here.
 * if possible for email use auto complete
 * add validations & error messages, toaster
 * 
 */

@Component({
    selector: 'shared-singup',
    templateUrl: './shared-signup.component.html',
    styleUrls: ['./shared-signup.component.scss']
})
export class SharedSignupComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly LOGIN_URL = "/login";
    readonly OTP_URL = "/otp";
    readonly SIGN_UP_PHONE_STEPS = { 1: "OTP", 2: "DETAILS" };
    readonly SIGN_UP_EMAIL_STEPS = { 1: "DETAILS", 2: "OTP" };
    readonly SINGUP_REQUEST = { source: 'signup', lastName: '', userType: 'online', phoneVerified: true, emailVerified: false };
    @Input('isCheckout') isCheckout = false;
    authFlow: AuthFlowType;//gives flowtype & identifier information
    isUserExists = false;
    isSingupUsingPhone = false;
    isOTPLimitExceeded = false;
    isPasswordType = true;
    currentStep = "";
    identifer = null;
    emailorphonevalueSubscription:Subscription = null;

    signupForm = new FormGroup({
        firstName: new FormControl("", [Validators.required, StartWithSpaceValidator.validateSpaceStart]),
        email: new FormControl("", [UsernameValidator.validateEmail]),
        phone: new FormControl("", [UsernameValidator.validatePhone]),
        password: new FormControl("", [PasswordValidator.validateSignupPassword]),
    })
    otpForm = new FormArray([]);


    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService, private _checkoutLoginService: CheckoutLoginService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService, private _localAuthService: LocalAuthService,) { }
    
    

    ngOnInit()
    {
        //redirect if authflow details are not available
        //decide and build singup form depending on OTP or Email registration
        //Need to update the mobile after OTP validation
        this.authFlow = this._localAuthService.getAuthFlow();
        if (!this.authFlow && !this.isCheckout) { this.navigateTo(this.LOGIN_URL); return; }
        if (!this.authFlow && this.isCheckout) { this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.LOGIN_TAB); return; }
        this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
        this.isSingupUsingPhone = (this.authFlow.identifierType === this._sharedAuthService.AUTH_USING_PHONE);
        Object.freeze(this.isSingupUsingPhone);
        this.updateSignupWithIdentifier()
    }

    ngAfterViewInit(): void
    {
        const observable = (this.isSingupUsingPhone) ? this.email.valueChanges : this.phone.valueChanges;
        this.emailorphonevalueSubscription = observable.subscribe((value) => { 
             this.isUserExists = false
        });
    }

    updateSignupWithIdentifier()
    {
        if (this.isSingupUsingPhone) {
            this.phone.patchValue(this.authFlow.identifier);
        }
        else {
            this.email.patchValue(this.authFlow.identifier);
        }
        this.updateSignupStep(1);
    }

    validateUser($event)
    {
        $event.stopPropagation();
        if (this.signupForm.invalid) return;
        if (this.isSingupUsingPhone && !(this.email.value)) { this.initiateSingup(); return;}
        let userInfo = null;
        if (this.isSingupUsingPhone) {
            userInfo = { email: this.email.value, phone: '', type: 'e' };
        } else {
            userInfo = { email: '', phone: this.phone.value, type: 'p' };
        }
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.isUserExist(userInfo).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] == 200) {
                    this.isUserExists = response['exists'];
                    if (!this.isUserExists) {
                        this.onDetailsSubmit();
                    }
                } else {
                    this._toastService.show({ type: 'error', text: response['message'] });
                }
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        );
    }

    captureOTP(otpValue)
    {
        if (!otpValue) return;
        if (this.isSingupUsingPhone) {
            this.updateSignupStep(2);
            return;
        }
        this.initiateSingup();
    }

    onDetailsSubmit()
    {
        if (!(this.isSingupUsingPhone)) {
            this.updateSignupStep(2);
            return;
        }
        this.initiateSingup();
    }

    initiateSingup()
    {
        if (this.isUserExists) return
        //NOTE:verify with Pritam as there will be no firstName & lastName
        this._sharedAuthUtilService.pushNormalUser();
        let request = this.signupForm.value;
        request['otp'] = (this.otpForm.value as string[]).join("");
        const REQUEST = { ...this.SINGUP_REQUEST, ...request, ... { buildVersion: environment.buildVersion } }
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.signUp(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['status'] !== undefined && response['status'] === 500) {
                    if (this.isCheckout) {
                        this._checkoutLoginService.signUpCheckout(false);
                    } else {
                        this._toastService.show({ type: 'error', text: response['message'] });
                    }
                    return;
                }
                const BACKURLTITLE = this._localAuthService.getBackURLTitle();
                const REDIRECT_URL = (BACKURLTITLE && BACKURLTITLE['backurl']) || "/";
                this._localAuthService.clearAuthFlow();
                this._localAuthService.clearBackURLTitle();
                this._sharedAuthUtilService.postSignup(request, response, this.isCheckout, REDIRECT_URL);
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        );
    }

    updateSignupStep(value) { this.currentStep = (this.isSingupUsingPhone) ? this.SIGN_UP_PHONE_STEPS[value] : this.SIGN_UP_EMAIL_STEPS[value] }

    navigateTo(link)    {        this._router.navigate([link])    }
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }
    get disableContinue() { return this.signupForm.invalid || this.isOTPLimitExceeded }
    get firstName() { return this.signupForm.get("firstName"); }
    get email() { return this.signupForm.get("email"); }
    get phone() { return this.signupForm.get("phone"); }
    get password() { return this.signupForm.get("password"); }

    ngOnDestroy(): void
    {
        if(this.emailorphonevalueSubscription)this.emailorphonevalueSubscription.unsubscribe();
    }
}
