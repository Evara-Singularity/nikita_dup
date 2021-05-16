import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedAuthModule } from '@app/modules/shared-auth/shared-auth.module';
import { SignUpRoutingModule } from './sign-up-routing.module';
import { SignUpComponent } from './sign-up.component';

@NgModule({
  declarations: [SignUpComponent],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    SharedAuthModule
  ],
  providers:[]
})
export class SignUpModule { }
