import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAuthModule } from '@app/modules/shared-auth-v1/shared-auth.module';
import { OtpRoutingModule } from './otp-routing.module';
import { OtpComponent } from './otp.component';

@NgModule({
  declarations: [OtpComponent],
  imports: [
    CommonModule,
    OtpRoutingModule,
    SharedAuthModule
  ],
    providers: []
})
export class OtpModule { }
