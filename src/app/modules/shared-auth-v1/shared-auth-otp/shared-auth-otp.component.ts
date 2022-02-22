import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { environment } from 'environments/environment';
import { Subscription, timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';

@Component({
    selector: 'shared-auth-otp',
    templateUrl: './shared-auth-otp.component.html',
    styleUrls: ['./shared-auth-otp.component.scss']
})
export class SharedAuthOtpComponent implements OnInit, AfterViewInit, OnDestroy
{
    @Input("otpFormArray") otpFormArray: FormArray;//to capture otp fields
    @Input("source") source: string;//to request for otp as per screens(login=login, sign-up=signup, forgotpassword=forgot_password)
    @Input("identifier") identifier: string;//mobile number
    @Input("label") label = "CONTINUE";//CTA label with default value
    @Input("initiate") initiate = true;//decides whether OTP is send on initialization
    @Input("withLabel") withLabel = true;//whether to display CTA or not & accordingly emits verified otp(forgot passowrd screen)
    @Input("isForgotPassword") isForgotPassword = false;//Whether forgotpassword screen or not and manages the css accordingly.
    @Input('isCheckout') isCheckout = false;
    @Output("otpEmitter") otpEmitter = new EventEmitter();//Emits otp value accordingly
    otpFormSubscriber: Subscription = null;
    timerSubscriber: Subscription = null;
    OTP_INPUTS: HTMLCollectionOf<HTMLInputElement>;
    timer = 0;
    verifiedOTP = "";
    incorrectOTP = null;
    authFlow: AuthFlowType;//important:gives information on OTP journey
    isOTPClean: boolean = true;

    constructor(private _sharedAuthService: SharedAuthService, private _globalLoader: GlobalLoaderService, private _localAuthService: LocalAuthService,
        private _router: Router, private _toastService: ToastMessageService) { }

    ngOnInit(): void
    {
        this.authFlow = this._localAuthService.getAuthFlow();
        if (this.initiate) {
            this.initiateOTP();
        }
    }

    ngAfterViewInit(): void
    {
        this.otpFormSubscriber = this.otpFormArray.valueChanges.subscribe((value) =>
        {
            if (this.otpFormArray.valid) { this.validateOTP(); }
        });
        this.OTP_INPUTS = (document.getElementsByClassName("pseudo") as HTMLCollectionOf<HTMLInputElement>);
        this.OTP_INPUTS[0].focus();
        this.enableWebOTP();
    }

    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event)
    {
        this._localAuthService.clearAuthFlow();
    }

    initiateOTP(isResend?)
    {

        const REQUEST = this.getUserData();
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.sendOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] === 200) {
                    if (isResend) {
                        const MESSAGE = this.isEmailLogin ? "OTP resent to the mentioned email & associated mobile number" : "OTP resent to the mentioned mobile number";
                        this._toastService.show({ type: "success", text: MESSAGE });
                    }
                    this.startOTPTimer();
                    return;
                }
                this.processOTPError(response);
            },
            (error) => { this._globalLoader.setLoaderState(false); },
        )
    }

    validateOTP()
    {
        const REQUEST = this.getUserData();
        REQUEST['otp'] = (this.otpFormArray.value as string[]).join("");
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.validateOTP(REQUEST).subscribe(
            (response) =>
            {

                if (response['status']) {
                    this.verifiedOTP = this.otpValue;
                    this.incorrectOTP = null;
                    this.timer = 0;
                    if (this.timerSubscriber) this.timerSubscriber.unsubscribe();
                    this._globalLoader.setLoaderState(false);
                    if (!(this.withLabel)) { setTimeout(() => { this.otpEmitter.emit(this.otpValue); }, 200) };
                    return;
                } else if ((response['message'] as string).includes("incorrect")) {
                    this.incorrectOTP = "OTP is not correct";
                    this._globalLoader.setLoaderState(false);
                    return;
                }
                this.processOTPError(response);
            }, (error) => { this._globalLoader.setLoaderState(false); });
    }

    startOTPTimer()
    {
        this.timerSubscriber = timer(0, 1000).pipe(scan(acc => --acc, 21), takeWhile(x => x >= 0)).subscribe((time) =>
        {
            this.timer = time;
        })
    }

    moveFocus($event, isValid, inputIndex)
    {
        this.isOTPClean = false;
        $event.stopPropagation();
        //$event.which = 8:means backspace pressed.
        if ((inputIndex >= 0) && (inputIndex - 1 > -1) && ($event.which === 8)) {
            this.OTP_INPUTS[inputIndex - 1].focus();
        }
        if (isValid && (inputIndex < this.OTP_INPUTS.length - 1)) {
            this.OTP_INPUTS[inputIndex + 1].focus();
        }
    }

    onPaste(event: ClipboardEvent, inputIndex)
    {
        let clipboardData = event.clipboardData || window['clipboardData'] || '';
        let pastedText = (clipboardData) ? clipboardData.getData('text') : '';
        const isPasteTextValid = pastedText && pastedText.length == 6 && !isNaN(pastedText);
        if (isPasteTextValid) {
            for (let index = 0; index < 6; index++) {
                this.OTP_INPUTS[index].value = pastedText[index];
            }
            this.otpEmitter.emit(pastedText);
        }
    }

    emitVerifiedOTP()
    {
        if (this.isDisabled) return;
        this.otpEmitter.emit(this.otpValue);
    }

    processOTPError(response)
    {
        const invalidOTPMessage = (response['message'] as string).toLowerCase();
        this._toastService.show({ type: 'error', text: invalidOTPMessage });
        this._router.navigate(["/login"]);
    }

    getUserData()
    {
        let requestData = { email: '', phone: '', type: "p", source: this.source, buildVersion: environment.buildVersion };
        if (this.authFlow.flowType.includes("SIGNUP") || this.authFlow.identifierType.includes("PHONE")) {
            requestData['phone'] = this.identifier;
        }
        else {
            requestData['email'] = this.identifier;
            requestData['type'] = "e";
        }
        return requestData;
    }

    resendOTP()
    {
        if (this.disableResend) return
        this.otpFormArray.controls.forEach((control: FormControl) => control.patchValue(""));
        this.initiateOTP(true);
    }

    //NOTE:Below method is to autofill OTP in andriod
    enableWebOTP()
    {
        if (typeof window !== 'undefined' && 'OTPCredential' in window) {
            window.addEventListener('DOMContentLoaded', e =>
            {
                const ac = new AbortController();
                var reqObj = { otp: { transport: ['sms'] }, signal: ac.signal };
                navigator.credentials.get(reqObj).then(otp =>
                {
                    if (otp && otp['code']) {
                        const OTPS = (otp['code'] as string).split("");
                        OTPS.forEach((value, index) => { this.otpFormArray.controls[index].patchValue(value) })
                    }
                }).catch(err => { console.log(err) });
            })
        } else {
            console.log('WebOTP not supported!.');
        }
    }

    get otpValue() { return ((this.otpFormArray.value as string[]).join("")); }
    get isOTPVerified() { return (this.otpValue.length > 0) && (this.verifiedOTP === this.otpValue); }
    get isDisabled() { return this.otpFormArray.invalid || !(this.isOTPVerified) }
    get isOTPFormDisabled() { return (this.otpFormArray.invalid) || (this.incorrectOTP != null) }
    get isEmailLogin() { return this.authFlow && this.authFlow.identifier.includes("@") }
    get disableResend() { return this.timer > 0 || this.isOTPVerified }

    ngOnDestroy(): void
    {
        this.otpFormArray = null;
        if (this.otpFormSubscriber) this.otpFormSubscriber.unsubscribe();
    }
}
