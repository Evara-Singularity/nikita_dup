import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { GlobalLoaderService } from '../services/global-loader.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class SearchResolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private _commonService: CommonService,
    private loaderService: GlobalLoaderService,
    private _loggerService : LoggerService
  ) { }

  resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this.loaderService.setLoaderState(true);
    const SEARCH_DATA_KEY = makeStateKey<object>('search-pwa' + _activatedRouteSnapshot.fragment + Math.random());
    const startTime = new Date().getTime();
    
    if ( this.transferState.hasKey(SEARCH_DATA_KEY) ) {
      const search_data = this.transferState.get<object>(SEARCH_DATA_KEY, null);
      this.transferState.remove(SEARCH_DATA_KEY);

      this.loaderService.setLoaderState(false);
      return of([search_data]);
    } else {

      const params = {
        filter: this._commonService.updateSelectedFilterDataFilterFromFragment(_activatedRouteSnapshot.fragment),
        queryParams: _activatedRouteSnapshot.queryParams,
        pageName: "SEARCH"
      };

      this._commonService.updateSelectedFilterDataFilterFromFragment(_activatedRouteSnapshot.fragment);
      const actualParams = this._commonService.formatParams(params);
      this._commonService.selectedFilterData.page = _activatedRouteSnapshot.queryParams.page || 1;

      const URL = environment.BASE_URL + ENDPOINTS.SEARCH + "?bucketReq=n";
      const searchObs = this.http.get(URL, { params: actualParams }).pipe(
        map(res => {
          const logInfo =  this._commonService.getLoggerObj(URL,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );

      return forkJoin([searchObs]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SEARCH_DATA_KEY, result[0]);
          }
          this.loaderService.setLoaderState(false);
        })
      )
    }
  }

}
