import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { OTPTimerPipeModule } from '@app/utils/pipes/otp-timer.pipe';
import { SocialLoginModule } from 'angularx-social-login';
import { ToastMessageModule } from '../toastMessage/toast-message.module';
import { GlobalLoaderModule } from './../global-loader/global-loader.module';
import { SharedAuthHeaderComponent } from './shared-auth-header/shared-auth-header.component';
import { SharedAuthOtpComponent } from './shared-auth-otp/shared-auth-otp.component';
import { SharedForgotPasswordComponent } from './shared-forgot-password/shared-forgot-password.component';
import { SharedLoginComponent } from './shared-login/shared-login.component';
import { SharedOtpComponent } from './shared-otp/shared-otp.component';
import { SharedSignupComponent } from './shared-signup/shared-signup.component';

@NgModule({
    declarations: [
        SharedLoginComponent,
        SharedOtpComponent,
        SharedSignupComponent,
        SharedForgotPasswordComponent,
        SharedAuthOtpComponent,
        SharedAuthHeaderComponent,
    ],
    imports: [
        CommonModule,   
        SocialLoginModule,
        FormsModule,
        ReactiveFormsModule,
        NumberDirectiveModule,
        ToastMessageModule,
        GlobalLoaderModule,
        OTPTimerPipeModule,
    ],
    exports: [
        SharedLoginComponent,
        SharedOtpComponent,
        SharedSignupComponent,
        SharedForgotPasswordComponent
    ],
    providers: []
})
export class SharedAuthModule { }
