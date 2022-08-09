import { Router, RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { SocialAuthService } from 'angularx-social-login';

@Component({
  selector: "auth",
  templateUrl: "./shared-auth-popup.component.html",
  styleUrls: ["./shared-auth-popup.component.scss"],
})
export class SharedAuthPopUpComponent implements OnInit {
  @Input() flow: string;
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void { }


  togglePopUp(value) {
    this.flow = value.replace('/', '')
  }

  otpSuccessPopUp(value) {
    this.flow = null;
    this.removeAuthComponent();
  }

  removeAuthComponent() {
    this.removeAuthComponent$.emit();
  }

  onBackClick(value) {
    this.flow = value.replace('/', '')
  }
}

@NgModule({
  declarations: [SharedAuthPopUpComponent],
  imports: [
    CommonModule,
    SharedAuthModule,
    RouterModule,
    BottomMenuModule
  ],
  exports: [
    SharedAuthPopUpComponent
  ],
  providers: [
    SocialAuthService
  ]
})
export class AuthPopUpModule { }
