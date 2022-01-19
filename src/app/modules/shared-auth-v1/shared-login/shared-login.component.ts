import { SharedAuthUtilService } from './../shared-auth-util.service';
import { Component, OnInit } from '@angular/core';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedAuthService } from '../shared-auth.service';
import { Router } from '@angular/router';

/**
 * HTML TODO: 
 * - Background image
 * - continue with email autocomplete UI
 * - Social Login icon
 * - all images to use cdn path
 * - terms and policy links
 * - Forgot password screen 
 * Angular TODO:
 *  - Add a loader
 *  - Autocomplete on email after user enters '@' chaacter
 *  - Remove headers in Auth screens
 */

@Component({
    selector: 'shared-login',
    templateUrl: './shared-login.component.html',
    styleUrls: ['./shared-login.component.scss']
})
export class SharedLoginComponent implements OnInit {

    readonly LOGIN_USING_PHONE = this._sharedAuthService.AUTH_USING_PHONE;
    readonly LOGIN_USING_EMAIL = this._sharedAuthService.AUTH_USING_EMAIL;

    loginNumberForm = this._fb.group({
        phone: ['', [Validators.required, UsernameValidator.validatePhone]]
    })
    loginEmailForm = this._fb.group({
        email: ['', [Validators.required, UsernameValidator.validateEmail]]
    })
    loginType = this.LOGIN_USING_PHONE; // default login using phone number
    isLoginNumberFormSuisLoginNumberFormSubmitted: boolean = false; bmitted: boolean = false;
    isLoginNumberFormSubmitted: boolean = false;
    isLoginEmailFormSubmitted: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _sharedAuthService: SharedAuthService,
        private _loader: GlobalLoaderService,
        private _tms: ToastMessageService,
        private _router: Router,
        private _sharedAuthUtilService:SharedAuthUtilService
    ) { }

    ngOnInit(): void {
        this._sharedAuthUtilService.clearAuthFlow();
    }

    submit(logintype) {
        switch (logintype) {
            case this.LOGIN_USING_PHONE:
                this.isLoginNumberFormSubmitted = true;
                this.loginNumberForm.valid && this.validateUserWithPhone();
                break;
            case this.LOGIN_USING_EMAIL:
                this.isLoginEmailFormSubmitted = true;
                this.loginEmailForm.valid && this.validateUserWithEmail();
                break;
            default:
                break;
        }
    }

    /**
     * login flow with otp
     * action: redirect to otp with password option, as user is already registere   
     * signup flow with otp
     * action: redirect to otp without password option, as user registration is not done 
     * */
    validateUserWithPhone() {
        this._loader.setLoaderState(true);
        const body = { email: '', phone: this.phoneFC.value, type: 'p' };
        this._sharedAuthService.isUserExist(body).subscribe(response => {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._sharedAuthUtilService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_PHONE, this.phoneFC.value);
                const bodyOTP = {
                    'email': '',
                    'phone': this.phoneFC.value,
                    'type': 'p',
                    'source': (isUserExists) ? 'login_otp' : 'signup',
                    'device': 'mobile'
                }
                //NOTE:UnComment code and remove navigation
                this._router.navigate(['/otp']);
                // this._sharedAuthService.getOTP(bodyOTP).subscribe(response => {
                //     if (response['statusCode'] === 200) {
                //         this._router.navigate(['/otp']);
                //     } else {
                //         this._tms.show({ type: 'error', text: response['message'] });
                //     }
                //     this._loader.setLoaderState(false);
                // });
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    validateUserWithEmail() {
        this._loader.setLoaderState(true);
        const body = { email: this.emailFC.valid, phone: '', type: 'e' };
        this._sharedAuthService.isUserExist(body).subscribe(response => {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                //CHECK:Email with otp call
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._sharedAuthUtilService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_EMAIL, this.emailFC.value);
                if(isUserExists){
                    // login flow with password as only option
                    this._router.navigate(['/otp']);
                }else{
                    // sign up with sign-up screen to capture phone and then verify with OTP
                    this._router.navigate(['/sign-up']);
                }
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    // supporting functions
    toggleLoginType(type) {
        this.loginType = type;
        this.resetForms();
    }

    resetForms() {
        this.phoneFC.setValue('');
        this.emailFC.setValue('');
        this.isLoginEmailFormSubmitted = false;
        this.isLoginNumberFormSubmitted = false;
    }

    get phoneFC() { return this.loginNumberForm.get("phone"); }
    get emailFC() { return this.loginEmailForm.get("email"); }

}
