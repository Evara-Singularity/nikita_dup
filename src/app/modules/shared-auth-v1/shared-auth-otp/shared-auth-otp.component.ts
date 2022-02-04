import { AuthFlowType } from './../modals';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Subscription, timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

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
    paramsSubscriber: Subscription = null;

    constructor(
        private _sharedAuthService: SharedAuthService, 
        private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, 
        private _router: Router, 
        private _toastService: ToastMessageService,
        private _route: ActivatedRoute,
        ) { }

    ngOnInit(): void
    {
        this.authFlow = this._sharedAuthUtilService.getAuthFlow();
        if (this.initiate) {
            this.initiateOTP();
        }
        this.addQueryParamSubscribers();
    }

    ngAfterViewInit(): void
    {
        this.otpFormSubscriber = this.otpFormArray.valueChanges.subscribe((value) =>
        {
            if (this.otpFormArray.valid) { this.validateOTP(); }
        });
        this.OTP_INPUTS = (document.getElementsByClassName("pseudo") as HTMLCollectionOf<HTMLInputElement>);
        this.OTP_INPUTS[0].focus();
    }

    addQueryParamSubscribers() {
        this.paramsSubscriber = this._route.queryParams.subscribe(data => {
            this._sharedAuthService.redirectUrl = data['backurl'];
            if (data['state']) {
                this._sharedAuthService.redirectUrl += '?state=' + data['state'];
            }
        });
    }

    initiateOTP()
    {
        if (this.timer > 0) return
        const REQUEST = this.getUserData();
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.sendOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] === 200) {
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
                this._globalLoader.setLoaderState(false);
                if (response['status']) {
                    this.verifiedOTP = this.otpValue;
                    this.incorrectOTP = null;
                    if (this.timerSubscriber) this.timerSubscriber.unsubscribe();
                    this.timer = 0;
                    //Below is for only forgot-password case becoz "CONTINUE" CTA will not be there.
                    if (!(this.withLabel)) { this.otpEmitter.emit(this.otpValue); }
                    return;
                } else if ((response['message'] as string).includes("incorrect")) {
                    this.incorrectOTP = "OTP is not correct";
                    //Below is for only forgot-password case becoz "CONTINUE" CTA will not be there.
                    if (!(this.withLabel)) { this.otpEmitter.emit(""); }
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

    emitVerifiedOTP() { 
        if(this.isDisabled)return;
        this.otpEmitter.emit(this.otpValue); 
    }

    processOTPError(response)
    {
        const invalidOTPMessage = (response['message'] as string).toLowerCase();
        this._toastService.show({ type: 'error', text: invalidOTPMessage });
        let navigationExtras: NavigationExtras = {
            queryParams: { 'backurl': this._sharedAuthService.redirectUrl },
        };
        this._router.navigate(["/login"], navigationExtras);
    }

    getUserData()
    {
        let requestData = { email: '', phone: '', type: "p", source: this.source };
        if (this.authFlow.flowType.includes("SIGNUP") || this.authFlow.identifierType.includes("PHONE")) {
            requestData['phone'] = this.identifier;
        }
        else {
            requestData['email'] = this.identifier;
            requestData['type'] = "e";
        }
        return requestData;
    }

    //NOTE:Below method is to autofill OTP in andriod
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
                        OTPS.forEach((value, index) => { this.otpFormArray.controls[index].patchValue(value) })
                    }
                }).catch(err => { console.log(err); });
            }
        }
    }

    get otpValue() { return ((this.otpFormArray.value as string[]).join("")); }
    get isOTPVerified() { return (this.otpValue.length > 0) && (this.verifiedOTP === this.otpValue); }
    get isDisabled() { return this.otpFormArray.invalid || !(this.isOTPVerified) }
    get isOTPFormDiabled() { return (this.otpFormArray.invalid) || (this.incorrectOTP != null) }

    ngOnDestroy(): void
    {
        this.otpFormArray = null;
        if (this.otpFormSubscriber) this.otpFormSubscriber.unsubscribe();
    }
}
