import { Component, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import CONSTANTS from '../../../config/constants';
import { PasswordValidator } from '../../../utils/validators/password.validator';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { SharedAuthService } from '../shared-auth.service';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';

@Component({
    selector: 'app-shared-forgot-password',
    templateUrl: './shared-forgot-password.component.html',
    styleUrls: ['./shared-forgot-password.component.scss']
})
export class SharedForgotPasswordComponent implements OnInit, AfterViewInit, OnDestroy {
    //inputs
    @Input() isCheckoutModule: boolean = false;

    //form
    forgotPasswordForm = new FormGroup({
        username: new FormControl('', [Validators.required]),
        otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(/^[0-9]\d*$/)]),
        password: new FormControl('', [PasswordValidator.validatePassword])
    });
    //subscribers
    usernameSubscriber: Subscription = null;
    otpSubscriber: Subscription = null;
    //flags
    isTicking = false;
    isOTPLimitExceeded = false;
    isOTPValidated = false;
    isPasswordType = true;
    //others
    timerLabel = '00:45';
    invalidOTPMessage: string = null;
    usernameType = 'p';
    cartSession = null;
    isSubmitted: boolean = false;
    set isReqProcessing(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(
        private meta: Meta,
        private title: Title,
        private router: Router,
        private localAuthService: LocalAuthService,
        private authService: SharedAuthService,
        private toastService: ToastMessageService,
        private loaderService: GlobalLoaderService,
        //private checkoutLoginService: CheckoutLoginService
    ) { }

    ngOnInit() { this.initialize(); }

    ngAfterViewInit() { this.enableWebOTP(); }

    initialize() {
        this.title.setTitle("Sign In to Moglix");
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
        this.verifyPageInfo();
        this.addSubscribers();
    }

    verifyPageInfo() {
        let pageInfo = this.localAuthService.getPageInfo('login');
        if (pageInfo) {
            this.username.setValue(pageInfo['username']);
            this.startOTPTimer();
        } else {
            this.localAuthService.setPageInfo('login', { tab: 'LOGIN', username: '' });
            this.router.navigate(['login']);
        }
    }

    enableWebOTP()
    {
        if (typeof window !== 'undefined') {
            if ('OTPCredential' in window) {
                const ac = new AbortController();
                var reqObj = { otp: { transport: ['sms'] }, signal: ac.signal };
                navigator.credentials.get(reqObj).then((otp: any) =>
                {
                    if (otp && otp.code) {
                        this.otp.setValue(otp.code)
                    }
                }).catch(err => { console.log(err); });
            } 
        }
    }

    addSubscribers() {
        this.usernameSubscriber = this.username.valueChanges.subscribe((value: string) => {
            this.usernameType = (value && value.indexOf('@')) > -1 ? 'e' : 'p';
        });
        this.otpSubscriber = this.otp.valueChanges.subscribe((value: string) => {
          if (this.otp.value.length == 6) {
                this.validateOTP();
            }
        });
    }

    onEdit() {
        if (this.isCheckoutModule) {
            //this.checkoutLoginService.resetIdentifierInCheckout(true);
        } else {
            this.localAuthService.setPageInfo('login', { tab: 'LOGIN', username: this.username.value });
            this.router.navigate(['login'])
        }
    }

    fetchOTP() {
        this.isReqProcessing = true;
        this.otp.setValue('');
        this.authService.getOTP(this.getUserData()).subscribe(
            (response) => {
                this.isReqProcessing = false;
                if (response['statusCode'] === 200) {
                    this.invalidOTPMessage = null;
                    this.startOTPTimer();
                } else {
                    this.processOTPError(response);
                }
            },
            (error) => { this.isReqProcessing = false; },
        );
    }

    validateOTP() {

        let requestData = this.getUserData();
        requestData['otp'] = this.otp.value;
        this.isReqProcessing = true;
        this.authService.validateOTP(requestData).subscribe(
            (response) => {
                console.log('validateOTP response', response);
                this.isReqProcessing = false;
                if (response['statusCode'] === 200 && response['status']) {
                    this.invalidOTPMessage = null
                    this.isOTPValidated = true;
                    this.isTicking = false;
                } else {
                    this.processOTPError(response);
                }
            }, (error) => {
                this.isReqProcessing = false;
            });
    }

    updatePassword() {
        this.isSubmitted = true;
        if (this.otp.invalid || this.password.invalid){
           return
        }
        let requestData = this.getUserData();
        requestData['otp'] = this.otp.value;
        requestData['oldPassword'] = '';
        requestData['newPassword'] = this.password.value;
        this.isReqProcessing = true;
        this.authService.updatePassword(requestData).subscribe(
            (response) => {
                this.isReqProcessing = false;
                if (response['statusCode'] == 200) {
                    this.toastService.show({ type: 'success', text: response['message'] });
                    //@checkout flow need to integrated here
                    if (this.isCheckoutModule) {
                        // this.checkoutLoginService.setPasswordResetStatus({
                        //     status: true,
                        //     message: 'Password reset successfully. Please login to proceed',
                        // })
                    } else {
                        this.router.navigate(['/login']);
                    }
                } else{
                    this.toastService.show({ type: 'error', text: response['message'] });
                }
            },
            (error) => { this.isReqProcessing = false; },
        );
    }

    startOTPTimer() {
        let otpCounter = 45;
        this.isTicking = true;
        let timerId = setInterval(() => {
            if (otpCounter < 1) {
                this.isTicking = false;
                this.timerLabel = '00:45';
                clearTimeout(timerId);
                return;
            } else {
                otpCounter -= 1;
                this.timerLabel = otpCounter < 10 ? ('00:0' + otpCounter) : ('00:' + otpCounter);
            }
        }, 1000);
    }

    getUserData() {
        let requestData = { email: '', phone: '', type: this.usernameType, source: 'forgot_password' };
        this.usernameType = (this.username.value && this.username.value.indexOf('@')) > -1 ? 'e' : 'p';
        (this.usernameType == 'e') ? requestData.email = this.username.value : requestData.phone = this.username.value;
        return requestData;
    }

    processOTPError(response) {
        this.invalidOTPMessage = (response['message'] as string).toLowerCase();
        if (response['status'] == false && response['statusCode'] == 500 && this.invalidOTPMessage.includes('maximum')) {
            this.isOTPLimitExceeded = true;
        }
    }

    //getter
    get username() { return this.forgotPasswordForm.get('username'); }
    get otp() { return this.forgotPasswordForm.get('otp'); }
    get password() { return this.forgotPasswordForm.get('password'); }
    get isDisabled() { return this.forgotPasswordForm.invalid || this.isOTPLimitExceeded || !(this.isOTPValidated); }
    get canRequestOTP() { return (this.isTicking == false && this.isOTPValidated == false && this.isOTPLimitExceeded == false); }
    setPasswordType() { this.isPasswordType = !(this.isPasswordType) }

    ngOnDestroy() {
        if (this.usernameSubscriber) {
            this.usernameSubscriber.unsubscribe();
        }
        if (this.otpSubscriber) {
            this.otpSubscriber.unsubscribe();
        }
    }
}

