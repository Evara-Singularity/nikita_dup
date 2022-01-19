import { Injectable, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { environment } from 'environments/environment';
import { LocalStorageService } from 'ngx-webstorage';
import { Observable } from 'rxjs/Observable';
import CONSTANTS from '../../config/constants';
import { DataService } from '../../utils/services/data.service';
import { AuthFlowType } from './modals';
import { SharedAuthUtilService } from './shared-auth-util.service';
const BASEURL = CONSTANTS.NEW_MOGLIX_API;

/**
 * TODO:Device information to be passed-1809
 */

@Injectable({
    providedIn: 'root'
})
export class SharedAuthService implements OnInit
{

    readonly AUTH_USING_PHONE = 'AUTH_USING_PHONE';
    readonly AUTH_USING_EMAIL = 'AUTH_USING_EMAIL';
    readonly AUTH_SIGNUP_FLOW = 'AUTH_SIGNUP';
    readonly AUTH_LOGIN_FLOW = 'AUTH_LOGIN';
    readonly AUTH_LOGIN_BY_OTP = 'AUTH_LOGIN_BY_OTP';
    readonly AUTH_LOGIN_BY_PASSWORD = 'AUTH_LOGIN_BY_PASSWORD';
    readonly HOME_URL = "/";

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
    redirectUrl = this.HOME_URL;

    constructor(private dataService: DataService, private _activatedRoute: ActivatedRoute,
        private _globalLoader: GlobalLoaderService, private _sharedAuthUtilService: SharedAuthUtilService) { }

    ngOnInit()
    {
        //TODO:handle for checkout
        this._activatedRoute.queryParams.subscribe(
            data => { this.redirectUrl = data['backurl'] || this.HOME_URL; }
        );
    }

    set authIdentifierType(identifier)
    {
        this._authIdentifierType = identifier;
    }

    get authIdentifierType()
    {
        return this._authIdentifierType
    }

    set authFlowType(type)
    {
        this._authFlowType = type;
    }

    get authFlowType()
    {
        return this._authFlowType;
    }

    set authIdentifier(type)
    {
        this._authIdentifier = type;
    }

    get identifier()
    {
        return this._authIdentifier;
    }

    isUserExist(userData)
    {
        return this.dataService.callRestful(this.BASEURLS.USEREXISTS.method, this.BASEURLS.USEREXISTS.url, { body: userData });
    }

    sendOTP(data)
    {
        data['device'] = CONSTANTS.DEVICE.device;
        return this.dataService.callRestful(this.BASEURLS.GETOTP.method, this.BASEURLS.GETOTP.url, { body: data });
    }

    validateOTP(data): Observable<any>
    {
        return this.dataService.callRestful(this.BASEURLS.VALIDATEOTP.method, this.BASEURLS.VALIDATEOTP.url, { body: data });
    }

    sendOtp(data): Observable<any>
    {
        data['device'] = CONSTANTS.DEVICE.device;
        return this.dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGIN_URL, { body: data });
    }

    signUp(data)
    {
        data['device'] = CONSTANTS.DEVICE.device;
        return this.dataService.callRestful(this.BASEURLS.SIGNUP.method, this.BASEURLS.SIGNUP.url, { body: data });
    }

    authenticate(data)
    {
        data['device'] = CONSTANTS.DEVICE.device;
        data['buildVersion'] = environment.buildVersion;
        return this.dataService.callRestful(this.BASEURLS.AUTHENTICATE.method, this.BASEURLS.AUTHENTICATE.url, { body: data });
    }

    updatePassword(data)
    {
        return this.dataService.callRestful(this.BASEURLS.UPDATEPASSWORD.method, this.BASEURLS.UPDATEPASSWORD.url, { body: data });
    }

    authenticateUser(request, isCheckout)
    {
        this._globalLoader.setLoaderState(true);
        this.authenticate(request).subscribe(
            (response) =>
            {
                if (response['statusCode'] !== undefined && response['statusCode'] === 500) {
                    // no toast required 
                    // this.toastService.show({ type: 'error', text: response['status'] });
                } else {
                    this._sharedAuthUtilService.processAuthentication(response, isCheckout, this.redirectUrl);
                }
                this._globalLoader.setLoaderState(false);
            },
            (error) => { this._globalLoader.setLoaderState(false); }
        )
    }
}
