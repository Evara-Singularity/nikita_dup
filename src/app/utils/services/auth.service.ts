import { Router } from '@angular/router';
import { EventEmitter, Injectable } from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Observable, Subject } from "rxjs";
import { AuthFlowType } from '../models/auth.modals';

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
        private _router:Router)
    {
    }

    getUserSession()
    {
        return this._localStorageService.retrieve('user');
    }

    setUserSession(data)
    {
        this._localStorageService.store('user', data);
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

    handleBackURL(isClear?)
    {
        const BACKURLTITLE = this.getBackURLTitle();
        let NAVIGATE_TO = (BACKURLTITLE && BACKURLTITLE['backurl']) || "/";
        const URL = (this._router.url as string).toLowerCase();
        if (URL.toLowerCase().includes("login") || isClear) {
            this.clearBackURLTitle();
            this.clearAuthFlow();
        }
        this._router.navigateByUrl(NAVIGATE_TO);
    }

    isUserLoggedIn()
    {
        const USER_SESSION = this._localStorageService.retrieve('user');
        if (USER_SESSION && USER_SESSION['authenticated'] == "true") {
            return true;
        }
        return false;
    }
}