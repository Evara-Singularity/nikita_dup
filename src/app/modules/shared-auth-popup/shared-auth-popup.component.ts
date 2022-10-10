import { Router, RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { SharedAuthUtilService } from '../shared-auth-v1/shared-auth-util.service';
import { LocalAuthService } from '@app/utils/services/auth.service';

@Component({
  selector: "auth",
  templateUrl: "./shared-auth-popup.component.html",
  styleUrls: ["./shared-auth-popup.component.scss"],
})
export class SharedAuthPopUpComponent implements OnInit,OnDestroy {
  @Input() flow: string;
  @Input() redirectUrl: string = null;
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _sharedAuthUtilService: SharedAuthUtilService, 
    private _localAuthService: LocalAuthService, 
    private _router: Router ) { }

  ngOnInit(): void { 
    console.log('change flow ==>', this.redirectUrl);
    this._sharedAuthUtilService.sendLoginPopUpTracking();
  }


  togglePopUp(value) {
    
    this.flow = value;
  }

  otpSuccessPopUp(value) {
    this.flow = null;
    this.removeAuthComponent();
  }

  onUpdate($event) {
    this.removeAuthComponent$.emit();
  }

  removeAuthComponent() {
    if(this.redirectUrl){
      this._router.navigateByUrl(this.redirectUrl);
    }
    this.removeAuthComponent$.emit();
  }

  ngOnDestroy(): void {
    this._localAuthService.clearBackURLTitle();
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
  ]
})
export class AuthPopUpModule { }
