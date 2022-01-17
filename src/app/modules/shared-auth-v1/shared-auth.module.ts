import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedLoginComponent } from './shared-login/shared-login.component';
import { SharedOtpComponent } from './shared-otp/shared-otp.component';
import { SharedSingupComponent } from './shared-singup/shared-singup.component';
import { SharedForgotPasswordComponent } from './shared-forgot-password/shared-forgot-password.component';
import { SocialLoginModule } from 'angularx-social-login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedAuthService } from './shared-auth.service';

@NgModule({
    declarations: [
        SharedLoginComponent,
        SharedOtpComponent,
        SharedSingupComponent,
        SharedForgotPasswordComponent
    ],
    imports: [
        CommonModule,   
        SocialLoginModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        SharedLoginComponent,
        SharedOtpComponent,
        SharedSingupComponent,
        SharedForgotPasswordComponent
    ],
    providers: [
        SharedAuthService,
        
    ]
})
export class SharedAuthModule { }
