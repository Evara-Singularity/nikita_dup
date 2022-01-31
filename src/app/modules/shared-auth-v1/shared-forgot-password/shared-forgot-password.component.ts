import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { CheckoutLoginService } from '@app/utils/services/checkout-login.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { Subscription, timer } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import { AuthFlowType } from '../modals';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';

@Component({
    selector: 'shared-forgot-password',
    templateUrl: './shared-forgot-password.component.html',
    styleUrls: ['./shared-forgot-password.component.scss']
})
export class SharedForgotPasswordComponent implements OnInit, OnDestroy {
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    readonly LOGIN_URL = "/login";
    @Input('isCheckout') isCheckout = false;
    isPasswordType = true;//to set input[type] = text/password.
    authFlow: AuthFlowType;//gives flowtype & identifier information
    fpForm = new FormGroup({
        otpForm: new FormArray([]),
        password: new FormControl("", [Validators.required, PasswordValidator.validatePassword])
    })
    verifiedOTP = "";

    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService, private _checkoutLoginService: CheckoutLoginService
    ) { }


    ngOnInit() {
        this.authFlow = this._sharedAuthUtilService.getAuthFlow();
        if (!this.authFlow && !this.isCheckout) { this.navigateTo(this.LOGIN_URL); return; }
        if (!this.authFlow && this.isCheckout) { this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.LOGIN_TAB); return; }
        this._sharedAuthUtilService.updateOTPControls(this.otpForm, 6);
    }

    updatePassword() {
        const REQUEST = this.getUserData();
        REQUEST['oldPassword'] = '';
        REQUEST['newPassword'] = this.password.value;
        REQUEST['otp'] = this.verifiedOTP;
        this._sharedAuthService.updatePassword(REQUEST).subscribe(
            (response) => {
                this._globalLoader.setLoaderState(false)
                if (response['statusCode'] == 200) {
                    this._toastService.show({ type: 'success', text: response['message'] });
                    //@checkout flow need to integrated here
                    if (this.isCheckout) {
                        this._checkoutLoginService.setPasswordResetStatus({
                            status: true, message: 'Password reset successfully. Please login to proceed',
                        })
                        this._sharedAuthService.emitCheckoutChangeTab(this._sharedAuthService.LOGIN_TAB)
                    } else {
                        this.navigateTo(this.LOGIN_URL);
                    }
                } else {
                    this._toastService.show({ type: 'error', text: response['message'] });
                }
            }, (error) => this._globalLoader.setLoaderState(false));
    }

    captureOTP(verifiedOTP) {
        this.verifiedOTP = verifiedOTP;
    }

    navigateTo(link) { this._router.navigate([link]); }
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }

    getUserData() {
        let requestData = { email: '', phone: '', type: "e", source: 'forgot_password' };
        if (this.authFlow.identifierType.includes("EMAIL")) {
            requestData.email = this.authFlow.identifier;
        }
        else {
            requestData.phone = this.authFlow.identifier;
            requestData.type = "p";
        }
        return requestData;
    }

    get otpForm() { return (this.fpForm.get("otpForm") as FormArray) }
    get password() { return this.fpForm.get("password") }
    get isDisabled() { return this.fpForm.invalid || this.verifiedOTP === "" }


    ngOnDestroy(): void {
    }

}
