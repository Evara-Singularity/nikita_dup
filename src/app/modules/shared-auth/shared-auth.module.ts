import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedLoginComponent } from './shared-login/shared-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedSignupComponent } from './shared-signup/shared-signup.component';
import { SharedOtpComponent } from './shared-otp/shared-otp.component';
import { SharedForgotPasswordComponent } from './shared-forgot-password/shared-forgot-password.component';
import { SharedCheckoutLoginComponent } from './shared-checkout-login/shared-checkout-login.component';
import { ToastMessageModule } from '../toastMessage/toast-message.module';
import { LoaderModule } from '../loader/loader.module';
import { SharedAuthService } from './shared-auth.service';
import { SocialLoginModule } from '../socialLogin/socialLogin.module';
import { SharedSignUtilService } from './shared-signup/shared-sign-util.service';
import { SharedOtpUtilService } from './shared-otp/shared-otp-util.service';
import { SharedCheckoutLoginUtilService } from './shared-checkout-login/shared-checkout-login-util.service';
import { SharedLoginUtilService } from './shared-login/shared-login-util.service'

@NgModule({
  declarations: [
    SharedLoginComponent,
    SharedSignupComponent,
    SharedOtpComponent,
    SharedForgotPasswordComponent,
    SharedCheckoutLoginComponent
  ],
  imports: [
    CommonModule,
    SocialLoginModule,
    FormsModule,
    ReactiveFormsModule,
    LoaderModule,
    ToastMessageModule
  ],
  exports: [
    SharedLoginComponent,
    SharedSignupComponent,
    SharedOtpComponent,
    SharedForgotPasswordComponent,
    SharedCheckoutLoginComponent
  ],
  providers: [
    SharedAuthService,
    SharedSignUtilService,
    SharedOtpUtilService,
    SharedCheckoutLoginUtilService,
    SharedLoginUtilService
  ]
})
export class SharedAuthModule { }
