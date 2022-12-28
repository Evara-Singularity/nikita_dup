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
    private _loggerService: LoggerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const startTime = new Date().getTime();
    const languageHeader = {
      'language': 'hi'
    };


    const requestOptions = {                                                                                                                                                                                 
      headers: new HttpHeaders((route.data['language'] == 'hi')?languageHeader:{}), 
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
    const PRODUCT_REVIEW_KEY = makeStateKey<object>('product-review-' + productMsnId);
    const PRODUCT_BREADCRUMB_KEY = makeStateKey<object>('product-breadcrumb-' + productMsnId);
    const PRODUCT_Q_AND_A_KEY = makeStateKey<object>('product-quesAns-' + productMsnId);
    const PDP_FOOTER_ACCORDIAN_DATA_RELATED_LINK: any = makeStateKey<{}>("PDP_FOOTER_ACCORDIAN_DATA_RELATED_LINK");
    const PDP_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY: any = makeStateKey<{}>("PDP_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY");
    const PDP_FOOTER_ACCORDIAN_DATA_GET_BUCKET: any = makeStateKey<{}>("PDP_FOOTER_ACCORDIAN_DATA_GET_BUCKET");

    if (
      this.transferState.hasKey(PRODUCT_KEY) &&
      this.transferState.hasKey(PRODUCT_REVIEW_KEY) &&
      this.transferState.hasKey(PRODUCT_BREADCRUMB_KEY) &&
      this.transferState.hasKey(PRODUCT_Q_AND_A_KEY) &&
      this.transferState.hasKey(PDP_FOOTER_ACCORDIAN_DATA_RELATED_LINK) &&
      this.transferState.hasKey(PDP_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY) &&
      this.transferState.hasKey(PDP_FOOTER_ACCORDIAN_DATA_GET_BUCKET)
    ) {
      const productObj = this.transferState.get<object>(PRODUCT_KEY, null);
      const productReviewObj = this.transferState.get<object>(PRODUCT_REVIEW_KEY, null);
      const productCrumbObj = this.transferState.get<object>(PRODUCT_BREADCRUMB_KEY, null);
      const productQuesAnsObj = this.transferState.get<object>(PRODUCT_Q_AND_A_KEY, null);
      const footerAccordianRelatedLink = this.transferState.get<object>(PDP_FOOTER_ACCORDIAN_DATA_RELATED_LINK, null);
      const footerAccordianSimilarCategory = this.transferState.get<object>(PDP_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY, null);
      const footerAccordianGetBucket = this.transferState.get<object>(PDP_FOOTER_ACCORDIAN_DATA_GET_BUCKET, null);

      this.transferState.remove(PRODUCT_KEY);
      this.transferState.remove(PRODUCT_REVIEW_KEY);
      this.transferState.remove(PRODUCT_BREADCRUMB_KEY);
      this.transferState.remove(PRODUCT_Q_AND_A_KEY);
      this.transferState.remove(PDP_FOOTER_ACCORDIAN_DATA_RELATED_LINK);
      this.transferState.remove(PDP_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY);
      this.transferState.remove(PDP_FOOTER_ACCORDIAN_DATA_GET_BUCKET);

      // Remove loader
      this.loaderService.setLoaderState(false);

      // return Product Data
      return of([productObj, productReviewObj, productCrumbObj, productQuesAnsObj, footerAccordianRelatedLink, footerAccordianSimilarCategory, footerAccordianGetBucket]);
    } else {
      // If transferState data not found then fetch data from server

      // Product API url 
      const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
      const REVIEW_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_REVIEW;
      const CRUM_URL = environment.BASE_URL + ENDPOINTS.BREADCRUMB + `?source=${productMsnId}&type=product`;
      const Q_AND_A_URL = environment.BASE_URL + ENDPOINTS.Q_AND_A + "?itemId=" + productMsnId.toUpperCase();
      const FOOTER_RELATED_LINK = environment.BASE_URL + ENDPOINTS.GET_RELATED_LINKS + "?msn=" + productMsnId;
      const FOOTER_SIMILAR_CATEGORY = environment.BASE_URL + ENDPOINTS.SIMILAR_CATEGORY + "?moglixPNumber=" + productMsnId;
      const FOOTER_GET_BUCKET = environment.BASE_URL + ENDPOINTS.GET_CATEGORY_BUCKET + "?msn=" + productMsnId;

      // Store request observable in a validable
      const productObs = this.http.get(PRODUCT_URL, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(PRODUCT_URL, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, PRODUCT_URL, err);
          return of(null);
        }));

      const reviewRequestBody = { review_type: 'PRODUCT_REVIEW', item_type: 'PRODUCT', item_id: productMsnId, user_id: " " };
      const productReviewObs = this.http.post(REVIEW_URL, reviewRequestBody, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(REVIEW_URL, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, REVIEW_URL, err);
          return of(null);
        }));

      const productCrumb = this.http.get(CRUM_URL, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(CRUM_URL, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, CRUM_URL, err);
          return of(null);
        }));

      const product_Q_AND_A = this.http.get(Q_AND_A_URL, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(Q_AND_A_URL, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }),catchError((err) => {
          this.loaderService.setLoaderState(false);
          console.log(ProductResolver.name, err);
          return of(err);
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, Q_AND_A_URL, err);
          return of(null);
        }));

      const footer_accordian_related_link = this.http.get(FOOTER_RELATED_LINK, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(FOOTER_RELATED_LINK, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, FOOTER_RELATED_LINK, err);
          return of(null);
        }));

      const footer_accordian_similar_category = this.http.get(FOOTER_SIMILAR_CATEGORY, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(FOOTER_SIMILAR_CATEGORY, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, FOOTER_SIMILAR_CATEGORY, err);
          return of(null);
        }));

      const footer_accordian_category_bucket = this.http.get(FOOTER_GET_BUCKET, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(FOOTER_GET_BUCKET, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductResolver.name} APIS ERRORS`, FOOTER_GET_BUCKET, err);
          return of(null);
        }));

      // List of API's needed for renderig of first fold UI of Product Page 
      const pdpFirstFoldApiList = [productObs, productReviewObs, productCrumb, product_Q_AND_A, footer_accordian_related_link, footer_accordian_similar_category, footer_accordian_category_bucket];
      const logInfoResolver = this._commonService.getLoggerObj('productMsnId', 'GET', startTime)
      return forkJoin(pdpFirstFoldApiList).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          console.log(`${ProductResolver.name} forkJoin APIS ERRORS`, FOOTER_GET_BUCKET, err);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result[0]);
            this.transferState.set(PRODUCT_REVIEW_KEY, result[1]);
            this.transferState.set(PRODUCT_BREADCRUMB_KEY, result[2]);
            this.transferState.set(PRODUCT_Q_AND_A_KEY, result[3]);
            this.transferState.set(PDP_FOOTER_ACCORDIAN_DATA_RELATED_LINK, result[4]);
            this.transferState.set(PDP_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY, result[6]);
            this.transferState.set(PDP_FOOTER_ACCORDIAN_DATA_GET_BUCKET, result[6]);
            this.loaderService.setLoaderState(false);
            logInfoResolver.endDateTime = new Date().getTime();
            logInfoResolver.responseStatus = '';
            this._loggerService.apiServerLog(logInfoResolver, ProductResolver.name + '-Consolidated');
          }
        })
      )
    }

  }

}
