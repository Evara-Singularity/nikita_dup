import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPopupComponent } from './login-popup.component';

@NgModule({
  declarations: [LoginPopupComponent],
  imports: [
    CommonModule
  ],
  exports: [
    LoginPopupComponent
  ]
})
export class LoginPopupModule { }
