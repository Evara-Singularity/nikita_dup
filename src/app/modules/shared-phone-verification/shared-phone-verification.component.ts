import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
	selector: 'shared-phone-verification',
	templateUrl: './shared-phone-verification.component.html',
	styleUrls: ['./shared-phone-verification.component.scss']
})
export class SharedPhoneVerificationComponent implements OnInit, OnDestroy
{
	readonly timerLabel = "00:";
	readonly N1000 = 1000;
	readonly N46000 = 46000;
	@Input("displayPopup") displayPopup = false;
	@Input() phone: any;
	@Input() buttonLabel = "CONTINUE";
	@Input() source = "address";
	@Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
	@Output() phoneValidation$: EventEmitter<any> = new EventEmitter<any>();
	private cDistroyed = new Subject();
	otp: FormControl = new FormControl("", [Validators.required, Validators.pattern("[0-9]{6}")]);
	isTicking = false;
	tickerLabel = null;
	user = null;
	isOTPLimitExceeded = false;
	otpErrorMessage = null;
	isPhoneVerfied = false;

	constructor(private _commonService: CommonService, private _localAuthService: LocalAuthService, private _tms: ToastMessageService,) { }

	ngOnInit(): void
	{
		this.executeTimer();
		this.user = this._localAuthService.getUserSession();
	}

	sendOTP()
	{
		this.otp.reset();
		const request = { device: 'mobile', email: '', phone: this.phone, type: 'p', source: this.source, userId: this.user["userId"] };
		this._commonService.sendOtp(request).subscribe((response) =>
		{
			if (response['statusCode'] === 200) {
				this.executeTimer();
			} else {
				this._tms.show({ type: 'error', text: response['message'] });
			}
		})
	}

	validateOTP(value)
	{
		const mobile = { email: '', phone: this.phone, type: 'p', source: this.source, userId: this.user["userId"], otp: value };
		this._commonService.validateOTP(mobile).pipe(debounceTime(2000)).subscribe((response) =>
		{
			if (response['statusCode'] === 200) {
				this.otpErrorMessage = null;
				this.isPhoneVerfied = true;
				this.closePopup$.emit();
				this.phoneValidation$.emit(this.phone);
			} else {
				this.processOTPError(response);
			}
		})
	}

	executeTimer()
	{
		let otpCounter = 45;
		this.tickerLabel = `${this.timerLabel}${otpCounter}`;
		this.isTicking = true;
		let timerId = setInterval(() =>
		{
			if (otpCounter < 1) {
				this.isTicking = false;
				this.tickerLabel = `${this.timerLabel}00`;
				clearTimeout(timerId);
				return;
			} else {
				otpCounter -= 1;
				this.tickerLabel = `${this.timerLabel}${(otpCounter > 9 ? (otpCounter + 1) : ("0" + otpCounter))}`;
			}
		}, 1000);
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
		this.phoneValidation$.emit(null);
	}

	checkNumeric(event) { return event.charCode >= 48 && event.charCode <= 57; }

	togglePopUp(){console.log("")}

	ngOnDestroy()
	{
		this.cDistroyed.next();
		this.cDistroyed.unsubscribe();
	}

}
