import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from '@app/../environments/environment';
import { GlobalLoaderService } from '../services/global-loader.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { CommonService } from '../services/common.service';
@Injectable({
  providedIn: 'root'
})
export class LayoutResolver implements Resolve<object> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService,
    private _loggerService :LoggerService,
    private _commonService : CommonService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    /**
     * For using this reolver please pass layoutId from pages.routing 
     * Check example for /covid19essentials
     */
    const LAYOUT_ID = route.data['layoutId'];
    const STATE_KEY = makeStateKey<object>('layoutId-'+LAYOUT_ID);
    const startTime=new Date().getTime();

    if (!LAYOUT_ID) {
      return of(null);
    }

    if (this.transferState.hasKey(STATE_KEY)) {
      const stateObj = this.transferState.get<object>(STATE_KEY, null);
      this.transferState.remove(STATE_KEY);
      return of([stateObj]);
    } else {
      this.loaderService.setLoaderState(true);
      const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
      const LAYOUT_URL = environment.BASE_URL + ENDPOINTS.GET_LAYOUT + `?id=${LAYOUT_ID}`;
      const stateObs = this.http.get(LAYOUT_URL, { headers, responseType: 'text' }).pipe(
        map(res => {
          const logInfo =  this._commonService.getLoggerObj(LAYOUT_URL,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );

      // forkJoin is implemented as we might need to add more APIs to resolvers
      return forkJoin([stateObs]).pipe(
        catchError((err) => {
          // this.loaderService.setLoaderState(false);
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
