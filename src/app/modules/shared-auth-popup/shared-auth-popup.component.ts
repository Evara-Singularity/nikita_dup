import { Router, RouterModule } from '@angular/router';
import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAuthModule } from '../shared-auth-v1/shared-auth.module';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';
import { SharedAuthUtilService } from '../shared-auth-v1/shared-auth-util.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { LocalStorageService } from 'ngx-webstorage';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: "auth",
  templateUrl: "./shared-auth-popup.component.html",
  styleUrls: ["./shared-auth-popup.component.scss"],
})
export class SharedAuthPopUpComponent implements OnInit,OnDestroy, AfterViewInit {
  @Input() flow: string;
  @Input() redirectUrl: string = null;
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _sharedAuthUtilService: SharedAuthUtilService, 
    private _localAuthService: LocalAuthService, 
    public localStorageService: LocalStorageService,
    private _commonService: CommonService,
    private _router: Router ) { }

  ngOnInit(): void { 
    this._sharedAuthUtilService.sendLoginPopUpTracking();
  }

  ngAfterViewInit(): void {
    this._commonService.setBodyScroll(null, false);
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
    let userSession = this.localStorageService.retrieve('user');
    if(this.redirectUrl && userSession && userSession.authenticated == "true" ){
      this._router.navigateByUrl(this.redirectUrl);
    }
    this._commonService.setBodyScroll(null, true);
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
