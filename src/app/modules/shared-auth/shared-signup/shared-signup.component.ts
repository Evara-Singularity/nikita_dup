import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { Subscription } from 'rxjs/Subscription';
import { SharedSignUtilService } from './shared-sign-util.service';
import { debounceTime } from 'rxjs/operators';
import CONSTANTS from '@app/config/constants';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { CommonService } from '@app/utils/services/common.service';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { SharedAuthService } from '../shared-auth.service';
import { GlobalLoaderService } from 'src/app/utils/services/global-loader.service';

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
        private meta: Meta, @Inject(PLATFORM_ID) platformId,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private localAuthService: LocalAuthService,
        private title: Title,
        private cartService: CartService,
        private signupUtilService: SharedSignUtilService,
        private authService: SharedAuthService,
        private loaderService: GlobalLoaderService
    ){
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
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
            //this.checkoutLoginService.resetIdentifierInCheckout(true);
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
        let params = { source: 'signup', email: '', password: '', firstName: '', lastName: '', phone: '', otp: '', userType: 'online', phoneVerified: true, emailVerified: false, buildVersion: '1.1' };
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
                        //this.checkoutLoginService.signUpCheckout(false);
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
        this.updateCartSessionByUserId(cartSession);
    }

    updateCartSessionByUserId(cartSession)
    {
        const userSession = this.localAuthService.getUserSession();
        cartSession['cart']['userId'] = userSession.userId;
        this.cartService.getSessionByUserId(cartSession)
            .pipe(
                mergeMap((cartSession: any) =>
                {
                    if (this.cartService.buyNow) {
                        const cartId = cartSession['cart']['cartId'];
                        cartSession = this.cartService.buyNowSessionDetails;
                        cartSession['cart']['cartId'] = cartId;
                        cartSession['itemsList'][0]['cartId'] = cartId;
                    }
                    let sro = this.cartService.getShippingObj(cartSession);
                    return this.cartService.getShippingValue(sro)
                        .pipe(
                            map((sv: any) =>
                            {
                                if (sv && sv['status'] && sv['statusCode'] == 200) {
                                    cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                                    if (sv['data']['totalShippingAmount'] != undefined && sv['data']['totalShippingAmount'] != null) {
                                        let itemsList = cartSession['itemsList'];
                                        for (let i = 0; i < itemsList.length; i++) {
                                            cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                                        }
                                    }
                                }
                                return cartSession;
                            })
                        );
                })
            )
            .subscribe((res) =>
            {
                if (res.statusCode != undefined && res.statusCode == 200) {
                    // update cart with items after merging items
                    const cs = this.cartService.updateCart(res);
                    this.cartService.setCartSession(cs);
                    this.cartService.orderSummary.next(res);
                    this.cartService.cart.next(res.noOfItems);

                    if (this.isCheckoutModule) {
                        // incase of checkout module only we need to check buynow flow
                        if (this.cartService.buyNow) {
                            const sessionDetails = this.cartService.getCartSession();
                            sessionDetails['cart']['userId'] = userSession.userId;
                            this.isReqProcessing = true;
                            this.cartService.updateCartSessions(null, sessionDetails).subscribe((data) =>
                            {
                                this.localAuthService.login$.next(this.router.url);
                                data['userId'] = userSession.userId;
                                this.cartService.setCartSession(data);
                                this.cartService.orderSummary.next(data);
                                this.cartService.cart.next(data.noOfItems);
                                this.localAuthService.login$.next(this.redirectUrl);
                                //this.checkoutLoginService.signUpCheckout(true);
                                this.isReqProcessing = false;
                            });
                        } else {
                            // without buynow flow in checkout module
                            this.localAuthService.login$.next(this.redirectUrl);
                            //this.checkoutLoginService.signUpCheckout(true);
                        }
                    } else {
                        // normal sign up flow
                        this.localAuthService.login$.next(this.redirectUrl);
                        let routeData = this.commonService.getRouteData();
                        console.log('shared signup without checkout', routeData);
                        if (this.redirectUrl) {
                            this.redirectCheck(this.redirectUrl);
                        }
                        else if (routeData['previousUrl'] && routeData['previousUrl'] == '/') {
                            this.redirectCheck('/');
                        } else if (routeData['previousUrl'] && routeData['previousUrl'] != '' && routeData['previousUrl'] != '/login') {
                            this.redirectCheck(routeData['previousUrl']);
                        } else if (routeData['currentUrl'] && routeData['currentUrl'] != '' && routeData['currentUrl'] != '/login') {
                            this.redirectCheck(routeData['currentUrl']);
                        } else {
                            this.redirectCheck('/');
                        }
                        this.toastService.show({ type: 'success', text: 'Signup successful' });
                    }

                }
            });
    }

    redirectCheck(url: string)
    {
        const exceptUrl = ['login', 'otp', 'forgot-password', 'sign-up']
        let contains = false;
        exceptUrl.forEach(element =>
        {
            if (url.indexOf(element) !== -1) {
                contains = true;
            }
        });
        if (contains) {
            this.router.navigateByUrl('/');
        } else {
            this.router.navigateByUrl(url);
        }
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
