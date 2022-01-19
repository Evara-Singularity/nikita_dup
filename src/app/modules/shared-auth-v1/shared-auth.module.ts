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

@NgModule({
    declarations: [
        SharedLoginComponent,
        SharedOtpComponent,
        SharedSignupComponent,
        SharedForgotPasswordComponent,
    ],
    imports: [
        CommonModule,   
        SocialLoginModule,
        FormsModule,
        ReactiveFormsModule,
        NumberDirectiveModule,
        ToastMessageModule,
        GlobalLoaderModule
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
