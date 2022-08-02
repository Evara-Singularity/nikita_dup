import { SharedAuthService } from '../../modules/shared-auth-v1/shared-auth.service';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: "auth",
  templateUrl: "./auth-popup.component.html",
  styleUrls: ["./auth-popup.component.scss"],
})
export class AuthPopUpComponent implements OnInit {
  @Input() flow: string;
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}


  togglePopUp(value) {
    this.flow = value.replace('/','')
  }

  otpSuccessPopUp(value) {
    this.flow = null;
    this.removeAuthComponent();
  }

  removeAuthComponent(){
    this.removeAuthComponent$.emit();
  }

  onBackClick(value) {
    this.flow = value.replace('/','')
  }
}
