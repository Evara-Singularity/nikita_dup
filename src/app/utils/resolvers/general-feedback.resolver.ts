import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { ServerLogSchema } from '../models/log.modal';
import { LocalAuthService } from '../services/auth.service';
import { CommonService } from '../services/common.service';

@Injectable({
    providedIn: 'root'
})
export class GeneralFeedbackResolver implements Resolve<any> {

    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private http: HttpClient,
        private _loggerService : LoggerService,
        private _commonService : CommonService
    )
    { }

    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        const startTime = new Date().getTime();
        const ITEM_ID = _activatedRouteSnapshot.params['itemid'];
        const GENERAL_FEEDBACK_KEY = makeStateKey<any>('GFDST');
        if (this.transferState.hasKey(GENERAL_FEEDBACK_KEY)) {
            const response = this.transferState.get<any>(GENERAL_FEEDBACK_KEY, null);
            this.transferState.remove(GENERAL_FEEDBACK_KEY);
            return of(response);
        }
        else {
            const url = CONSTANTS.NEW_MOGLIX_API + '/quest/getRtoDetailsByItemId?itemId=' + ITEM_ID;
            return this.http.get(url)
                .pipe(
                    catchError((err) => { return of(err); }),
                    tap(response =>
                    {
                        if (isPlatformServer(this.platformId)) {
                            this.transferState.set(GENERAL_FEEDBACK_KEY, response);
                        }
                    }), map((res)=>{
                        const logInfo =  this._commonService.getLoggerObj(url,'GET',startTime)
                        logInfo.endDateTime = new Date().getTime();
                        logInfo.responseStatus = res["status"];
                        this._loggerService.apiServerLog(logInfo);
                        return res;
                    })
                )
        }
    }
}