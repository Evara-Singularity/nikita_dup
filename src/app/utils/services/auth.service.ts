/**
 * Created by kuldeep on 09/06/17.
 */

import { EventEmitter, Injectable } from "@angular/core";
import { LocalStorageService, SessionStorageService } from "ngx-webstorage";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LocalAuthService{
    // public login$ = new EventEmitter();
    public login$: Subject<any> = new Subject<any>();
    public logout$ = new EventEmitter();
    pageHistory = {};
    constructor(private _sessionStorageService: SessionStorageService, private _localStorageService: LocalStorageService){ }

    getUserSession(){
        return this._localStorageService.retrieve('user');
    }

    setUserSession(data){
        this._localStorageService.store('user', data);
    }

    setPageInfo(pageName, info){
        this.pageHistory['pageName'] = info;
        this._sessionStorageService.store(pageName, JSON.stringify(info));
    }

    removePageInfo(pageName){
        this._sessionStorageService.clear(pageName);
        delete this.pageHistory[pageName];
    }

    getPageInfo(pageName){
        let info = this._sessionStorageService.retrieve(pageName);
        if(info){
            return JSON.parse(info);
        }else{
            info = this.pageHistory[pageName];
            return info?info:null;
        }
    }
}