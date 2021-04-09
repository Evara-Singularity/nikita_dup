import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { SharedOtpUtilService } from './shared-otp-util.service';
import CONSTANTS from '../../../config/constants';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { CartService } from '../../../utils/services/cart.service';
import { CommonService } from '../../../utils/services/common.service';
import { SharedAuthService } from '../shared-auth.service';

@Component({
    selector: 'app-shared-otp',
    templateUrl: './shared-otp.component.html',
    styleUrls: ['./shared-otp.component.scss']
})
export class SharedOtpComponent implements OnInit, AfterViewInit, OnDestroy {
    //inputs
    @Input() isCheckoutModule: boolean = false;
    //form
    otpForm = new FormGroup({
        username: new FormControl('', [Validators.required]),
        otp: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(/^[0-9]\d*$/)])
    });
    //subscribers
    usernameSubscriber: Subscription = null;
    otpSubscriber: Subscription = null;
    paramsSubscriber: Subscription = null;
    //flags
    isReqProcessing = false;
    isTicking = false;
    isOTPLimitExceeded = false;
    isOTPValidated = false;
    isBrowser = true;
    //others
    usernameType = 'p';
    timerLabel = '00:45';
    invalidOTPMessage: string = null;
    redirectUrl = '';
    isSubmitted: boolean = false;
    cartSession = null;
    @ViewChild('otpField') otpField: ElementRef<HTMLInputElement>;

    constructor(
        private title: Title,
        private meta: Meta,
        private router: Router,
        private localAuthService: LocalAuthService,
        private otpUtilService: SharedOtpUtilService,
        private toastService: ToastMessageService,
        @Inject(PLATFORM_ID) platformId,
        private cartService: CartService,
        private commonService: CommonService,
        private activatedRoute: ActivatedRoute,
        private authService: SharedAuthService,
        //private checkoutLoginService: CheckoutLoginService
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() { 
        this.initialize(); 
        
    }

    ngAfterViewInit(){
        this.enableWebOTP();
    }

    initialize() {
        this.title.setTitle("Sign In to Moglix");
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
        this.verifyPageInfo();
        this.cartSession = this.cartService.getCartSession();
        if(this.isBrowser){
            (this.isCheckoutModule) ? this.otpUtilService.sendCheckoutAdobeAnalysis() : this.otpUtilService.sendAdobeAnalysis();
        }
        this.addSubscribers();
    }

    verifyPageInfo() {
        let pageInfo = this.localAuthService.getPageInfo('login');
        if (pageInfo) {
            this.username.setValue(pageInfo['username']);
            this.usernameType = (pageInfo['username'] && pageInfo['username'].indexOf('@')) > -1 ? 'e' : 'p';
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
           if (this.otp.value.length == 6){
                console.log("calle One");
                this.validateOTP();
            }
        });
        this.paramsSubscriber = this.activatedRoute.queryParams.subscribe(data => {
            this.redirectUrl = data['backurl'];
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
        this.otpField.nativeElement.blur();
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
        console.log('requestData', requestData); 
        this.authService.validateOTP(requestData).subscribe(
            (response) => {
                this.isReqProcessing = false;
                if (response['statusCode'] === 200 && response['status']) {
                    this.isOTPValidated = true;
                    this.invalidOTPMessage = null;
                    this.isTicking = false;
                } else {
                    this.processOTPError(response);
                }
            }, (error) => {
                console.log('shared otp valid otp error', error);
            });
    }

    
    authenticate() {
        console.log('authenticate', 'called');
        this.isSubmitted = true;
        let requestData = this.getUserData();
        requestData['otp'] = this.otp.value;
        this.cartSession = this.cartService.getCartSession();
        this.isReqProcessing = true;
        requestData['buildVersion'] = '1.1';
        this.authService.authenticate(requestData).subscribe(
            (response) => {
                if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                    // no toast required 
                    // this.toastService.show({ type: 'error', text: response['status'] });
                } else {
                    this.processAuthentication(response);
                }
                this.isReqProcessing = false;
            },
            (error) => { this.isReqProcessing = false; }
        )
    }

    processAuthentication(response) {
        console.log('processAuthentication', response);
        this.localAuthService.setUserSession(response);
        if (this.isBrowser) {
            this.otpUtilService.sendCriteoLayerTags(response);//ATUL
        }
        let cartSession = Object.assign(this.cartService.getCartSession());
        cartSession['cart']['userId'] = response['userId'];
        this.updateCartSession(cartSession);
    }

    updateCartSession(cartSession) {
        const userSession = this.localAuthService.getUserSession();
        cartSession['cart']['userId'] = userSession.userId;
        this.cartService.getSessionByUserId(cartSession)
            .pipe(
                mergeMap((cartSession: any) => {
                    if (this.cartService.buyNow) {
                        const cartId = cartSession['cart']['cartId'];
                        cartSession = this.cartService.buyNowSessionDetails;
                        cartSession['cart']['cartId'] = cartId;
                        cartSession['itemsList'][0]['cartId'] = cartId;
                    }
                    let sro = this.cartService.getShippingObj(cartSession);
                    return this.cartService.getShippingValue(sro)
                        .pipe(
                            map((sv: any) => {
                                if (sv && sv['status'] && sv['statusCode'] === 200) {
                                    cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                                    if (sv['data']['totalShippingAmount'] !== undefined && sv['data']['totalShippingAmount'] !== null) {
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
            .subscribe((res) => {
                if (res.statusCode !== undefined && res.statusCode === 200) {

                    const cs = this.cartService.updateCart(res);
                    this.cartService.setCartSession(cs);
                    this.cartService.orderSummary.next(res);
                    this.cartService.cart.next(res.noOfItems);

                    if (this.isCheckoutModule) {
                        // incase of checkout module only we need to check buynow flow
                        if (this.cartService.buyNow) {
                            console.log('shared otp with checkout buynow', 'called');
                            const sessionDetails = this.cartService.getCartSession();
                            sessionDetails['cart']['userId'] = userSession.userId;
                            this.isReqProcessing = true;
                            this.cartService.updateCartSessions(null, sessionDetails).subscribe((data) => {
                                console.log('shared otp buyNow', data);
                                this.localAuthService.login$.next(this.router.url);
                                data['userId'] = userSession.userId;
                                this.cartService.setCartSession(data);
                                this.cartService.orderSummary.next(data);
                                this.cartService.cart.next(data.noOfItems);
                                this.localAuthService.login$.next(this.redirectUrl);
                                this.isReqProcessing = false;
                                // this.checkoutLoginService.setLoginUsingOTPStatus({
                                //     status: true,
                                //     message: 'Sign in successfull'
                                // })
                            });
                        } else {
                            // without buynow flow in checkout module
                            console.log('shared otp with checkout without buynow', 'called');
                            this.localAuthService.login$.next(this.redirectUrl);
                            // this.checkoutLoginService.setLoginUsingOTPStatus({
                            //     status: true,
                            //     message: 'Sign in successfull'
                            // })
                        }
                    } else {
                        // normal sign up flow
                        let routeData = this.commonService.getRouteData();
                        console.log('shared otp without checkout', routeData);
                        if (routeData['previousUrl'] && routeData['previousUrl'] == '/') {
                            this.redirectCheck('/');
                        } else if (routeData['previousUrl'] && routeData['previousUrl'] != '' && routeData['previousUrl'] != '/login') {
                            this.redirectCheck(routeData['previousUrl']);
                        } else if (routeData['currentUrl'] && routeData['currentUrl'] != '' && routeData['currentUrl'] != '/login') {
                            this.redirectCheck(routeData['currentUrl']);
                        } else {
                            this.redirectCheck('/');
                        }
                        this.localAuthService.login$.next(this.redirectUrl);
                        this.toastService.show({ type: 'success', text: 'Sign in successful' });
                        
                    }

                }
            });
    }

    redirectCheck(url: string) {
        const exceptUrl = ['login', 'otp', 'forgot-password', 'sign-up']
        let contains = false;
        exceptUrl.forEach(element => {
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
        let requestData = { email: '', phone: '', type: this.usernameType, source: 'login_otp' };
        (this.usernameType == 'e') ? requestData.email = this.username.value : requestData.phone = this.username.value;
        return requestData;
    }

    processOTPError(response) {
        this.invalidOTPMessage = (response['message'] as string).toLowerCase();
        if (response['status'] == false && response['statusCode'] == 500 && this.invalidOTPMessage.includes('maximum')) {
            this.isOTPLimitExceeded = true;
        }
    }

    //getters
    get username() { return this.otpForm.get('username'); };
    get otp() { return this.otpForm.get('otp'); };
    get isDisabled() { return this.otpForm.invalid || this.isOTPLimitExceeded || !(this.isOTPValidated); }
    get canRequestOTP() { return (this.isTicking == false && this.isOTPValidated == false && this.isOTPLimitExceeded == false); }

    ngOnDestroy() {
        if (this.usernameSubscriber) {
            this.usernameSubscriber.unsubscribe();
        }
        if (this.otpSubscriber) {
            this.otpSubscriber.unsubscribe();
        }
        if (this.paramsSubscriber) {
            this.paramsSubscriber.unsubscribe()
        }
    }
}
