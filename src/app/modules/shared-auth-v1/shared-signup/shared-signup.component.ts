import { Validators } from '@angular/forms';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { AuthFlowType } from '../modals';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { UsernameValidator } from '@app/utils/validators/username.validator';
import { StartWithSpaceValidator } from '@app/utils/validators/startwithspace.validator';
import { CONSTANTS } from '@app/config/constants';

/**
 * User must have auth flow information
 * User registering using email will be redirected to OTP for mobile verification
 * User registering using OTP will be processed here.
 * if possible for email use auto complete
 * add validations & error messages, toaster
 * 
 */

@Component({
    selector: 'shared-singup',
    templateUrl: './shared-signup.component.html',
    styleUrls: ['./shared-signup.component.scss']
})
export class SharedSignupComponent implements OnInit
{

    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly LOGIN_URL = "/login";
    readonly OTP_URL = "/otp";
    @Input('isCheckout') isCheckout = false;
    authFlow: AuthFlowType;//gives flowtype & identifier information
    isUserExists = false;
    isSingupUsingPhone = false;
    isOTPLimitExceeded = false;
    isPasswordType = true;

    signupForm = new FormGroup({
        name: new FormControl("", [Validators.required, StartWithSpaceValidator.validateSpaceStart]),
        email: new FormControl("", [UsernameValidator.validateEmail]),
        phone: new FormControl("", [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9]\d*$/)]),
        password: new FormControl("", [PasswordValidator.validatePassword]),
    })


    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService) { }

    ngOnInit()
    {
        //redirect if authflow details are not available
        //decide and build singup form depending on OTP or Email registration
        //Need to update the mobile after OTP validation
        if (!this.authFlow && this.authFlow.flowType !== this._sharedAuthService.AUTH_SIGNUP_FLOW) { this.navigateTo(this.LOGIN_URL); return; }
        this.isSingupUsingPhone = (this.authFlow.identifierType === this._sharedAuthService.AUTH_SINGUP_BY_EMAIL);
        Object.freeze(this.isSingupUsingPhone);
    }

    validateUser($event)
    {
        $event.stopPropagation();
        let userInfo = null;
        if (this.isSingupUsingPhone) {
            userInfo = { email: this.email.value, phone: "", type: 'e' };
        } else {
            userInfo = { email: '', phone: this.phone.value, type: 'p' };
        }
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.isUserExist(userInfo).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] == 200) {
                    this.isUserExists = response['exists'];
                    if (!this.isUserExists) {
                        this.processSignup(this.signupForm.value);
                    }
                } else {
                    this._toastService.show({ type: 'error', text: response['message'] });
                }
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        );
    }

    processSignup(singup)
    {
        if (this.isSingupUsingPhone) {
            this.initiateSingupFlow(singup);
            return;
        }
        this.initiateOTP();
    }

    initiateOTP()
    {
        const REQUEST = this._sharedAuthUtilService.getUserData("signup");
        this._globalLoader.setLoaderState(true);
        this._sharedAuthService.sendOTP(REQUEST).subscribe(
            (response) =>
            {
                this._globalLoader.setLoaderState(false);
                if (response['statusCode'] !== 200) {
                    this._sharedAuthUtilService.processOTPError(response);
                    return;
                }
                this.navigateTo(this.OTP_URL);
            },
            (error) => { this._globalLoader.setLoaderState(false); },
        )
    }

    initiateSingupFlow(singup)
    {
        //NOTE:verify with Pritam as there will be no firstName & lastName
        singup['otp'] = (this.authFlow.data['otp'] as string[]).join();//need set otp value from otp screen
        this._sharedAuthUtilService.signupUser(singup, this.isCheckout);
    }

    navigateTo(link) { this._router.navigate([link]) }
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }
    get disableContinue() { return this.signupForm.invalid || this.isOTPLimitExceeded }
    get name() { return this.signupForm.get("name"); }
    get email() { return this.signupForm.get("email"); }
    get phone() { return this.signupForm.get("phone"); }
    get password() { return this.signupForm.get("password"); }
}
