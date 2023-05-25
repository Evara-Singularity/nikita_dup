import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, share, tap } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { LocalStorageService } from 'ngx-webstorage';


@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<any> {
  isBrowser: boolean;
  isServer: boolean;
  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private _commonService: CommonService,
    private http: HttpClient,
    private _loggerService: LoggerService,
    private localStorageService: LocalStorageService
  ) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
  }

  resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

    // this.loaderService.setLoaderState(true);
    const startTime = new Date().getTime();
    const languageHeader = {
      'language': 'hi'
    };
    const requestOptions = {                                                                                                                                                                                 
      headers: new HttpHeaders((_activatedRouteSnapshot.data['language'] == 'hi')?languageHeader:{}), 
    };
    // Get product MSN from url
    let productMsnId = _activatedRouteSnapshot.params['msnid'];  // get MSN id from URL
    if (productMsnId.indexOf("-g") > -1) {
      productMsnId = productMsnId.substring(0, productMsnId.length - 2);
    }

    const PRODUCT_KEY: any = makeStateKey<{}>('product-' + productMsnId);

    if (this.transferState.hasKey(PRODUCT_KEY)) {
      const PRODUCT_KEY_OBJ = this.transferState.get<{}>(PRODUCT_KEY, null);
      this.transferState.remove(PRODUCT_KEY);
      // this.loaderService.setLoaderState(false);
      return of([
        PRODUCT_KEY_OBJ,
      ]);
    } else {
      const productUrl = environment.BASE_URL + ENDPOINTS.PRODUCT_API + `?msn=${productMsnId}`;
      const productResponseObj = this.http.get(productUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }));

      const apiList = [
        productResponseObj,
      ];

      return forkJoin(apiList).pipe(
        catchError((err) => {
          console.log('category forkJoin error ==>', err);
          // this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          // console.log(result);
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result[0]);
          }
          // this.loaderService.setLoaderState(false);
        })
      );
    }
  }

}