import { Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PasswordValidator } from '@app/utils/validators/password.validator';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { SharedAuthService } from '../shared-auth.service';
import { Router } from '@angular/router';
import { AuthFlowType } from '../modals';
import {CONSTANTS} from '@app/config/constants';

@Component({
    selector: 'shared-forgot-password',
    templateUrl: './shared-forgot-password.component.html',
    styleUrls: ['./shared-forgot-password.component.scss']
})
export class SharedForgotPasswordComponent implements OnInit
{
    assetImgPath = CONSTANTS.IMAGE_ASSET_URL;
    readonly LOGIN_URL = "/login";
    readonly OTP_URL = "/otp"
    @Input('isCheckout') isCheckout = false;
    isPasswordType = true;
    authFlow: AuthFlowType;//gives flowtype & identifier information

    fpForm = new FormGroup({
        password: new FormControl("", [Validators.required, PasswordValidator.validatePassword])
    })

    constructor(private _sharedAuthService: SharedAuthService, private _router: Router, private _globalLoader: GlobalLoaderService,
        private _sharedAuthUtilService: SharedAuthUtilService, private _toastService: ToastMessageService
    ) { }

    ngOnInit()
    {
        // if (!this.authFlow) { this._router.navigateTo(this.LOGIN_URL); return; }
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


    navigateTo(link) { this._router.navigate([link]);}
    togglePasswordType() { this.isPasswordType = !(this.isPasswordType); }
    get password() { return this.fpForm.get("password") }

}
