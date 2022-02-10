import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { AuthFlowType } from '@app/utils/models/auth.modals';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { Subscription } from 'rxjs';
import CONSTANTS from '../../../../app/config/constants';
import { SharedAuthService } from '../shared-auth.service';
import { SharedAuthUtilService } from './../shared-auth-util.service';

export interface BackurlWithTitle
{
    backurl: string,
    title: string
}

@Component({
    selector: 'shared-login',
    templateUrl: './shared-login.component.html',
    styleUrls: ['./shared-login.component.scss']
})
export class SharedLoginComponent implements OnInit
{

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
    bURLTitleSubscriber: Subscription = null;
    headerTitle = null;
    displaySuggestion = true;
    authFlow:AuthFlowType = null;


    constructor(
        private _fb: FormBuilder,
        private _sharedAuthService: SharedAuthService,
        private _localAuthService: LocalAuthService,
        private _loader: GlobalLoaderService,
        private _tms: ToastMessageService,
        private _router: Router,
        private _route: ActivatedRoute,
        private _sharedAuthUtilService: SharedAuthUtilService,
        private _common: CommonService,
    ) { }

    ngOnInit(): void
    {
        if (this._common.isBrowser) {
            this.authFlow = this._localAuthService.getAuthFlow();
            if (this.authFlow) { 
                this.updateControls(this.authFlow.identifier)
            }
        }
        this.handleBackUrlTitle();
    }

    updateControls(identifier:string)
    {
        if (identifier.includes("@")){
            this.emailFC.patchValue(identifier);
            this.loginType = this.LOGIN_USING_EMAIL;
            return;
        }
        this.phoneFC.patchValue(identifier);
        this.loginType = this.LOGIN_USING_PHONE;
    }

    handleBackUrlTitle()
    {
        this._route.queryParamMap.subscribe(params =>
        {
            this.headerTitle = params.get('title');
        })
        const DATA: BackurlWithTitle = this._localAuthService.getBackURLTitle();
        if (DATA) {
            this.headerTitle = DATA.title
        }
    }

    submit(logintype)
    {
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
    validateUserWithPhone()
    {
        this._loader.setLoaderState(true);
        const body = { email: '', phone: this.phoneFC.value, type: 'p' };
        this._sharedAuthService.isUserExist(body).subscribe(response =>
        {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._localAuthService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_PHONE, this.phoneFC.value);
                this.navigateToNext(isUserExists);
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    validateUserWithEmail()
    {
        this._loader.setLoaderState(true);
        const body = { email: this.emailFC.value, phone: '', type: 'e' };
        this._sharedAuthService.isUserExist(body).subscribe(response =>
        {
            if (response['statusCode'] == 200) {
                const isUserExists = response['exists'] as boolean;
                //NOTE:using local storage//flowType, identifierType, identifier, data
                //CHECK:Email with otp screen with password
                const FLOW_TYPE = (isUserExists) ? this._sharedAuthService.AUTH_LOGIN_FLOW : this._sharedAuthService.AUTH_SIGNUP_FLOW;
                this._localAuthService.setAuthFlow(isUserExists, FLOW_TYPE, this._sharedAuthService.AUTH_USING_EMAIL, this.emailFC.value);
                this.navigateToNext(isUserExists);
            } else {
                this._tms.show({ type: 'error', text: response['message'] });
            }
            this._loader.setLoaderState(false);
        })
    }

    clearSuggestion()
    {
        this.emailAutoCompleteSuggestion = [];
    }

    createEmailSuggestion(value)
    {
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

    // supporting functions
    navigateToNext(isUserExists)
    {
        if (this.isCheckout) {
            (isUserExists) ?
                this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.OTP_TAB) :
                this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.SIGN_UP_TAB)

        } else {
            const LINK = (isUserExists) ? "/otp" : "/sign-up";
            this._router.navigate([LINK]);
        }
    }

    toggleLoginType(type)
    {
        this.loginType = type;
        this.resetForms();
    }

    resetForms()
    {
        this.phoneFC.setValue('');
        this.emailFC.setValue('');
        this.isLoginEmailFormSubmitted = false;
        this.isLoginNumberFormSubmitted = false;
    }

    fillEmailSuggestion(value)
    {
        this.emailFC.patchValue(value);
        this.clearSuggestion();
        this.displaySuggestion = false;
    }

    toggleListDisplay(flag) { setTimeout(() => { this.displaySuggestion = flag; }, 100) }

    filter(value: string)
    {
        if (value.indexOf('@') > 0 && this.displaySuggestion) {
            this.createEmailSuggestion(value);
        } else {
            this.clearSuggestion();
        }
    }

    navigateHome() { this._router.navigate(["."]); }
    get isAuthHeader() { return this.isCheckout === false && this.headerTitle !== null }
    get phoneFC() { return this.loginNumberForm.get("phone"); }
    get emailFC() { return this.loginEmailForm.get("email"); }
    get isNormalLogin() { return this.isCheckout === false && this.headerTitle == null  }
    get isWhiteHeader() { return this.isCheckout || this.headerTitle !== null}
}
