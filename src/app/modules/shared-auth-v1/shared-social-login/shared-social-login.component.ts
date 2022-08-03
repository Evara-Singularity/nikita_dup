import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { environment } from 'environments/environment';
import { SharedAuthUtilService } from '../shared-auth-util.service';
import { SharedAuthService } from '../shared-auth.service';
@Component({
  selector: 'shared-social-login',
  templateUrl: './shared-social-login.component.html',
  styleUrls: ['./shared-social-login.component.scss']
})
export class SharedSocialLoginComponent implements OnInit {
  readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
  readonly CHECKOUT_ADDRESS = "/checkout/address";
  @Input('isCheckout') isCheckout = false;
  @Input('isLoginPopup') isLoginPopup;
  @Output() removeAuthComponent$: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _socialAuthService: SocialAuthService,
    private _sharedAuthService: SharedAuthService,
    private _localAuthService: LocalAuthService,
    private _sharedAuthUtilService: SharedAuthUtilService
  ) { }

  ngOnInit() {
  }

  signInWithGoogle(): void {
    console.log('Google Login');

    this._socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(
      (data) => {

        let params = {
          phone: "",
          email: data["email"],
          token: data["authToken"],
          firstName: data["name"],
          lastName: "",
          userId: data["id"],
          idToken: (data["idToken"]) ? data["idToken"] : '',
          source: (data["provider"] + '').toLowerCase(),
          buildVersion: environment.buildVersion // for Login OTP for backed end tracking
        };

        this._sharedAuthService.soicalAuthenticate(params).subscribe((userResponse) => {
          if (userResponse["statusCode"] != undefined && userResponse["statusCode"] == 500) {
            this._sharedAuthUtilService.logoutUserOnError();
          } else {
            const backURLTitle = this._localAuthService.getBackURLTitle();
            const redirectUrl  = (backURLTitle && backURLTitle['backurl']) || this._sharedAuthService.redirectUrl;
            this._localAuthService.clearBackURLTitle();
            this._localAuthService.setUserSession(userResponse);
            this._sharedAuthUtilService.processAuthentication(
              userResponse,
              this.isCheckout,
                (this.isCheckout) ? this.CHECKOUT_ADDRESS : redirectUrl
            );
              this.removeAuthComponent$.emit();
          }
        }, (error) => {
          console.log('social sign in error', error);
        });
      }
    );
  }

}
