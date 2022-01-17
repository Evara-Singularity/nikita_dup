import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedLoginComponent } from './shared-login/shared-login.component';
import { SharedOtpComponent } from './shared-otp/shared-otp.component';
import { SharedSingupComponent } from './shared-singup/shared-singup.component';
import { SharedForgotPasswordComponent } from './shared-forgot-password/shared-forgot-password.component';



@NgModule({
  declarations: [SharedLoginComponent, SharedOtpComponent, SharedSingupComponent, SharedForgotPasswordComponent],
  imports: [
    CommonModule
  ]
})
export class SharedAuthV1Module { }
