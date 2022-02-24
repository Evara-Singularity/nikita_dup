import { Component, Input, OnInit } from '@angular/core';
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
  @Input('isCheckout') isCheckout = false;

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
            this._localAuthService.setUserSession(userResponse);
            this._sharedAuthUtilService.processAuthentication(userResponse, this.isCheckout, this._sharedAuthService.redirectUrl);       
          }
        }, (error) => {
          console.log('social sign in error', error);
        });
      }
    );
  }

}
