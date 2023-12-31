import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GlobalLoaderService } from '../services/global-loader.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class CorporateGiftingResolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService,
    private _commonService : CommonService,
    private _loggerService : LoggerService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    const STATE_KEY = makeStateKey<object>('layoutId-corporate-gifting');
    const startTime = new Date().getTime();
    if (this.transferState.hasKey(STATE_KEY)) {
      const stateObj = this.transferState.get<object>(STATE_KEY, null);
      this.transferState.remove(STATE_KEY);
      return of([stateObj]);
    } else {
      this.loaderService.setLoaderState(true);
      const URL = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_PARENT_CATEGORY_JSON_BODY;
      const queryParams = {
        'requestType': 'corporate-gifting_d'
      }
      const stateObs = this.http.get(URL, { params: queryParams }).pipe(
        map((res) => {
          const logInfo =  this._commonService.getLoggerObj(URL,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );
      // forkJoin is implemented as we might need to add more APIs to resolvers
      return forkJoin([stateObs]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          // console.log('err', err);
          return of(err);
        }),
        tap(result => {
          this.loaderService.setLoaderState(false);
          if (isPlatformServer(this.platformId)) {
            //this.loaderService.setLoaderState(false);
            this.transferState.set(STATE_KEY, result[0]);
          }
        })
      )
    }

  }


}
