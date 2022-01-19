import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ENDPOINTS } from '@app/config/endpoints';
import CONSTANTS from '../../config/constants';
import { DataService } from '../../utils/services/data.service';

const BASEURL = CONSTANTS.NEW_MOGLIX_API;

@Injectable({
  providedIn: 'root'
})
export class SharedAuthService {

  readonly AUTH_USING_PHONE = 'AUTH_USING_PHONE';
  readonly AUTH_USING_EMAIL = 'AUTH_USING_EMAIL';
  readonly AUTH_SIGNUP_FLOW = 'AUTH_SIGNUP';
  readonly AUTH_LOGIN_FLOW = 'AUTH_LOGIN';
  readonly AUTH_LOGIN_BY_OTP = 'AUTH_LOGIN_BY_OTP';
  readonly AUTH_LOGIN_BY_PASSWORD = 'AUTH_LOGIN_BY_PASSWORD';

  private readonly BASEURLS = {
    GETOTP: { method: 'POST', url: BASEURL + ENDPOINTS.LOGIN_URL },
    VALIDATEOTP: { method: 'POST', url: BASEURL + ENDPOINTS.LOGIN_OTP },
    SIGNUP: { method: 'POST', url: BASEURL + ENDPOINTS.SIGN_UP },
    USEREXISTS: { method: 'POST', url: BASEURL + ENDPOINTS.VERIFY_CUSTOMER },
    AUTHENTICATE: { method: 'POST', url: BASEURL + ENDPOINTS.LOGIN_AUTHENTICATE },
    UPDATEPASSWORD: { method: 'POST', url: BASEURL + ENDPOINTS.FORGOT_PASSWORD },
  }

  private _authIdentifierType: 'AUTH_USING_PHONE' | 'AUTH_USING_EMAIL' = null;
  private _authFlowType: 'AUTH_SIGNUP' | 'AUTH_LOGIN' = null;
  private _authIdentifier: string | number = null;

  constructor(private dataService: DataService) { }

  set authIdentifierType(identifier) {
    this._authIdentifierType = identifier;
  }

  get authIdentifierType() {
    return this._authIdentifierType
  }

  set authFlowType(type) {
    this._authFlowType = type;
  }

  get authFlowType() {
    return this._authFlowType;
  }

  set authIdentifier(type) {
    this._authIdentifier = type;
  }

  get identifier() {
    return this._authIdentifier;
  }

  isUserExist(userData) {
    return this.dataService.callRestful(this.BASEURLS.USEREXISTS.method, this.BASEURLS.USEREXISTS.url, { body: userData });
  }

  getOTP(data) {
    data['device'] = CONSTANTS.DEVICE.device;
    return this.dataService.callRestful(this.BASEURLS.GETOTP.method, this.BASEURLS.GETOTP.url, { body: data });
  }

  validateOTP(data): Observable<any> {
    return this.dataService.callRestful(this.BASEURLS.VALIDATEOTP.method, this.BASEURLS.VALIDATEOTP.url, { body: data });
  }


  sendOtp(data): Observable<any> {
    data['device'] = CONSTANTS.DEVICE.device;
    return this.dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGIN_URL, { body: data });
  }

  signUp(data) {
    data['device'] = CONSTANTS.DEVICE.device;
    return this.dataService.callRestful(this.BASEURLS.SIGNUP.method, this.BASEURLS.SIGNUP.url, { body: data });
  }

  authenticate(data) {
    data['device'] = CONSTANTS.DEVICE.device;
    return this.dataService.callRestful(this.BASEURLS.AUTHENTICATE.method, this.BASEURLS.AUTHENTICATE.url, { body: data });
  }

  updatePassword(data) {
    return this.dataService.callRestful(this.BASEURLS.UPDATEPASSWORD.method, this.BASEURLS.UPDATEPASSWORD.url, { body: data });
  }

}
