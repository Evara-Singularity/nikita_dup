import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAuthModule } from '../../modules/shared-auth/shared-auth.module';
import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
@NgModule({
    declarations: [ForgotPasswordComponent],
    imports: [
        CommonModule,
        ForgotPasswordRoutingModule,
        SharedAuthModule
    ],
    providers: []
})
export class ForgotPasswordModule { }
