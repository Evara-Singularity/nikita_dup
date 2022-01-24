import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { AuthFlowType } from '../modals';
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
export class SharedOtpComponent implements OnInit, AfterViewInit
{
    readonly LOGIN_URL = "/login";
    readonly OTP_FIELDS_LENGTH = 6;
    @Input('isCheckout') isCheckout = false;
    authFlow: AuthFlowType;//gives flowtype & identifier information
    //otp
    otpForm: FormArray = new FormArray([]);
    isOTPFlow = true;//Decides whether otp or password flow
    isOTPLimitExceeded = false;
    OTP_INPUTS: HTMLCollectionOf<HTMLInputElement>;
    invalidOTPMessage: string = null;
    timer;
    //password
    password: FormControl = null;
    isPasswordSubmitted = false;

    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService:ToastMessageService) { }

    ngOnInit()
    {
        this.buildOTPForm();
        this.password = new FormControl("", [Validators.required, Validators.minLength(8)]);
        this.authFlow = this._sharedAuthUtilService.getAuthFlow();
        //if authFlow is empty then navigate to login
        if (!this.authFlow) { this.navigateToLogin(); return; }
        this.updateFlow(this.authFlow.identifier);
    }

    ngAfterViewInit()
    {
        this.OTP_INPUTS = (document.getElementsByClassName("pseudo") as HTMLCollectionOf<HTMLInputElement>);
        this.enableWebOTP();
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
        if (!identifier) { this._router.navigate([this.LOGIN_URL]); return }
        if (this.authFlow.isUserExists) {
            this.startOTPTimer();
            if (window) {
                (this.isCheckout) ? this._sharedAuthUtilService.sendCheckoutAdobeAnalysis() : this._sharedAuthUtilService.sendAdobeAnalysis();
            }
        }
        else {
            this.initiateSingupFlow();
        }
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

    verifyOTP()
    {
        if(!this.isCheckout)
        {
            console.log(this.otpForm.value)
            return;
        }
        const REQUEST = this._sharedAuthUtilService.getUserData();
        REQUEST['otp'] = (this.otpForm.value as string[]).join();
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.validateOTP(REQUEST).subscribe(
            (response) =>
            {
                if (response['statusCode'] === 200 && response['status']) {
                    this.invalidOTPMessage = null;
                    //NOTE:If user exists then authenticate flow, otherwise initiate singup
                    if(this.authFlow.isUserExists){
                        this._sharedAuthService.authenticateUser(REQUEST, this.isCheckout);
                    }else{
                        this.initiateSingupFlow();
                    }
                } else {
                    this.processOTPError(response);
                }
                this._globalLoader.setLoaderState(true);
            }, (error) => { this._globalLoader.setLoaderState(false); });
    }

    processOTPError(response)
    {
        this.invalidOTPMessage = (response['message'] as string).toLowerCase();
        this._toastService.show({ type: 'error', text: this.invalidOTPMessage });
        if (response['status'] == false && response['statusCode'] == 500 && this.invalidOTPMessage.includes('maximum')) {
            this.isOTPLimitExceeded = true;
            this.navigateToLogin();
        }
    }

    /**
     * @description to focus prceeding otp field if current otp field is valid
     * @param isValid : whether otp field control is valid or not
     * @param inputIndex : current otp field index
     */
    moveFocus(isValid, inputIndex)
    {
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
            this.timer = time > 9 ? `00:${time}` : `00:0${time}`;
        })
    }

    buildOTPForm() { for (let i = 0; i < this.OTP_FIELDS_LENGTH; i++) { this.otpForm.push(new FormControl("", [Validators.required])) } }

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
        const OTP = (this.otpForm.value as string[]).join()
        const isSingupUsingPhone = (this.authFlow.identifierType === this._sharedAuthService.AUTH_SINGUP_BY_EMAIL);
        if (isSingupUsingPhone){
            this.authFlow.data = { otp: OTP};
            this._router.navigate(['sign-up']);
            return;
        }
        const singup = this.authFlow.data;
        singup.otp = this.authFlow.data['otp'];
        this._globalLoader.setLoaderState(false);
        this._sharedAuthUtilService.signupUser(singup, this.isCheckout);
    }

    //reusable section
    navigateToLogin() { this._router.navigate([this.LOGIN_URL]) }
}
