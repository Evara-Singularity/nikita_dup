import { Component, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { debounceTime, map, mergeMap  } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SharedSignUtilService } from './shared-sign-util.service';
import { CONSTANTS } from '@app/config/constants';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { CommonService } from '@app/utils/services/common.service';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { SharedAuthService } from '../shared-auth.service';
import { GlobalLoaderService } from '@services/global-loader.service';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-shared-signup',
    templateUrl: './shared-signup.component.html',
    styleUrls: ['./shared-signup.component.scss']
})
export class SharedSignupComponent implements OnInit, AfterViewInit, OnDestroy
{
    signupForm = new FormGroup({
        mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9]\d*$/)]),
        otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(/^[0-9]\d*$/)]),
        name: new FormControl('', [Validators.required]),
        email: new FormControl('', [UsernameValidator.validateEmail]),
        password: new FormControl('', [PasswordValidator.validatePassword]),
    });
    //subscribers.
    mobileSubscriber: Subscription = null;
    otpSubscriber: Subscription = null;
    emailSubscriber: Subscription = null;
    //flags
    isServer: boolean;
    isTicking = false;
    isBrowser: boolean;
    isPasswordType = true;
    isOTPLimitExceeded = false;
    isOTPValidated = false;
    isEmailExists = false;
    isSubmitted: boolean = false;
    set isReqProcessing(value) {
        this.loaderService.setLoaderState(value);
    }

    //checkout flow helpers
    @Input() isCheckoutModule: boolean = false;

    //others
    timerLabel = '00:45';
    cartSession: any;
    redirectUrl: string;
    invalidOTPMessage: string = null;

    constructor(
        private commonService: CommonService,
        private toastService: ToastMessageService,
        private localStorageService: LocalStorageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private localAuthService: LocalAuthService,
        private title: Title,
        private meta: Meta,
        private cartService: CartService,
        private signupUtilService: SharedSignUtilService,
        private authService: SharedAuthService,
        private loaderService: GlobalLoaderService,
        private checkoutLoginService: CheckoutLoginService,
    ){
        this.isServer = commonService.isServer;
        this.isBrowser = commonService.isBrowser;
    }

    ngOnInit()
    {
        this.signupUtilService.setCheckout = this.isCheckoutModule;
        this.initialize();
    }

    ngAfterViewInit() { this.enableWebOTP(); }

    initialize()
    {
        this.title.setTitle("Sign Up to Moglix");
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
        this.cartSession = this.cartService.getCartSession();
        if (this.isBrowser && this.isCheckoutModule) {
            this.signupUtilService.sendCheckoutAdobeAnalysis();
        }
        this.verifyPageInfo();
        this.addSubscribers();
        this.startOTPTimer();
    }

    verifyPageInfo()
    {
        let pageInfo = this.localAuthService.getPageInfo('signup');
        if (pageInfo) {
            this.mobile.setValue(pageInfo['mobile'] ? pageInfo['mobile'] : '');
            this.email.setValue(pageInfo['email'] ? pageInfo['email'] : '');
        } else {
            this.navigateToLogin();
        }
    }

    navigateToLogin()
    {
        if (this.isCheckoutModule) {
            this.checkoutLoginService.resetIdentifierInCheckout(true);
        } else {
            this.localAuthService.removePageInfo('signup');
            this.localAuthService.setPageInfo('login', { tab: 'SIGNUP' });
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

    addSubscribers()
    {
        this.activatedRoute.queryParams.subscribe(data =>
        {
            this.redirectUrl = data['backurl'];
            if (data['state']) {
                this.redirectUrl += '?state=' + data['state'];
            }
        }
        );
        this.mobileSubscriber = this.mobile.valueChanges.subscribe((value: string) =>
        {
            if (this.mobile.valid) {
                this.localAuthService.setPageInfo('signup', { mobile: value });
            }
        });
        this.otpSubscriber = this.otp.valueChanges.subscribe((value: string) =>
        {
            if (this.otp.valid && value.length == 6) {
                this.validateOTP();
            }
        });
        this.emailSubscriber = this.email.valueChanges.pipe(debounceTime(300)).subscribe((value: string) =>
        {
            if (this.email.value && this.email.valid) {
                this.validateEmail(value);
            }
        });
    }

    fetchOTP()
    {
        this.isReqProcessing = true;
        this.otp.setValue('');
        this.authService.getOTP(this.getUserData()).subscribe(
            (response) =>
            {
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

    validateOTP()
    {
        let requestData = this.getUserData();
        requestData['otp'] = this.otp.value;
        this.isReqProcessing = true;
        this.authService.validateOTP(requestData).subscribe(
            (response) =>
            {
                this.isReqProcessing = false;
                if (response['statusCode'] === 200 && response['status']) {
                    this.invalidOTPMessage = null;
                    this.isOTPValidated = true;
                    this.isTicking = false;
                } else {
                    this.processOTPError(response);
                }
            },
            (error) => { this.isReqProcessing = false; }
        );
    }

    validateEmail(email)
    {
        let userInfo = { email: email, phone: '', type: 'e' };
        this.isReqProcessing = true;
        this.authService.isUserExist(userInfo).subscribe(
            (response) =>
            {
                this.isReqProcessing = false;
                if (response['statusCode'] == 200) {
                    this.isEmailExists = response['exists'];
                } else {
                    this.toastService.show({ type: 'error', text: response['message'] });
                }
            },
            (error) => { this.isReqProcessing = false; }
        );
    }

    register()
    {
        this.isSubmitted = true;

        if (this.isDisabled) {
            return;
        }

        this.signupUtilService.pushNormalUser();
        let params = { source: 'signup', email: '', password: '', firstName: '', lastName: '', phone: '', otp: '', userType: 'online', phoneVerified: true, emailVerified: false, buildVersion: environment.buildVersion };
        params.email = this.email.value;
        params.password = this.password.value;
        params.firstName = this.name.value;
        params.phone = this.mobile.value;
        params.otp = this.otp.value;
        this.isReqProcessing = true;
        this.authService.signUp(params).subscribe(
            (response) =>
            {
                this.isReqProcessing = false;
                if (response['status'] !== undefined && response['status'] === 500) {
                    if (this.isCheckoutModule) {
                        this.checkoutLoginService.signUpCheckout(false);
                    } else {
                        this.toastService.show({ type: 'error', text: response['message'] });
                    }
                } else {
                    this.postSignup(params, response);
                }
            },
            (error) => { this.isReqProcessing = false; }
        );
    }

    postSignup(params, response)
    {
        this.localStorageService.clear('tocd');
        //Yogender
        this.localStorageService.store('user', response);
        if (this.isBrowser) {
            this.signupUtilService.sendCriteoDataLayerTags(response['userId'], params);
        }
        let cartSession = Object.assign(this.cartService.getCartSession());
        cartSession['cart']['userId'] = response['userId'];
        this.updateCartSession();
    }

    updateCartSession() {
        this.isReqProcessing = true;
        this.cartService.performAuthAndCartMerge({
            enableShippingCheck: this.isCheckoutModule,
            redirectUrl: this.redirectUrl,
        }).subscribe(cartSession => {
            this.isReqProcessing = false;
            if (cartSession) {
                if (this.isCheckoutModule) {
                    this.checkoutLoginService.setLoginUsingOTPStatus({
                        status: true,
                        message: 'Sign in successful'
                    })
                } else {
                    this.commonService.redirectPostAuth(this.redirectUrl);
                    this.toastService.show({ type: 'success', text: 'Signup successful' });
                }
            } else {
                this.toastService.show({ type: 'error', text: 'Something went wrong' });
            }
        });
    }

    startOTPTimer()
    {
        let otpCounter = 45;
        this.isTicking = true;
        let timerId = setInterval(() =>
        {
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

    getUserData()
    {
        let requestData = { email: '', phone: this.mobile.value, type: 'p', source: 'signup', otp: this.otp.value };
        return requestData;
    }

    processOTPError(response)
    {
        this.invalidOTPMessage = (response['message'] as string).toLowerCase();
        if (response['status'] == false && response['statusCode'] == 500 && this.invalidOTPMessage.includes('maximum')) {
            this.isOTPLimitExceeded = true;
        }
    }

    setPasswordType() { this.isPasswordType = !(this.isPasswordType); }

    get isDisabled() { return this.signupForm.invalid || this.isOTPLimitExceeded || !(this.isOTPValidated) || this.isEmailExists; }
    get canRequestOTP() { return (this.isTicking == false && this.isOTPValidated == false && this.isOTPLimitExceeded == false); }

    //getters
    get mobile() { return this.signupForm.get('mobile'); };
    get otp() { return this.signupForm.get('otp'); };
    get name() { return this.signupForm.get('name'); };
    get email() { return this.signupForm.get('email'); };
    get password() { return this.signupForm.get('password'); };

    ngOnDestroy()
    {
        if (this.mobileSubscriber) {
            this.mobileSubscriber.unsubscribe();
        }
        if (this.otpSubscriber) {
            this.otpSubscriber.unsubscribe();
        }
        if (this.emailSubscriber) {
            this.emailSubscriber.unsubscribe();
        }
    }

    termsPage()
    {
        const url = this.router.serializeUrl(
            this.router.createUrlTree(['/terms'])
        );
        window.open(url, '_blank');
    }
}
