import { Router } from '@angular/router';
import { EventEmitter, Injectable } from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Subject } from "rxjs";
import { AuthFlowType } from '../models/auth.modals';
import { HttpClient } from '@angular/common/http';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';


@Injectable({
    providedIn: 'root'
})
export class LocalAuthService
{
    // public login$ = new EventEmitter();
    public login$: Subject<any> = new Subject<any>();
    public logout$ = new EventEmitter();
    pageHistory = {};
    constructor(private _sessionStorageService: SessionStorageService, private _localStorageService: LocalStorageService,
        private _router:Router, private http: HttpClient)
    {
    }

    getUserSession()
    {
        return this._localStorageService.retrieve('user');
    }

    setUserSession(data)
    {
        this._localStorageService.store('user', data);
        this.updateUserLanguagePrefrence(data);
    }

    setPageInfo(pageName, info)
    {
        this.pageHistory['pageName'] = info;
        this._sessionStorageService.store(pageName, JSON.stringify(info));
    }

    removePageInfo(pageName)
    {
        this._sessionStorageService.clear(pageName);
        delete this.pageHistory[pageName];
    }

    getPageInfo(pageName)
    {
        let info = this._sessionStorageService.retrieve(pageName);
        if (info) {
            return JSON.parse(info);
        } else {
            info = this.pageHistory[pageName];
            return info ? info : null;
        }
    }

    setBackURLTitle(backurl, title?)
    {
        const sAuthHeader = { backurl: backurl, title: title ? title : "" };
        this._sessionStorageService.store('sAuthHeader', sAuthHeader);
    }

    getBackURLTitle()
    {
        return this._sessionStorageService.retrieve('sAuthHeader');
    }

    clearBackURLTitle()
    {
        this._sessionStorageService.clear("sAuthHeader");
    }

    setAuthFlow(isUserExists, flowType, authIdentifierType, authIdentifier, data = null)
    {
        const MAUTH: AuthFlowType = { isUserExists: isUserExists, flowType: flowType, identifierType: authIdentifierType, identifier: authIdentifier, data: data };
        this.clearAuthFlow();
        this._sessionStorageService.store("authflow", MAUTH);
    }

    getAuthFlow(): AuthFlowType { return this._sessionStorageService.retrieve("authflow"); }

    clearAuthFlow() { this._sessionStorageService.clear("authflow"); }

    handleBackURL(isClear?) {
        const BACKURLTITLE = this.getBackURLTitle();
        let userSession = this._localStorageService.retrieve('user');
        let NAVIGATE_TO = (BACKURLTITLE && BACKURLTITLE['backurl']) || "/";
        const URL = (this._router.url as string).toLowerCase();
        if (URL.toLowerCase().includes("login") || isClear) {
            this.clearBackURLTitle();
            this.clearAuthFlow();
        }
        if (userSession && userSession.authenticated == "true") {
            this._router.navigateByUrl(NAVIGATE_TO);
        } else {
            this._router.navigateByUrl('/');
        }
    }

    isUserLoggedIn()
    {
        const USER_SESSION = this._localStorageService.retrieve('user');
        if (USER_SESSION && USER_SESSION['authenticated'] == "true") {
            return true;
        }
        return false;
    }
 
    IsUserGoldMember(){
        if(this.getUserSession()){
            if (this.getUserSession().customerCategory) {
                return true
            }else{
               return false 
            }
        }else
            return false;
         
    }

    private updateUserLanguagePrefrence(userSession) {
        const userlang = this._localStorageService.retrieve("languagePrefrence") || 'en';
        if (
          userSession &&
          userSession["authenticated"] == "true" &&
          userlang != null &&
          userlang != userSession["preferredLanguage"]
        ) {
            this._localStorageService.store('languagePrefrence', userlang || 'en');
            const params = "customerId=" + userSession["userId"] + "&languageCode=" + userlang;
            this.postUserLanguagePrefrence(params, userSession);
        }
    }
    
    private postUserLanguagePrefrence(params, userSession){
        const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
        };
        headers['x-access-token'] = (userSession != null && userSession.token != undefined) ? userSession.token : '';
        headers['x-request-id'] = (userSession != null && userSession.sessionId != undefined) ? userSession.sessionId : '';
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPDATE_CUSTOMER_LANGUAGE_PREFRENCE + params;
        this.http.post(url, null, { headers, withCredentials: true }).subscribe(result=>{
            if(result && result['status'] == true){
              const selectedLanguage = result['data'] && result['data']['languageCode'];
              this._localStorageService.store("languagePrefrence", selectedLanguage);
              const newUserSession = Object.assign({}, this.getUserSession());
              newUserSession.preferredLanguage = selectedLanguage;
              this.setUserSession(newUserSession);
            }
          },err=>{
            console.log("postUserLanguagePrefrence API : " , err);
          })
    }
}