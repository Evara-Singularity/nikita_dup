import { SharedAuthService } from '../../modules/shared-auth-v1/shared-auth.service';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: "auth",
  templateUrl: "./auth-popup.component.html",
  styleUrls: ["./auth-popup.component.scss"],
})
export class AuthPopUpComponent implements OnInit {
  @Output() closePopUp$: EventEmitter<any> = new EventEmitter<any>();
  @Output() nextPopUpName$: EventEmitter<any> = new EventEmitter<any>();
  @Output() otpPopUpSuccess$: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButtonClicked$: EventEmitter<any> = new EventEmitter<any>();
  @Input() flow: string;

  // flow = "login"
  isCheckout = false;
  constructor(
    private _router: Router,
    private _sharedAuthService: SharedAuthService
  ) {}

  ngOnInit(): void {
    // this.flow = this.removeQueryParams(this._router.url).split("/")[1];
  }

  removeQueryParams(url){
    return url.split("?")[0];
  }

  closePopup() {
    this.closeVariant2Popup();
  }

  closeVariant2Popup() {
    this.closePopUp$.emit();
  }

  navigateToNextPopUp(value) {
    this.nextPopUpName$.emit(value);
  }

  otpSuccessPopUp() {
    this.otpPopUpSuccess$.emit();
  }

  onBackClick() {
    this.backButtonClicked$.emit();
  }
}
