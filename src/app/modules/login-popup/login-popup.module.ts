import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPopupComponent } from './login-popup.component';
import { AuthPopUpModule } from '../shared-auth-popup/shared-auth-popup.component';

@NgModule({
  declarations: [LoginPopupComponent],
  imports: [
    AuthPopUpModule,
    CommonModule
  ],
  exports: [
    LoginPopupComponent
  ]
})
export class LoginPopupModule { }
