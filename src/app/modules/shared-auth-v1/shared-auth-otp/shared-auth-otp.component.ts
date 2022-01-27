import { ToastMessageService } from './../../toastMessage/toast-message.service';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
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
    @Input("otpFormArray") otpFormArray: FormArray;
    @Input("source") source: string;
    @Input("identifier") identifier: string;
    @Input("label") label = "CONTINUE";
    @Input("initiate") initiate = true;
    @Input("withLabel") withLabel = true;
    @Output("otpEmitter") otpEmitter = new EventEmitter();
    otpFormSubscriber: Subscription = null;
    timerSubscriber: Subscription = null;
    OTP_INPUTS: HTMLCollectionOf<HTMLInputElement>;
    timer = 0;
    verifiedOTP = "";

    constructor(private _sharedAuthService: SharedAuthService, private _globalLoader: GlobalLoaderService, private _sharedAuthUtilService: SharedAuthUtilService,
        private _toasterService:ToastMessageService) { }

    ngOnInit(): void
    {
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
    }

    initiateOTP()
    {
        if (this.timer > 0) return
        const REQUEST = this._sharedAuthUtilService.getUserData(this.source);
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.sendOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] === 200) {
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
        REQUEST['otp'] = (this.otpFormArray.value as string[]).join("");
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.validateOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['status']) {
                    this.verifiedOTP = this.otpValue;
                    if(this.timerSubscriber)this.timerSubscriber.unsubscribe();
                    this.timer = 0;
                    return;
                } else if ((response['message'] as string).includes("incorrect")){
                    this._toasterService.show({ type: "error", text: response['message'] });
                    return;
                }
                this._sharedAuthUtilService.processOTPError(response);
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
        $event.stopPropagation();
        //$event.which = 8:means backspace pressed.
        if ((inputIndex >= 0) && (inputIndex - 1 > -1) && ($event.which === 8)) {
            this.OTP_INPUTS[inputIndex - 1].focus();
        }
        if (isValid && (inputIndex < this.OTP_INPUTS.length - 1)) {
            this.OTP_INPUTS[inputIndex + 1].focus();
        }
    }

    emitVerifiedOTP()
    {
        this.otpEmitter.emit(this.otpValue);
    }

    get otpValue() { return ((this.otpFormArray.value as string[]).join("")); }
    get isOTPVerified() { return (this.verifiedOTP === this.otpValue); }
    get isDisabled() { return this.otpFormArray.invalid || !(this.isOTPVerified)}

    ngOnDestroy(): void
    {
        this.otpFormArray = null;
        if (this.otpFormSubscriber) this.otpFormSubscriber.unsubscribe();
    }

}
