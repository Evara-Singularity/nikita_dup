import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, share, tap } from 'rxjs/operators'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { ENDPOINTS } from '../../../config/endpoints';
import { environment } from '../../../../environments/environment';
import { GlobalLoaderService } from '../../services/global-loader.service';
import { CommonService } from '../../services/common.service';
import { LoggerService } from '@app/utils/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<object> {
  productObs: Observable<Object>;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    public _commonService: CommonService,
    private loaderService: GlobalLoaderService,
    private _loggerService : LoggerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const startTime = new Date().getTime();
    const languageHeader = {
      'language': 'hi'
    };

    const requestOptions = {                                                                                                                                                                                 
      headers: new HttpHeaders(languageHeader), 
    };
    // Show loder of the page
    this.loaderService.setLoaderState(true);

    // Get product MSN from url
    let productMsnId = route.params['msnid'];  // get MSN id from URL

    if (productMsnId.indexOf("-g") > -1) {
      productMsnId = productMsnId.substring(0, productMsnId.length - 2);
    }

    // make product key
    const PRODUCT_KEY = makeStateKey<object>('product-' + productMsnId);

    if (this.transferState.hasKey(PRODUCT_KEY)) {
      const productObj = this.transferState.get<object>(PRODUCT_KEY, null);

      this.transferState.remove(PRODUCT_KEY);

      // Remove loader
      this.loaderService.setLoaderState(false);

      // return Product Data
      return of([productObj]);
    } else {
      // If transferState data not found then fetch data from server

      // Product API url 
      const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;

      // Store request observable in a validable

      if (route.data['language'] == 'hi') {
        // alert("hi")
        this.productObs = this.http.get(PRODUCT_URL, requestOptions)
      }
      else if (route.data['language'] == 'en') {
        // alert("en")
        this.productObs = this.http.get(PRODUCT_URL)
      }

      this.productObs.pipe(share(), map(res => {
        const logInfo = this._commonService.getLoggerObj(PRODUCT_URL, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));;

      // List of API's needed for renderig of first fold UI of Product Page 
      const pdpFirstFoldApiList = [this.productObs];

      return forkJoin(pdpFirstFoldApiList).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          console.log(ProductResolver.name, err);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result[0]);
            this.loaderService.setLoaderState(false);
          }
        })
      )
    }

  }

}
