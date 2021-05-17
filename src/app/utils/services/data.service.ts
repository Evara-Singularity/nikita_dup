import { Injectable } from '@angular/core';
import { Injector } from '@angular/core'
import { Subject } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import { Router, NavigationStart } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { filter } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { LocalAuthService } from './auth.service';
import { ToastMessageService } from '../../modules/toastMessage/toast-message.service';
import CONSTANTS from '../../config/constants';


declare let $: any;

@Injectable({
    providedIn: 'root'
})
export class DataService {
    api: any;
    isServer: boolean = typeof window !== "undefined" ? false : true;
    history = [];
    socket: any;
    public dataServiceCart: Subject<any> = new Subject<any>();
    private getSessionApi: any;

    constructor(
        private _tms: ToastMessageService,
        public injector: Injector,
        private _router: Router,
        private _http: HttpClient,
        private _localAuthService: LocalAuthService,
        private _localStorageService: LocalStorageService) {
        if (!this.isServer) {
            this.socket = <Socket>this.injector.get(Socket);
        }
    }

    startHistory() {
        localStorage.setItem("previousUrl", window.location.pathname + "$$$" + localStorage.getItem("previousUrl"))
        this._router.events
            .pipe(
                filter((evt) => evt instanceof NavigationStart)
            )
            .subscribe((rData) => {
                localStorage.setItem("previousUrl", rData["url"] + "$$$" + localStorage.getItem("previousUrl"));
                var url = localStorage.getItem("previousUrl");
                if (url.split("$$$").length > 3) {
                    var arr = url.split("$$$");
                    arr.length = 3;
                    localStorage.setItem("previousUrl", arr.join("$$$"));
                }
            });
    }

    callRestfulWithFormData(method, url: string, obj): any {
        const userSession = this._localAuthService.getUserSession();
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('x-access-token', (userSession != null && userSession.token != undefined) ? userSession.token : '');
        xhr.setRequestHeader('x-request-id', (userSession != null && userSession.sessionId != undefined) ? userSession.sessionId : '');
        xhr.send(obj);
        return xhr;
    }
    sendMessage(msg: any) {
        if (navigator && navigator.userAgent.indexOf("Googlebot") === -1) {
            var userSession = this._localAuthService.getUserSession();
            const previousUrl = localStorage.getItem("previousUrl");
            let prevUrl;
            if (previousUrl) {
                prevUrl = previousUrl.split("$$$").length >= 2 ? localStorage.getItem("previousUrl").split("$$$")[1] : "";
            }
            var trackingData = {
                message: (msg.message) ? msg.message : "tracking",
                session_id: userSession ? userSession.sessionId : null,
                cookie: "",
                user_id: userSession ? userSession.userId : null,
                url: document.location.href,
                device: "Mobile",
                ip_address: null,
                user_agent: navigator.userAgent,
                timestamp: new Date().getTime(),
                referrer: document.referrer,
                previous_url: prevUrl
            }
            this.socket.emit("track", { ...trackingData, ...msg });
        }
    }
    getMessage() {
        return this.socket
            .fromEvent("track")
            .pipe(map(data => data));
    }

    callRestful(type: string, url: string, options?: { params?: {}, body?: {}, headerData?: {} }) {
        /* if(this.isServer){
            // console.log("URL: "+ url + ", Type: " + type);
        } */
        const userSession = this._localAuthService.getUserSession();
        // let requestOptionArgs = {};
        let params;
        let body;

        if (options != undefined && options['params'] != undefined)
            params = options['params'];
        if (options != undefined && options['body'] != undefined)
            body = options['body'];

        let headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
        };

        headers['x-access-token'] = (userSession != null && userSession.token != undefined) ? userSession.token : '';
        headers['x-request-id'] = (userSession != null && userSession.sessionId != undefined) ? userSession.sessionId : '';
        if (options && options.headerData && Object.keys(options.headerData).length) {

            if (options.headerData['contentType']) {
                headers['contentType'] = options.headerData['contentType'];
            }
            if (options.headerData['processData']) {
                headers['processData'] = options.headerData['processData'];
            }
            if (options.headerData['Content-Type']) {
                headers['Content-Type'] = options.headerData['Content-Type'];
            }
            if (options.headerData['mimeType']) {
                headers['mimeType'] = options.headerData['mimeType'];
            }
            if (options.headerData['Access-Control-Allow-Methods']) {
                headers['Access-Control-Allow-Methods'] = options.headerData['Access-Control-Allow-Methods'];
            }
        }

        const start_time = new Date().getTime();

        switch (type) {
            case 'GET':
                let getOptions = {};
                if (headers['Content-Type'] && headers['Content-Type'].indexOf('text') > -1) {
                    getOptions = { params: params, headers: headers, responseType: 'text', withCredentials: true };
                } else {
                    getOptions = { params, headers, withCredentials: true };
                }

                return this._http.get(url, getOptions).pipe(map(res => {
                    const request_time = new Date().getTime() - start_time;
                    return res;
                }), catchError(err => this.handleError(err)));
            case 'POST':
                return this._http.post(url, body, { headers, withCredentials: true }).pipe(map(res => {
                    const request_time = new Date().getTime() - start_time;
                    return res;
                }), catchError(err => this.handleError(err)));
            case 'PUT':
                return this._http.put(url, body, { headers, withCredentials: true }).pipe(map(res => res), catchError(err => this.handleError(err)));
            case 'DELETE':
                return this._http.delete(url, { headers, withCredentials: true }).pipe(map(res => res), catchError(err => this.handleError(err)));
            default:
                return null;
        }
    }
    private handleError(error: HttpErrorResponse | any) {
        if (error.status === 403) {
            this._localStorageService.clear('user');
            this.getSession().subscribe((res) => {
                if (res['statusCode'] !== undefined && res['statusCode'] === 500) {
                    alert('something went wrong, please try to refresh the page');
                } else {
                    this._localAuthService.setUserSession(res);
                    this.dataServiceCart.next(res['cart'] !== undefined ? res['cart']['noOfItems'] : 0);
                    this._localAuthService.logout$.emit();
                    this._router.navigate(['']);
                }
            });
        }
        else if (error.status == 401) {
            debugger;
            if (this.getSessionApi == undefined) {
                this.getSessionApi = this.getSession();
                this._localStorageService.clear("user");
                this.getSessionApi
                    .pipe(take(1))
                    .subscribe((res) => {
                        console.log("Error-401: getsession called");
                        if (res['statusCode'] != undefined && res['statusCode'] == 500) {
                            alert("something went wrong, please try to refresh the page");
                        } else {
                            this._localAuthService.setUserSession(res);
                            this._localAuthService.logout$.emit();
                            this._tms.show({ type: 'success', text: "Your session has expired , please login again", tDelay: 5000 });
                            this._router.navigateByUrl('/login');
                        }
                        this.getSessionApi = undefined;
                    });
            }

        } else {
            this.showMessage('error', 'Something went wrong');
        }
        return throwError(error);
    }

    logError(error: any) {

    }

    showMessage(cssClass, msg) {
        if (!this.isServer) {
            const x = document.getElementById('alert-box');
            let classType = '';
            x.innerHTML = msg;
            if (cssClass === 'error') {
                classType = 'show-error';
            }
            if (cssClass === 'success') {
                classType = 'show-sucess';
            }
            x.className = classType;
            setTimeout(function () {
                x.className = x.className.replace(classType, '');
            }, 5000);
        }

    }

    public getCookie(name: string) {
        // TODO test split and value
        if (!this.isServer) {
            let ca: Array<string> = document.cookie.split('; ');
            let caLen: number = ca.length;
            let cookieName = name + "=";
            let c: string;

            for (let i: number = 0; i < caLen; i += 1) {
                c = ca[i].replace(/^\s\+/g, "");
                if (c.indexOf(cookieName) == 0) {
                    return c.substring(cookieName.length, c.length);
                }
            }
        }
        return "";
    }

    public deleteCookie(name) {
        this.setCookie(name, "", -1);
    }

    public setCookie(name: string, value: string, expireDays: number) {
        if (!this.isServer) {
            let d: Date = new Date();
            d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
            let expires: string = "expires=" + d.toUTCString();
            document.cookie = name + "=" + value + "; " + expires + ";";
        }
    }

    public timestampToData(ts) {
        let d = new Date(ts);
        let dd: any = d.getDate();
        let mm: any = (d.getMonth() + 1);
        let yy = d.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return dd + '-' + mm + '-' + yy;
    }

    public getTimeFromTimestamp(ts, isNoTime?: boolean) {

    }

    getSession() {
        return this.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/session/getSession");
    }

}
