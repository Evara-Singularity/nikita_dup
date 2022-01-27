import { GlobalLoaderModule } from './../global-loader/global-loader.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedLoginComponent } from './shared-login/shared-login.component';
import { SharedOtpComponent } from './shared-otp/shared-otp.component';
import { SharedForgotPasswordComponent } from './shared-forgot-password/shared-forgot-password.component';
import { SocialLoginModule } from 'angularx-social-login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedAuthService } from './shared-auth.service';
import { SharedSignupComponent } from './shared-signup/shared-signup.component';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { ToastMessageModule } from '../toastMessage/toast-message.module';
import { OTPTimerPipeModule } from '@app/utils/pipes/otp-timer.pipe';
import { SharedAuthOtpComponent } from './shared-auth-otp/shared-auth-otp.component';
import { SharedAuthHeaderComponent } from './shared-auth-header/shared-auth-header.component';
import { ListAutocompleteModule } from '@app/components/list-autocomplete/list-autocomplete.component';

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
    providers: [
        SharedAuthService,
    ]
})
export class SharedAuthModule { }
