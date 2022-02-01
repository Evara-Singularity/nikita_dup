import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { SharedAuthService } from '../shared-auth-v1/shared-auth.service';

@Component({
  selector: 'checkout-login-v2',
  templateUrl: './checkout-login-v2.component.html',
  styleUrls: ['./checkout-login-v2.component.scss']
})
export class CheckoutLoginV2Component implements OnInit {

  readonly LOGIN_TAB = this._sharedAuthService.LOGIN_TAB;
  readonly SIGN_UP_TAB = this._sharedAuthService.SIGN_UP_TAB;
  readonly OTP_TAB = this._sharedAuthService.OTP_TAB;;
  readonly FORGET_PASSWORD_TAB = this._sharedAuthService.FORGET_PASSWORD_TAB;

  CURRENT_TAB = this._sharedAuthService.LOGIN_TAB;

  constructor(
    private _sharedAuthService: SharedAuthService,
    private _commonService: CommonService,
  ) { }

  ngOnInit() {
    this.commonSubscriber();
  }

  commonSubscriber() {
    if (this._commonService.isBrowser) {
      this._sharedAuthService.getCheckoutTab().subscribe(tab => {
        // this condition is to handle the case when user is at checkout login page and clicks on back button from header
        if(tab == this.LOGIN_TAB){
          this._sharedAuthService.isAtCheckoutLoginFirstTab = true;
        }else{
          this._sharedAuthService.isAtCheckoutLoginFirstTab = false;
        }
        this.CURRENT_TAB = tab;
      })
    }
  }

}
