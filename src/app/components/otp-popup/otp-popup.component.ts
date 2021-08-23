import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { interval, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-otp-popup',
    templateUrl: './otp-popup.component.html',
    styleUrls: ['./otp-popup.component.css']
})
export class OtpPopupComponent implements OnInit, OnDestroy
{
    readonly timerLabel = "00:";
    readonly N1000 = 1000;
    readonly N46000 = 10000;
    @Input() data: any;
    @Input() verfied$: Subject<any>;
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Output() phoneValidation$: EventEmitter<any> = new EventEmitter<any>();;
    private cDistroyed = new Subject();
    otp: FormControl = new FormControl("", [Validators.pattern("[0-9]{6}")]);
    isTicking = false;
    tickerLabel = "";
    user = null;
    @Input() phone: any;
    isOTPLimitExceeded = false;
    otpErrorMessage = null;

    constructor(private _commonService: CommonService, private _localAuthService: LocalAuthService, private _tms: ToastMessageService,) { }

    ngOnInit(): void
    {
        this.executeTimer();
        this.user = this._localAuthService.getUserSession();
        //this.phone = this.data['phone'];
    }

    resendOTP()
    {
        const mobile = { device: 'mobile', email: '', phone: this.phone, type: 'p', source: 'phone_verify', userId: this.user["userId"] };
        this._commonService.sendOtp(mobile).subscribe((response) =>
        {
            if (response['statusCode'] === 200) {
                this.tickerLabel = "";
                this.executeTimer();
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
        })
    }

    validateOTP(value)
    {
        const mobile = { email: '', phone: this.phone, type: 'p', source: 'phone_verify', userId: this.user["userId"], otp: value };
        this._commonService.validateOTP(mobile).subscribe((response) =>
        {
            if (response['statusCode'] === 200) {
                this.otpErrorMessage = null;
                this.phoneValidation$.emit(true);
            } else {
                this.processOTPError(response);
            }
        })
    }

    executeTimer()
    {
        const interval$ = interval(this.N1000);
        const timer$ = timer(this.N46000);
        this.isTicking = true;
        timer$.subscribe(() => { this.isTicking = false; })
        interval$.pipe(takeUntil(timer$)).subscribe((value: number) =>
        {
            this.tickerLabel = this.timerLabel + (value > 9 ? (value + 1) : ("0" + value));
        });
    }

    processOTPError(response)
    {
        this.otpErrorMessage = (response['message'] as string).toLowerCase();
        if (response['status'] == false && response['statusCode'] == 500 && this.otpErrorMessage.includes('maximum')) {
            this.isOTPLimitExceeded = true;
        }
    }

    closeModal()
    {
        this.closePopup$.emit();
        this.phoneValidation$.emit(false);
    }

    ngOnDestroy()
    {
        this.cDistroyed.next();
        this.cDistroyed.unsubscribe();
    }
}

@NgModule({
    declarations: [OtpPopupComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class OtpPopupModule { }


