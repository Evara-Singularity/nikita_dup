import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { Subscription, timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { AuthFlowType } from '../modals';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';

@Component({
    selector: 'shared-forgot-password',
    templateUrl: './shared-forgot-password.component.html',
    styleUrls: ['./shared-forgot-password.component.scss']
})
export class SharedForgotPasswordComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly LOGIN_URL = "/login";
    readonly OTP_URL = "/otp"
    @Input('isCheckout') isCheckout = false;
    isPasswordType = true;//to set input[type] = text/password.
    authFlow: AuthFlowType;//gives flowtype & identifier information
    OTP_INPUTS: HTMLCollectionOf<HTMLInputElement>;//No of otp fields
    timer = 0;//otp timer
    verifiedOTP = "";//to save verified otp + in template number verified or not
    otpFormSubscriber: Subscription = null;

    fpForm = new FormGroup({
        otpForm: new FormArray([]),
        password: new FormControl("", [Validators.required, PasswordValidator.validatePassword])
    })

    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService, private _checkoutLoginService: CheckoutLoginService
    ) { }


    ngOnInit()
    {
        debugger;
        this.authFlow = this._sharedAuthUtilService.getAuthFlow();
        if (!this.authFlow) { this.navigateTo(this.LOGIN_URL); return; }
        this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
    }

    ngAfterViewInit()
    {
        this.OTP_INPUTS = (document.getElementsByClassName("pseudo") as HTMLCollectionOf<HTMLInputElement>);
        this.initiateOTP();
        this.enableWebOTP();
        this.addSubscribers();
    }

    addSubscribers()
    {
        this.otpFormSubscriber = this.otpForm.valueChanges.subscribe((value) =>
        {
            if (this.otpForm.valid) { this.validateOTP(); }
        })
    }

    initiateOTP()
    {
        const REQUEST = this._sharedAuthUtilService.getUserData("forgot_password");
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.sendOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] !== 200) {
                    this._sharedAuthUtilService.processOTPError(response);
                    this.navigateTo(this.OTP_URL);
                    return;
                }
                this.startOTPTimer();
            },
            (error) => { this._globalLoader.setLoaderState(false); },
        )
    }

    validateOTP()
    {
        const REQUEST = this._sharedAuthUtilService.getUserData("forgot_password");
        REQUEST['otp'] = this.otpValue;
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.validateOTP(REQUEST).subscribe(
            (response) =>
            {
                if (response['status']) {
                    this.verifiedOTP = this.otpValue;
                    return;
                }
                this._sharedAuthUtilService.processOTPError(response);
            }, (error) => this._globalLoader.setLoaderState(false));
    }

    updatePassword()
    {
        const REQUEST = this._sharedAuthUtilService.getUserData("forgot_password");
        REQUEST['oldPassword'] = '';
        REQUEST['newPassword'] = this.password.value;
        this._sharedAuthService.updatePassword(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false)
                if (response['statusCode'] == 200) {
                    this._toastService.show({ type: 'success', text: response['message'] });
                    //@checkout flow need to integrated here
                    if (this.isCheckout) {
                        this._checkoutLoginService.setPasswordResetStatus({
                            status: true, message: 'Password reset successfully. Please login to proceed',
                        })
                    } else {
                        this.navigateTo(this.LOGIN_URL);
                    }
                } else {
                    this._toastService.show({ type: 'error', text: response['message'] });
                }
            }, (error) => this._globalLoader.setLoaderState(false));
    }

    //NOTE:this optional and expected to work for autofill of otp.
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

    /** @description to handle otp timer*/
    startOTPTimer()
    {
        this.verifiedOTP = "";
        timer(0, 1000).pipe(scan(acc => --acc, 21), takeWhile(x => x >= 0)).subscribe((time) =>
        {
            this.timer = time;
        })
    }

    navigateTo(link) { this._router.navigate([link]); }
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }

    get isOTPVerified() { return (this.verifiedOTP === this.otpValue) && (this.timer === 0); }
    get disableContinue() { return this.verifiedOTP && this.fpForm.valid }
    get otpValue() { return ((this.otpForm.value as string[]).join("")); }
    get otpForm() { return (this.fpForm.get("otpForm") as FormArray) }
    get password() { return this.fpForm.get("password") }


    ngOnDestroy(): void
    {
        if (this.otpFormSubscriber)
            this.otpFormSubscriber.unsubscribe;
    }

}
