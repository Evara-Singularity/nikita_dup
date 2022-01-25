import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Subscription, timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { AuthFlowType } from '../modals';
import { SharedAuthUtilService } from './../shared-auth-util.service';
import { SharedAuthService } from './../shared-auth.service';
import { CONSTANTS } from '@app/config/constants';
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
export class SharedOtpComponent implements OnInit, AfterViewInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
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

    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService) { }

    ngOnInit()
    {
        this.authFlow = this._sharedAuthUtilService.getAuthFlow();
        //if authFlow is empty then navigate to login
        if (!(this.authFlow)) { this.navigateToLogin(); return; }// || !(this.authFlow.isUserExists)
        this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
        this.password = new FormControl("", [Validators.required, Validators.minLength(8)]);
        this.isOTPFlow = (this.authFlow.identifierType === this._sharedAuthService.AUTH_USING_PHONE);
        this.updateFlow(this.authFlow.identifier);
    }

    ngAfterViewInit()
    {
        this.OTP_INPUTS = (document.getElementsByClassName("pseudo") as HTMLCollectionOf<HTMLInputElement>);
        this.addSubscribers();
        this.enableWebOTP();
    }

    addSubscribers()
    {
        this.otpFormSubscriber = this.otpForm.valueChanges.subscribe((value) =>
        {
            if (this.otpForm.valid) { this.validateOTP(); }
        })
    }

    //NOTE:check on this.
    enableWebOTP()
    {
        if (typeof window !== 'undefined') {
            if ('OTPCredential' in window) {
                const ac = new AbortController();
                var reqObj = { otp: { transport: ['sms'] }, signal: ac.signal };
                navigator.credentials.get(reqObj).then((otp: any) =>
                {
                    if (otp && otp.code) {
                        const OTPS = (otp.code as string).split("");
                        OTPS.forEach((value, index) => { this.otpForm.controls[index].patchValue(value) })
                    }
                }).catch(err => { console.log(err); });
            }
        }
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

    initiateOTP()
    {
        const REQUEST = this._sharedAuthUtilService.getUserData();
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.sendOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] === 200) {
                    this.invalidOTPMessage = null;
                    this.startOTPTimer();
                    return;
                }
                this._sharedAuthUtilService.processOTPError(response);
            },
            (error) => { this._globalLoader.setLoaderState(false); },
        )
    }

    validateOTP()
    {
        const REQUEST = this._sharedAuthUtilService.getUserData();
        REQUEST['otp'] = (this.otpForm.value as string[]).join();
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.validateOTP(REQUEST).subscribe(
            (response) =>
            {
                if (response['status']) {
                    this.verifiedOTP = this.otpValue;
                    return;
                }
                this._sharedAuthUtilService.processOTPError(response);
                this._globalLoader.setLoaderState(true);
            }, (error) => { this._globalLoader.setLoaderState(false); });
    }

    /**
     * @description to focus prceeding otp field if current otp field is valid
     * @param isValid : whether otp field control is valid or not
     * @param inputIndex : current otp field index
     */
    moveFocus($event, isValid, inputIndex)
    {
        $event.stopPropagation();
        //$event.which = 8:means backspace pressed.
        if ((inputIndex >= 0) && (inputIndex - 1 > -1) && ($event.which === 8)) {
            this.OTP_INPUTS[inputIndex - 1].focus();
        }
        if (isValid && (inputIndex < this.OTP_INPUTS.length - 1)) {
            this.OTP_INPUTS[inputIndex + 1].focus();
        }
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
        this.initiateOTP();
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
        const REQUEST = this._sharedAuthUtilService.getUserData("");
        REQUEST['password'] = this.password.value;
        this._sharedAuthService.authenticateUser(REQUEST, this.isCheckout);
    }

    //singup section
    initiateSingupFlow()
    {
        //NOTE:phoneVerified with Pritam & signup otp
        const isSingupUsingPhone = (this.authFlow.identifierType === this._sharedAuthService.AUTH_SINGUP_BY_EMAIL);
        const OTP = (this.otpForm.value as string[]).join()
        if (isSingupUsingPhone) {
            this.authFlow.data = { otp: OTP };
            this._router.navigate(['sign-up']);
            return;
        }
        const singup = this.authFlow.data;
        singup.otp = this.authFlow.data['otp'];
        this._globalLoader.setLoaderState(false);
        this._sharedAuthUtilService.signupUser(singup, this.isCheckout);
    }

    //reusable section
    authenticate() {
        const REQUEST = this._sharedAuthUtilService.getUserData();
        REQUEST['otp'] = (this.otpForm.value as string[]).join();
        this._sharedAuthService.authenticateUser(REQUEST, this.isCheckout);
    }
    navigateToLogin() { this._router.navigate([this.LOGIN_URL]) }
    navigateToForgotPassword() { this._router.navigate([this.FORGOT_PASSWORD_URL]) }

    get isOTPVerified() { return (this.verifiedOTP === this.otpValue) && (this.timer === 0); }
    get disableContinue() { return this.verifiedOTP && this.otpForm.valid }
    get otpValue() { return ((this.otpForm.value as string[]).join()); }
}
