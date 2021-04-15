import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators/map';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { CartService } from '../../../utils/services/cart.service';
import { CommonService } from '../../../utils/services/common.service';
import CONSTANTS from '../../../config/constants';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { SharedLoginUtilService } from './shared-login-util.service';
import { UsernameValidator } from 'src/app/utils/validators/username.validator';
import { SharedAuthService } from '../shared-auth.service';
const TABLIST = ['LOGIN', 'SIGNUP', 'OTP'];

@Component({
    selector: 'app-shared-login',
    templateUrl: './shared-login.component.html',
    styleUrls: ['./shared-login.component.scss']
})
export class SharedLoginComponent implements OnInit, OnDestroy {

    readonly tabs = [
        { type: TABLIST[0], heading: 'Sign In'},
        { type: TABLIST[1], heading: 'Sign  Up'}
    ];
    mobile = new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9]\d*$/)]);
    loginForm = new FormGroup({
        username: new FormControl('', [UsernameValidator.validateUsername]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)])
    })
    currentTab = TABLIST[0];
    usernameSubscriber: Subscription = null;
    paramsSubscriber: Subscription = null;
    mobileSubscriber: Subscription = null;
    usernameType = 'p';
    cartSession = null;
    redirectUrl = '';
    isServer: boolean;
    isBrowser: boolean;
    isReqProcessing: boolean;
    isUserExists = false;
    isSubmitted: boolean = false;

    constructor(
        private title: Title,
        private authService: SharedAuthService,
        private loginUtilService: SharedLoginUtilService,
        private meta: Meta,
        private cartService: CartService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private localAuthService: LocalAuthService,
        @Inject(PLATFORM_ID) platformId,
        private commonService: CommonService,
        private tms: ToastMessageService) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() { this.initialize(); }

    initialize() {
        this.title.setTitle("Sign In to Moglix");
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
        this.verifyPageInfo();
        this.cartSession = this.cartService.getCartSession();
        this.loginUtilService.sendLoginAdobeAnalysis();
        this.addSubscribers();
    }

    verifyPageInfo() {
        let pageInfo = this.localAuthService.getPageInfo('login');
        if (pageInfo) {
            if (pageInfo['tab']) {
                let tab = (pageInfo['tab'] as string).toUpperCase();
                this.setTab(tab);
            }
            if (pageInfo['username']) {
                this.username.setValue(pageInfo['username']);
            }
        } else {
            this.setTab(TABLIST[0]);
        }
    }

    setTab(tabName: string) {
        tabName = tabName.toUpperCase();
        if (tabName === TABLIST[1]) {
            if (this.loginUtilService.validatePhone(this.username.value)) {
                this.mobile.setValue(this.username.value);
            } else {
                this.mobile.setValue('');
            }
            this.username.reset();
            this.username.setValue('');
            this.loginUtilService.sendSignupAdobeAnalysis();
        } else {
            this.password.reset();
            this.password.setValue('');
        }
        this.isSubmitted = false;
        this.currentTab = tabName.toUpperCase();
        //autofill sign if user is not resgistered and redirected back to login
        // let pageInfo = this.localAuthService.getPageInfo('login');
        // if (pageInfo && pageInfo['username']) {
        //     console.log('login setup', pageInfo);
        //     this.username.setValue(pageInfo['username']);
        //     this.mobile.setValue(pageInfo['username']);
        // }
    }

    addSubscribers() {
        this.usernameSubscriber = this.username.valueChanges.subscribe((value: string) => {
            this.usernameType = (value && value.indexOf('@')) > -1 ? 'e' : 'p';
        });
        this.mobileSubscriber = this.mobile.valueChanges.subscribe((value: string) => {
            if (this.mobile.valid) {
                this.localAuthService.setPageInfo('signup', { tab: TABLIST[1], mobile: value });
            }
        });
        this.paramsSubscriber = this.activatedRoute.queryParams.subscribe(data => {
            this.redirectUrl = data['backurl'];
        });
    }

    verifyUser(type) {
        this.isSubmitted = true;
        
        if(this.loginForm.invalid && this.currentTab ==TABLIST[0] && type == TABLIST[0] ){
            // console.log('verifyUser login form invaoid', 'called')
            return;
        }

        if(this.username.invalid && this.currentTab ==TABLIST[0] && type == TABLIST[2]  ){
            // console.log('verifyUser login otp form invaoid', 'called')
            return;
        }

        if(this.mobile.invalid && this.currentTab ==TABLIST[1] && type == TABLIST[1]  ){
            // console.log('verifyUser signup form invaoid', 'called')
            return;
        }

        this.usernameType = (this.username.value && this.username.value.indexOf('@')) > -1 ? 'e' : 'p';

        if (this.loginForm.valid || this.username.valid || this.mobile.valid) {
            this.isReqProcessing = true;
            let userInfo = { email: '', phone: '', type: this.usernameType };
            if (type === 'SIGNUP') {
                userInfo = { email: '', phone: this.mobile.value, type: 'p' };
            } else {
                (this.usernameType === 'e') ? userInfo.email = this.username.value : userInfo.phone = this.username.value;
            }
            // console.log('userInfo', userInfo);
            this.authService.isUserExist(userInfo).subscribe(
                (response) => {
                    this.isReqProcessing = false;
                    if (response['statusCode'] == 200) {
                        this.isUserExists = response['exists'];
                        if (type === 'SIGNUP') {
                            if (this.isUserExists) {
                                this.tms.show({ type: 'error', text: 'You are already registered. Please sign in' });
                                this.username.setValue(this.mobile.value);
                                this.setTab(TABLIST[0]);
                            } else {
                                this.initiateSignup(userInfo);
                            }
                        } else {
                            if (this.isUserExists) {
                                this.processUser(type, userInfo);
                            } else {
                                this.mobile.setValue(this.username.value);
                                this.tms.show({ type: 'error', text: 'You are not registered. Please sign up' });
                                this.setTab(TABLIST[1]);
                            }
                        }
                    } else {
                        this.tms.show({ type: 'error', text: response['message'] });
                    }
                },
                (error) => { this.isReqProcessing = false; this.tms.show({ type: 'error', text: 'Service is temporarily unavailable' }); }
            );
        }
    }

    initiateSignup(userInfo) {
        userInfo['source'] = 'signup';
        this.localAuthService.setPageInfo('signup', { mobile: this.mobile.value });
        this.sendOTP(userInfo, 'sign-up');
    }

    processUser(type: string, userInfo) {
        type = type.toUpperCase();
        this.localAuthService.setPageInfo('login', { username: this.username.value });
        if (type == 'LOGIN') {
            this.authenticateUser(userInfo);
        } else if (type == 'OTP' || type == 'FORGOT') {
            let requestData = this.getUserData();
            requestData['source'] = 'forgot_password';
            let url = 'forgot-password';
            if (type == 'OTP') {
                requestData['source'] = 'login_otp';
                url = 'otp';
            }
            this.sendOTP(requestData, url);
        }
    }

    sendOTP(requestData, url) {
        this.isReqProcessing = true;
        this.authService.getOTP(requestData).subscribe(
            (response) => {
                this.isReqProcessing = false;
                if (response['statusCode'] === 200) {
                    console.log('219',this.redirectUrl);
                    if(this.redirectUrl){
                        let navigationExtras: NavigationExtras = {
                            queryParams: { 'backurl': this.redirectUrl },
                        };
                        this.router.navigate([url], navigationExtras);
                    }else{
                        this.router.navigate([url])
                    }
                } else {
                    this.tms.show({ type: 'error', text: response['message'] });
                }
            },
            (error) => { this.isReqProcessing = false; },
        );
    }

    authenticateUser(userInfo) {
        let request = Object.create(userInfo);
        request['password'] = this.password.value;
        // console.log('password login request', request);
        this.cartSession = this.cartService.getCartSession();
        if (this.usernameType === 'e') {
            request.email = (request.email as string).toLowerCase();
        } else {
            request.phone = (request.phone as string).toLowerCase();
        }
        this.isReqProcessing = true;
        request['buildVersion'] = '1.1';
        this.authService.authenticate(request).subscribe(
            (response) => {
                if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                    // console.log('authenticateUser', response);
                    this.tms.show({ type: 'error', text: response['message'] });
                } else {
                    this.processAuthentication(response);
                }
                this.isReqProcessing = false;
            },
            (error) => { this.isReqProcessing = false; });
    }

    processAuthentication(response) {
        this.localAuthService.setUserSession(response);
        if (this.isBrowser) {
            this.loginUtilService.sendCriteoLayerTags(response);
        }
        this.updateCartSession();
    }

    updateCartSession() {
        const userSession = this.localAuthService.getUserSession();
        const cartSession = Object.assign(this.cartService.getCartSession());
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
                }
            });
            this.localAuthService.login$.next(this.redirectUrl);
            let routeData = this.commonService.getRouteData();
            if(this.redirectUrl){
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
            this.tms.show({ type: 'success', text: 'Sign in successful' });
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

    navigateTo(page) {
        this.localAuthService.setPageInfo('signup', { mobile: this.mobile.value });
        this.router.navigate([page]);
    }

    getUserData() {
        let requestData = { email: '', phone: '', type: this.usernameType, source: '' };
        (this.usernameType == 'e') ? requestData.email = this.username.value : requestData.phone = this.username.value;
        return requestData;
    }

    //getters
    get username() { return this.loginForm.get('username'); };
    get password() { return this.loginForm.get('password'); };

    //errors
    getErrors(errors) { return errors[Object.keys(errors)[0]]; }

    ngOnDestroy() {
        if (this.usernameSubscriber) {
            this.usernameSubscriber.unsubscribe()
        }
        if (this.mobileSubscriber) {
            this.mobileSubscriber.unsubscribe()
        }
        if (this.paramsSubscriber) {
            this.paramsSubscriber.unsubscribe()
        }
    }
}