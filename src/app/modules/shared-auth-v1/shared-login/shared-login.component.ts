import { SharedAuthUtilService } from './../shared-auth-util.service';
import { Component, Input, OnInit, Output } from '@angular/core';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedAuthService } from '../shared-auth.service';
import { Router } from '@angular/router';
import CONSTANTS from '../../../../app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
import { debounceTime } from 'rxjs/operators';

/**
 * HTML TODO (Yogi): 
 * - Background image
 * - continue with email autocomplete UI screen 45
 * - Social Login icon
 * - all images to use cdn path
 * - terms and policy links
 * - Forgot password screen 
 
* HTML TODO (Yajya): 
  css segregation module wise
 * 
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
    
    readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
    readonly LOGIN_USING_PHONE = this._sharedAuthService.AUTH_USING_PHONE;
    readonly LOGIN_USING_EMAIL = this._sharedAuthService.AUTH_USING_EMAIL;
    readonly SUGGESTION_EMAIL_HOST = ['gmail.com', 'yahoo.com', 'live.com', 'rediffmail.com', 'outlook.com']
    @Input('isCheckout') isCheckout = false;
    
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
    emailAutoCompleteSuggestion: string[] = [];
    

    constructor(
        private _fb: FormBuilder,
        private _sharedAuthService: SharedAuthService,
        private _loader: GlobalLoaderService,
        private _tms: ToastMessageService,
        private _router: Router,
        private _sharedAuthUtilService:SharedAuthUtilService,
        private _common: CommonService,
    ) { }

    ngOnInit(): void {
        if (this._common.isBrowser) {
            this._sharedAuthUtilService.clearAuthFlow();
            this.emailFC.valueChanges.pipe(debounceTime(300)).subscribe(value => {
                if(value.indexOf('@') > -1){
                    this.createEmailSuggestion(value);
                }else{
                    this.clearSuggestion();
                }
            });
        }
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
                this.navigateToNext(isUserExists);
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    validateUserWithEmail() {
        this._loader.setLoaderState(true);
        const body = { email: this.emailFC.value, phone: '', type: 'e' };
        this._sharedAuthService.isUserExist(body).subscribe(response => {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                //CHECK:Email with otp screen with password
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._sharedAuthUtilService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_EMAIL, this.emailFC.value);
                this.navigateToNext(isUserExists);
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    clearSuggestion(){
        this.emailAutoCompleteSuggestion = [];
    }

    createEmailSuggestion(value) {
        const proposedHostValue = (value.split('@').length > 0) ? value.split('@')[1] : '';
        if (proposedHostValue) {
            // show only filtered suggestion as user types
            this.emailAutoCompleteSuggestion = this.SUGGESTION_EMAIL_HOST.filter(host => host.indexOf(proposedHostValue) > -1)
                .map(host => `${value.split('@')[0]}@${host}`);;
        } else {
            // show all suggestion
            this.emailAutoCompleteSuggestion = this.SUGGESTION_EMAIL_HOST.map(host => `${value}${host}`);
        }
    }

    fillEmailSuggestion(value){
        this.emailFC.patchValue(value);
    }

    // supporting functions
    navigateToNext(isUserExists) { 
        if(this.isCheckout){
            (isUserExists)?
                this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.OTP_TAB): 
                this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.SIGN_UP_TAB)
            
        }else{
            const LINK = (isUserExists) ? "/otp" : "/sign-up";
            this._router.navigate([LINK]);
        }
    }


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

    navigateHome()
    {
        this._router.navigate(["/"]);
    }

    get phoneFC() { return this.loginNumberForm.get("phone"); }
    get emailFC() { return this.loginEmailForm.get("email"); }

}
