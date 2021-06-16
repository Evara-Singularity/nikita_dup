
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';

import { Meta } from '@angular/platform-browser';
import { SharedCheckoutLoginUtilService } from './shared-checkout-login-util.service';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { SharedAuthService } from '../shared-auth.service';
import { CommonService } from '@app/utils/services/common.service';
const IDENTIFIER = { EMAIL: 'e', PHONE: 'p', }
const SECTIONS = { 'LOGIN': 'LOGIN', 'FORGET_PASSWORD': 'FORGET_PASSWORD', 'VERIFY_OTP': 'VERIFY_OTP', 'SIGN_UP': 'SIGN_UP' }


@Component({
    selector: 'app-shared-checkout-login',
    templateUrl: './shared-checkout-login.component.html',
    styleUrls: ['./shared-checkout-login.component.scss']
})
export class SharedCheckoutLoginComponent implements OnInit {

    @Output() changeTab$: EventEmitter<string> = new EventEmitter<string>();
    @Output() updatedStepShared$: EventEmitter<any> = new EventEmitter<any>();
    @Output() socialLoginWorkingShared$: EventEmitter<any> = new EventEmitter<any>();

    IDENTIFIER = IDENTIFIER;
    SECTIONS = SECTIONS;

    loginForm: FormGroup;
    identifierType: string;
    isIdentifierVerified: boolean; // to hold verify customer API state
    isNewUser: boolean; // After verify API to hold if user new or existing 
    showLoader: boolean;
    isSubmitted: boolean = false;
    isSignInSubmitted: boolean = false;
    isSignUpSubmitted: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        private authService: SharedAuthService,
        private tms: ToastMessageService,
        private localAuthService: LocalAuthService,
        private router: Router,
        private commonService: CommonService,
        private cartService: CartService,
        private checkoutUtilService: SharedCheckoutLoginUtilService,
        private meta: Meta,
    ) { }

    get identifierFormControl() {
        return (this.loginForm.controls['identifierForm'] as FormGroup).controls
    }

    get phoneFromControl() {
        return (this.loginForm.controls['phoneFrom'] as FormGroup).controls
    }

    get passwordFromControl() {
        return (this.loginForm.controls['passwordFrom'] as FormGroup).controls
    }

    get identifierForm() {
        return (this.loginForm.controls['identifierForm'] as FormGroup)
    }

    get phoneFrom() {
        return (this.loginForm.controls['phoneFrom'] as FormGroup)
    }

    get passwordFrom() {
        return (this.loginForm.controls['passwordFrom'] as FormGroup)
    }

    ngOnInit(): void {
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT2 });
        this.setIntialState();
        this.intiateLoginForm();
        this.checkoutUtilService.sendAdobeAnalysis();
    }

    setIntialState() {
        this.identifierType = null;
        this.isIdentifierVerified = false;
        this.isNewUser = null;
        this.isSubmitted = false;
        this.isSignInSubmitted = false;
        this.isSignUpSubmitted = false;
    }

    intiateLoginForm(): void {
        this.loginForm = this.formBuilder.group({
            identifierForm: this.formBuilder.group({
                identifier: ['', [UsernameValidator.validateUsername, Validators.required]]
            }),
            phoneFrom: this.formBuilder.group({
                phone: ['', [UsernameValidator.validatePhone, Validators.required]]
            }),
            passwordFrom: this.formBuilder.group({
                password: ['', [Validators.required, Validators.minLength(8)]]
            }),
        })
    }

    submit() {
        // verify customer if exists perform login else signup
        this.isSubmitted = true;

        if (!this.isIdentifierVerified) {
            this.verifyCustomer();
        }
        // signup scenario
        if (this.isIdentifierVerified && this.identifierForm.valid && this.phoneFrom.value) {
            console.log('insdide signup');
            this.isSignUpSubmitted = true;
            if (this.phoneFrom.valid) {
                this.switchToSignUp();
            }
        }
        // login scenario
        if (this.isIdentifierVerified && this.identifierForm.valid && this.passwordFrom.value != '') {
            this.isSignInSubmitted = true;
            if (this.passwordFrom.valid) {
                this.signIn();
            }
        }

        return;

    }

    verifyCustomer() {
        const identifierForm = this.loginForm.get('identifierForm') as FormGroup
        if (identifierForm.invalid) {
            return
        }
        const value = identifierForm.controls['identifier'].value;
        const identifierType = (value && value.indexOf('@')) > -1 ? IDENTIFIER.EMAIL : IDENTIFIER.PHONE;
        let userInfo = {
            email: (identifierType == IDENTIFIER.EMAIL) ? value : '',
            phone: (identifierType == IDENTIFIER.PHONE) ? value : '',
            type: identifierType
        };
        this.commonService.showLoader = true;
        this.authService.isUserExist(userInfo).subscribe(
            (response) => {
                this.commonService.showLoader = false;
                if (response['statusCode'] == 200) {
                    this.checkoutUtilService.sendUserExistsAdobeAnalysis();
                    this.updateVerifyCustomerState(response, identifierType);
                } else {
                    this.tms.show({ type: 'error', text: 'Service is temporarily unavailable. Please try again.' })
                }
            },
            (error) => { this.tms.show({ type: 'error', text: 'Service is temporarily unavailable' }) },
            () => { this.commonService.showLoader = false; }
        );
    }

    updateVerifyCustomerState(response: object, identifierType): void {
        this.identifierType = identifierType;
        this.isIdentifierVerified = true;
        this.isNewUser = !response['exists'];
        if (this.isNewUser && identifierType == IDENTIFIER.PHONE) {
            this.switchToSignUp();
        }
    }

    switchToSignUp() {
        this.commonService.showLoader = true;
        const value = this.identifierForm.controls['identifier'].value;
        const identifierType = (value && value.indexOf('@')) > -1 ? IDENTIFIER.EMAIL : IDENTIFIER.PHONE;
        this.identifierType = identifierType;
        const phone = (this.identifierType == IDENTIFIER.PHONE) ? this.identifierForm.controls['identifier'].value : this.phoneFrom.controls['phone'].value;
        const email = (this.identifierType == IDENTIFIER.EMAIL) ? this.identifierForm.controls['identifier'].value : '';
        const bodyOtp = {
            email,
            phone,
            type: ((email != '') && (phone != '')) ? IDENTIFIER.PHONE : this.identifierType,
            source: 'signup'
        };
        const bodyVerify = {
            email,
            phone,
            type: ((email != '') && (phone != '')) ? IDENTIFIER.PHONE : this.identifierType,
        };
        if (this.identifierType == IDENTIFIER.EMAIL) {
            //verifying once again with phone number
            this.authService.isUserExist(bodyVerify).subscribe(
                (response) => {
                    if (response['statusCode'] == 200) {
                        if (response['exists'] == true) {
                            this.tms.show({ type: 'success', text: 'You are already registered with this phone number. Please login' });
                            this.resetForm();
                        } else {
                            this.signUpSendOTP(bodyOtp);
                        }
                    } else {
                        this.tms.show({ type: 'error', text: 'Service is temporarily unavailable. Please try again.' })
                    }
                },
                (error) => { this.tms.show({ type: 'error', text: 'Service is temporarily unavailable' }) },
                () => { this.commonService.showLoader = false; }
            );
        } else {
            this.signUpSendOTP(bodyOtp)
        }

    }

    signUpSendOTP(bodyOtp) {
        this.authService.sendOtp(bodyOtp).subscribe((response) => {
            this.commonService.showLoader = false;
            if (response['statusCode'] === 200) {
                this.localAuthService.setPageInfo('signup', { mobile: (bodyOtp.phone) ? bodyOtp.phone : '', email: (bodyOtp.email) ? bodyOtp.email : '' }); // required to set values in signup form
                this.changeTab$.emit(SECTIONS.SIGN_UP);
            } else {
                this.tms.show({ type: 'error', text: response['message'] })
            }
        }, (error) => {
            console.log('send otp failed in switchToSignUp checkout', error);
            this.tms.show({ type: 'error', text: 'Unable to sent OTP. Please try again' });
        }, () => { this.commonService.showLoader = false; });
    }

    signIn() {
        this.isSignInSubmitted = true;
        const email = (this.identifierType == IDENTIFIER.EMAIL) ? this.identifierForm.controls['identifier'].value : '';
        const phone = (this.identifierType == IDENTIFIER.PHONE) ? this.identifierForm.controls['identifier'].value : this.phoneFrom.controls['phone'].value;
        const password = this.passwordFrom.controls['password'].value;
        const body = { email, phone, type: this.identifierType, password, buildVersion: '2.0' };

        this.commonService.showLoader = true;
        this.authService.authenticate(body).subscribe((response) => {
            if (response['statusCode'] !== undefined && response['statusCode'] != 200) {
                this.tms.show({ type: 'error', text: response['message'] });
            } else {
                this.localAuthService.setUserSession(response);
                this.processAuthentication()
            }
        }, (error) => {
            console.log('authenticate user login checkout failed', error)
        }, () => { this.commonService.showLoader = false; });
    }

    processAuthentication() {
        const userSession = this.localAuthService.getUserSession();
        const cartSession = Object.assign(this.cartService.getCartSession());
        cartSession['cart']['userId'] = userSession.userId;
        this.cartService.getSessionByUserId(cartSession).pipe(
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
            })).subscribe((res) => {

                if (res.statusCode !== undefined && res.statusCode === 200) {
                    // update cart with items after merging items
                    const cs = this.cartService.updateCart(res);
                    this.cartService.setCartSession(cs);
                    this.cartService.orderSummary.next(res);
                    this.cartService.cart.next(res.noOfItems);

                    if (this.cartService.buyNow) {
                        // incase of checkout module only we need to check buynow flow
                        const sessionDetails = this.cartService.getCartSession();
                        sessionDetails['cart']['userId'] = userSession.userId;
                        this.commonService.showLoader = true;
                        this.cartService.updateCartSessions(null, sessionDetails).subscribe((data) => {
                            this.localAuthService.login$.next(this.router.url);
                            data['userId'] = userSession.userId;
                            this.cartService.setCartSession(data);
                            this.cartService.orderSummary.next(data);
                            this.cartService.cart.next(data.noOfItems);
                            this.commonService.showLoader = false;
                            this.updatedStepShared$.emit(2);
                            this.tms.show({ type: 'success', text: 'Sign in successful' });
                        });
                    } else {
                        // without buynow flow in checkout module
                        this.localAuthService.login$.next(this.router.url);
                        this.updatedStepShared$.emit(2);
                        this.tms.show({ type: 'success', text: 'Sign in successful' });
                    }

                }

            }, () => { this.commonService.showLoader = false; });
    }

    forgotPassword() {
        // since user will already be verified only need to send OTP for reset password 
        const phone = (this.identifierType == IDENTIFIER.PHONE) ? this.identifierForm.controls['identifier'].value : this.phoneFrom.controls['phone'].value;
        const email = (this.identifierType == IDENTIFIER.EMAIL) ? this.identifierForm.controls['identifier'].value : '';

        const body = {
            email,
            phone,
            type: this.identifierType,
            source: "forgot_password"
        }
        this.authService.sendOtp(body).subscribe((response) => {
            this.commonService.showLoader = false;
            if (response['statusCode'] === 200) {
                this.localAuthService.setPageInfo('login', { username: this.identifierForm.controls['identifier'].value }); // required to autofill identifier value in forgot password section 
                this.changeTab$.emit(SECTIONS.FORGET_PASSWORD);
            } else {
                this.tms.show({ type: 'error', text: response['message'] })
            }
        }, (error) => {
            console.log('send otp failed in forgotPassword checkout', error);
            this.tms.show({ type: 'error', text: 'Unable to sent OTP. Please try again' });
        }, () => { this.commonService.showLoader = false; });
    }

    otpLogin() {
        // since user will already be verified only need to send OTP for reset password 
        const phone = (this.identifierType == IDENTIFIER.PHONE) ? this.identifierForm.controls['identifier'].value : this.phoneFrom.controls['phone'].value;
        const email = (this.identifierType == IDENTIFIER.EMAIL) ? this.identifierForm.controls['identifier'].value : '';

        const body = {
            email,
            phone,
            type: this.identifierType,
            source: 'login_otp'
        }
        this.authService.sendOtp(body).subscribe((response) => {
            this.commonService.showLoader = false;
            if (response['statusCode'] === 200) {
                this.localAuthService.setPageInfo('login', { username: this.identifierForm.controls['identifier'].value }); // required to autofill identifier value in forgot password section 
                this.changeTab$.emit(SECTIONS.VERIFY_OTP);
            } else {
                this.tms.show({ type: 'error', text: response['message'] })
            }
        }, (error) => {
            console.log('send otp failed in otpLogin checkout', error);
            this.tms.show({ type: 'error', text: 'Unable to sent OTP. Please try again' });
        }, () => { this.commonService.showLoader = false; });
    }

    slWorking(data) {
        this.socialLoginWorkingShared$.emit(data);
    }

    resetForm() {
        this.loginForm.reset();
        this.setIntialState();
    }

    getErrors(errors) { return errors[Object.keys(errors)[0]]; }

}