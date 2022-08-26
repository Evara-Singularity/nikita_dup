import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { GlobalLoaderService } from '../services/global-loader.service';
import { isPlatformServer } from '@angular/common';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { CommonService } from '../services/common.service';
@Injectable({
  providedIn: 'root'
})
export class BrandStoreResolver implements Resolve<object> {
  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService,
    private _commonService : CommonService,
    private _loggerService :LoggerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    this.loaderService.setLoaderState(true);
    const logosObj = makeStateKey<object>('logosObj');
    const brandsObj = makeStateKey<object>('brandsObj');
    const cmsObj = makeStateKey<object>('cmsObj');
    const startTime=new Date().getTime();

    if (this.transferState.hasKey(logosObj) && this.transferState.hasKey(brandsObj) && this.transferState.hasKey(cmsObj)) {
      const logosData = this.transferState.get<object>(logosObj, null);
      const brandData = this.transferState.get<object>(brandsObj, null);
      const cmsData = this.transferState.get<object>(cmsObj, null);

      this.transferState.remove(brandsObj);
      this.transferState.remove(logosObj);
      this.transferState.remove(cmsObj);
      return of([logosData, brandData, cmsData]);
    } else {
      const logosUrl = environment.BASE_URL + CONSTANTS.GET_PARENT_CAT+'brand-store';
      const brandurl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_BRANDS;
      const cmsurl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CMS_LAYOUT + GLOBAL_CONSTANT.brandStoreCmsId;

      const LogosData = this.http.get(logosUrl).pipe(
        map((res) => {
          const logInfo =  this._commonService.getLoggerObj(logosUrl,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );
      const brandsData = this.http.get(brandurl).pipe(
        map((res) => {
          const logInfo =  this._commonService.getLoggerObj(brandurl,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );
      const cmsData = this.http.get(cmsurl).pipe(
        map((res) => {
          const logInfo =  this._commonService.getLoggerObj(cmsurl,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );

      return forkJoin([LogosData, brandsData, cmsData]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(logosObj, result[0]);
            this.transferState.set(brandsObj, result[1]);
            this.transferState.set(cmsObj, result[2]);
            this.loaderService.setLoaderState(false);
          }
        })
      )
    }
  }

}

