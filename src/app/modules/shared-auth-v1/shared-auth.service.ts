import { Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import CONSTANTS from '../../config/constants';
import { DataService } from '../../utils/services/data.service';
import { SharedAuthUtilService } from './shared-auth-util.service';
const BASEURL = CONSTANTS.NEW_MOGLIX_API;

/**
 * TODO:Device information to be passed-1809
 */

@Injectable({ providedIn: 'root' })
export class SharedAuthService implements OnInit
{

    readonly AUTH_USING_PHONE = 'AUTH_USING_PHONE';
    readonly AUTH_USING_EMAIL = 'AUTH_USING_EMAIL';
    readonly AUTH_SIGNUP_FLOW = 'AUTH_SIGNUP';
    readonly AUTH_LOGIN_FLOW = 'AUTH_LOGIN';
    readonly AUTH_LOGIN_BY_OTP = 'AUTH_LOGIN_BY_OTP';
    readonly AUTH_LOGIN_BY_PASSWORD = 'AUTH_LOGIN_BY_PASSWORD';
    readonly AUTH_SINGUP_BY_PHONE = 'AUTH_SIGNUP_BY_PHONE';
    readonly AUTH_SINGUP_BY_EMAIL = 'AUTH_SINGUP_BY_EMAIL';
    readonly HOME_URL = "/";
    //checkout purpose
    readonly LOGIN_TAB = 'LOGIN_TAB';
    readonly SIGN_UP_TAB = 'SIGN_UP_TAB';
    readonly OTP_TAB = 'OTP_TAB';
    readonly FORGET_PASSWORD_TAB = 'FORGET_PASSWORD_TAB';

    private readonly BASEURLS = {
        GETOTP: { method: 'POST', url: BASEURL + ENDPOINTS.LOGIN_URL },
        VALIDATEOTP: { method: 'POST', url: BASEURL + ENDPOINTS.LOGIN_OTP },
        SIGNUP: { method: 'POST', url: BASEURL + ENDPOINTS.SIGN_UP },
        USEREXISTS: { method: 'POST', url: BASEURL + ENDPOINTS.VERIFY_CUSTOMER },
        AUTHENTICATE: { method: 'POST', url: BASEURL + ENDPOINTS.LOGIN_AUTHENTICATE },
        UPDATEPASSWORD: { method: 'POST', url: BASEURL + ENDPOINTS.FORGOT_PASSWORD },
    }
    private _checkoutTabChage: Subject<string> = new Subject<string>();
    isAtCheckoutLoginFirstTab: boolean = true;
    

    redirectUrl = this.HOME_URL;

    constructor(private dataService: DataService, private _activatedRoute: ActivatedRoute,
        private _globalLoader: GlobalLoaderService, private _sharedAuthUtilService: SharedAuthUtilService)
    { }

    ngOnInit()
    {
        //TODO:handle for checkout
        this._activatedRoute.queryParams.subscribe(
            data => { this.redirectUrl = data['backurl'] || this.HOME_URL; }
        );
    }

    isUserExist(userData)
    {
        return this.dataService.callRestful(this.BASEURLS.USEREXISTS.method, this.BASEURLS.USEREXISTS.url, { body: userData });
    }

    sendOTP(data): Observable<any>
    {
        data['device'] = CONSTANTS.DEVICE.device;
        return this.dataService.callRestful(this.BASEURLS.GETOTP.method, this.BASEURLS.GETOTP.url, { body: data });
    }

    validateOTP(data): Observable<any>
    {
        return this.dataService.callRestful(this.BASEURLS.VALIDATEOTP.method, this.BASEURLS.VALIDATEOTP.url, { body: data });
    }

    signUp(data)
    {
        data['device'] = CONSTANTS.DEVICE.device;
        return this.dataService.callRestful(this.BASEURLS.SIGNUP.method, this.BASEURLS.SIGNUP.url, { body: data });
    }

    authenticate(data)
    {
        console.trace();
        data['device'] = CONSTANTS.DEVICE.device;
        data['buildVersion'] = environment.buildVersion;
        return this.dataService.callRestful(this.BASEURLS.AUTHENTICATE.method, this.BASEURLS.AUTHENTICATE.url, { body: data });
    }

    updatePassword(data)
    {
        data['device'] = CONSTANTS.DEVICE.device;
        return this.dataService.callRestful(this.BASEURLS.UPDATEPASSWORD.method, this.BASEURLS.UPDATEPASSWORD.url, { body: data });
    }

    soicalAuthenticate(params) {
        params['device'] = CONSTANTS.DEVICE.device;
        let curl = CONSTANTS.NEW_MOGLIX_API + CONSTANTS.SL.API;
        return this.dataService.callRestful("POST", curl, { body: params });
    }

    emitCheckoutChangeTab(string) {
        this._checkoutTabChage.next(string);
    }

    getCheckoutTab(): Observable<string>
    {
        return this._checkoutTabChage.asObservable();
    }

    resetCheckoutLoginSteps(){
        this._checkoutTabChage.next(this.LOGIN_TAB);
    }

}
