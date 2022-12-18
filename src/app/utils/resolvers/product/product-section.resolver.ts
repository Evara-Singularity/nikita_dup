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
import { ENDPOINTS } from '../../../config/endpoints';
import { environment } from '../../../../environments/environment';
import { GlobalLoaderService } from '../../services/global-loader.service';
import { CommonService } from '../../services/common.service';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '../../services/data.service';
import { isPlatformServer } from '@angular/common';
import { LoggerService } from '@app/utils/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ProductSectionResolver implements Resolve<object> {
  productCrumb: Observable<Object>;
  productReviewObs: Observable<Object>;
  product_Q_AND_A: Observable<Object>;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    // private localStorageService: LocalStorageService,
    public _commonService: CommonService,
    // private _dataService: DataService,
    private loaderService: GlobalLoaderService,
    private _loggerService : LoggerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    this.loaderService.setLoaderState(true);
    const startTime = new Date().getTime();

    const languageHeader = {
      'language': 'hi'
    };

    const requestOptions = {                                                                                                                                                                                 
      headers: new HttpHeaders(languageHeader), 
    };

    let productMsnId = route.params['msnid'];  // get MSN id from URL
    if (productMsnId.indexOf("-g") > -1) {
      productMsnId = productMsnId.substring(0, productMsnId.length - 2);
    }

    const PRODUCT_REVIEW_KEY = makeStateKey<object>('product-review-' + productMsnId);
    const PRODUCT_BREADCRUMB_KEY = makeStateKey<object>('product-breadcrumb-' + productMsnId);
    const PRODUCT_Q_AND_A_KEY = makeStateKey<object>('product-quesAns-' + productMsnId);
    // const PRODUCT_FBT = makeStateKey<object>('product-fbt-' + productMsnId);
    // const PRODUCT_STATUS_COUNT = makeStateKey<object>('product-count-' + productMsnId);
    // const DUPLICATE_ORDER = makeStateKey<object>('duplicate-order-' + productMsnId);

    if (
      this.transferState.hasKey(PRODUCT_REVIEW_KEY) &&
      this.transferState.hasKey(PRODUCT_BREADCRUMB_KEY) &&
      this.transferState.hasKey(PRODUCT_Q_AND_A_KEY)
      // this.transferState.hasKey(PRODUCT_FBT) && 
      // this.transferState.hasKey(PRODUCT_STATUS_COUNT) &&
      // this.transferState.hasKey(DUPLICATE_ORDER)
    ) {
      // id transferState data found then simply pass data
      const productReviewObj = this.transferState.get<object>(PRODUCT_REVIEW_KEY, null);
      const productCrumbObj = this.transferState.get<object>(PRODUCT_BREADCRUMB_KEY, null);
      const productQuesAnsObj = this.transferState.get<object>(PRODUCT_Q_AND_A_KEY, null);
      // const productFbtObj = this.transferState.get<object>(PRODUCT_FBT, null);
      // const productStatusCountObj = this.transferState.get<object>(PRODUCT_STATUS_COUNT, null);
      // const duplicateOrderObj = this.transferState.get<object>(DUPLICATE_ORDER, null);

      this.transferState.remove(PRODUCT_REVIEW_KEY);
      this.transferState.remove(PRODUCT_BREADCRUMB_KEY);
      this.transferState.remove(PRODUCT_Q_AND_A_KEY);
      // this.transferState.remove(PRODUCT_FBT);
      // this.transferState.remove(PRODUCT_STATUS_COUNT);
      // this.transferState.remove(DUPLICATE_ORDER);
      
      this.loaderService.setLoaderState(false);
      return of([
        productReviewObj, productCrumbObj, productQuesAnsObj, 
        // productFbtObj, productStatusCountObj, duplicateOrderObj
      ]);
    } else {
      // if transferState data not found then fetch data from server
      const REVIEW_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_REVIEW;
      const CRUM_URL = environment.BASE_URL + ENDPOINTS.BREADCRUMB + `?source=${productMsnId}&type=product`;
      const Q_AND_A_URL = environment.BASE_URL + ENDPOINTS.Q_AND_A + "?itemId=" + productMsnId.toUpperCase();
      // const PRODUCT_FBT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_FBT + "?productId=" + productMsnId.toUpperCase();
      // const PRODUCT_STATUS_COUNT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_STATUS_COUNT + "?productId=" + productMsnId.toUpperCase();
      // let DUPLICATE_ORDER_URL = environment.BASE_URL + ENDPOINTS.DUPLICATE_ORDER + "?productId=" + productMsnId.toUpperCase();

      const reviewRequestBody = { review_type: 'PRODUCT_REVIEW', item_type: 'PRODUCT', item_id: productMsnId, user_id: " " };

      if (route.data['language'] == 'hi') {
        this.productReviewObs = this.http.post(REVIEW_URL, reviewRequestBody,requestOptions);
        this.productCrumb = this.http.get(CRUM_URL,requestOptions);
        this.product_Q_AND_A = this.http.get(Q_AND_A_URL,requestOptions);
      }

      else if (route.data['language'] == 'en') {
        this.productReviewObs = this.http.post(REVIEW_URL, reviewRequestBody);
        this.productCrumb = this.http.get(CRUM_URL);
        this.product_Q_AND_A = this.http.get(Q_AND_A_URL);
      }

      this.productReviewObs.pipe(share(),
      map(res => {
        const logInfo = this._commonService.getLoggerObj(REVIEW_URL, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));;

      this.productCrumb.pipe(share(),
      map(res => {
        const logInfo = this._commonService.getLoggerObj(CRUM_URL, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));;;

      this.product_Q_AND_A.pipe(share(),
      map(res => {
        const logInfo = this._commonService.getLoggerObj(Q_AND_A_URL, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));;;
      // const product_fbt = this.http.get(PRODUCT_FBT_URL);
      // const product_status_count = this.http.get(PRODUCT_STATUS_COUNT_URL);
      
      const pdpFirstFoldApiList = [
        this.productReviewObs, this.productCrumb, this.product_Q_AND_A, 
        // product_fbt, product_status_count
      ];

      // if(this._commonService.isBrowser){ // this required as SSR will not have user session
      //   const userSession = this.localStorageService.retrieve('user');
      //   if (userSession && userSession.authenticated == "true") {
      //     DUPLICATE_ORDER_URL += '&userId=' + userSession['userId'];
      //     const duplicate_order = this._dataService.callRestful('GET', DUPLICATE_ORDER_URL);
      //     pdpFirstFoldApiList.push(duplicate_order);
      //   }
      // }

      return forkJoin(pdpFirstFoldApiList).pipe(
        catchError((err)=>{
          this.loaderService.setLoaderState(false);
          console.log(ProductSectionResolver.name, err);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {

            this.transferState.set(PRODUCT_REVIEW_KEY, result[0]);
            this.transferState.set(PRODUCT_BREADCRUMB_KEY, result[1]);
            this.transferState.set(PRODUCT_Q_AND_A_KEY, result[2]);

            // this.transferState.set(PRODUCT_FBT, result[3]);
            // this.transferState.set(PRODUCT_STATUS_COUNT, result[4]);
            // this.transferState.set(DUPLICATE_ORDER, result[5] || null);


            this.loaderService.setLoaderState(false);
          }
        })
      )
    }

  }

}
