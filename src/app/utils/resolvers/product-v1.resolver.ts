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
import { GlobalLoaderService } from '../services/global-loader.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';
import { LocalStorageService } from 'ngx-webstorage';


@Injectable({
  providedIn: 'root'
})
export class ProductV1Resolver implements Resolve<any> {
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
    const PRODUCT_REVIEW_KEY = makeStateKey<object>('product-review-' + productMsnId);
    const PRODUCT_BREADCRUMB_KEY = makeStateKey<object>('product-breadcrumb-' + productMsnId);
    const PRODUCT_Q_AND_A_KEY = makeStateKey<object>('product-quesAns-' + productMsnId);
    const PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_KEY: any = makeStateKey<{}>("PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK");
    const PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_KEY: any = makeStateKey<{}>("PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY");
    const PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_KEY: any = makeStateKey<{}>("PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET");
    const PRODUCT_TAG_KEY = makeStateKey<object>('product-tag-' + productMsnId);
    const BEST_PROQDUCTS_KEY = makeStateKey<object>('best-products-' + productMsnId);
    const MOGLIX_INSIGHT_KEY = makeStateKey<object>('moglix-insight');
    const PROMO_CODES_KEY = makeStateKey<object>('promo-codes');
    const PDP_MOBIKWIK_KEY = makeStateKey<object>('mobikwik-offer');
    const BRAND_COUPON_KEY = makeStateKey<object>('pdp-brand-coupon');

    if (
      this.transferState.hasKey(PRODUCT_KEY) &&
      this.transferState.hasKey(PRODUCT_REVIEW_KEY) &&
      this.transferState.hasKey(PRODUCT_BREADCRUMB_KEY) &&
      this.transferState.hasKey(PRODUCT_Q_AND_A_KEY) &&
      this.transferState.hasKey(PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_KEY) &&
      this.transferState.hasKey(PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_KEY) &&
      this.transferState.hasKey(PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_KEY)&&
      this.transferState.hasKey(PRODUCT_TAG_KEY) &&
      this.transferState.hasKey(BEST_PROQDUCTS_KEY) &&
      this.transferState.hasKey(MOGLIX_INSIGHT_KEY) &&
      this.transferState.hasKey(PROMO_CODES_KEY) &&
      this.transferState.hasKey(PDP_MOBIKWIK_KEY) &&
      this.transferState.hasKey(BRAND_COUPON_KEY)
    ) {
      const PRODUCT_KEY_OBJ = this.transferState.get<{}>(PRODUCT_KEY, null);
      const PRODUCT_REVIEW_OBJ = this.transferState.get<{}>(PRODUCT_REVIEW_KEY, null);
      const PRODUCT_BREADCRUMB_OBJ = this.transferState.get<{}>(PRODUCT_BREADCRUMB_KEY, null);
      const PRODUCT_Q_AND_A_OBJ = this.transferState.get<{}>(PRODUCT_Q_AND_A_KEY, null);
      const PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_OBJ = this.transferState.get<{}>(PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_KEY, null);
      const PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_OBJ = this.transferState.get<{}>(PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_KEY, null);
      const PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_OBJ = this.transferState.get<{}>(PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_KEY, null);
      const MOGLIX_INSIGHT_DATA = this.transferState.get<object>(MOGLIX_INSIGHT_KEY, {});
      const PRODUCT_TAG_OBJ = this.transferState.get<{}>(PRODUCT_TAG_KEY, null);
      const BEST_PRODUCTS_OBJ = this.transferState.get<{}>(BEST_PROQDUCTS_KEY, null);
      const PROMO_CODES_OBJ = this.transferState.get<{}>(PROMO_CODES_KEY, null);
      const PDP_MOBIKWIK_OBJ = this.transferState.get<{}>(PDP_MOBIKWIK_KEY, null);
      const BRAND_COUPON_OBJ = this.transferState.get<{}>(BRAND_COUPON_KEY, null);

      this.transferState.remove(PRODUCT_KEY);
      this.transferState.remove(PRODUCT_REVIEW_KEY);
      this.transferState.remove(PRODUCT_BREADCRUMB_KEY);
      this.transferState.remove(PRODUCT_Q_AND_A_KEY);
      this.transferState.remove(PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_KEY);
      this.transferState.remove(PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_KEY);
      this.transferState.remove(PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_KEY);
      this.transferState.remove(PRODUCT_TAG_KEY);
      this.transferState.remove(BEST_PROQDUCTS_KEY);
      this.transferState.remove(MOGLIX_INSIGHT_KEY);
      this.transferState.remove(PROMO_CODES_KEY);
      this.transferState.remove(PDP_MOBIKWIK_KEY);
      this.transferState.remove(BRAND_COUPON_KEY);

      // this.loaderService.setLoaderState(false);
      return of([
        PRODUCT_KEY_OBJ,
        PRODUCT_REVIEW_OBJ,
        PRODUCT_BREADCRUMB_OBJ,
        PRODUCT_Q_AND_A_OBJ,
        PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_OBJ,
        PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_OBJ,
        PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_OBJ,
        PRODUCT_TAG_OBJ,
        BEST_PRODUCTS_OBJ,
        MOGLIX_INSIGHT_DATA,
        PROMO_CODES_OBJ,
        PDP_MOBIKWIK_OBJ,
        BRAND_COUPON_OBJ
      ]);
    } else {
      const productUrl = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
      const productReviewUrl = environment.BASE_URL_V2 + ENDPOINTS.PRODUCT_REVIEW;
      const ProductBreadcrumUrl = environment.BASE_URL + ENDPOINTS.BREADCRUMB + `?source=${productMsnId}&type=product`;
      const productQuesAnsUrl = environment.BASE_URL + ENDPOINTS.Q_AND_A + "?itemId=" + productMsnId.toUpperCase();
      const productRelatedLinkUrl = environment.BASE_URL + ENDPOINTS.GET_RELATED_LINKS + "?msn=" + productMsnId;
      const productSimilarCategoryUrl = environment.BASE_URL + ENDPOINTS.SIMILAR_CATEGORY + "?moglixPNumber=" + productMsnId;
      const productCategoryBucketUrl = environment.BASE_URL + ENDPOINTS.GET_CATEGORY_BUCKET + "?msn=" + productMsnId;
      const productTagUrl = environment.BASE_URL + ENDPOINTS.PRODUCT_TAGS + productMsnId.toUpperCase();
      const bestProductsUrl = environment.BASE_URL + ENDPOINTS.TAG_PRODUCTS + '?moglixPNumber=' + productMsnId.toUpperCase();
      // const reviewRequestBody = { review_type: 'PRODUCT_REVIEW', item_type: 'PRODUCT', item_id: productMsnId, user_id: " " };
      const reviewRequestBody = { reviewType: 'PRODUCT_REVIEW', itemType: 'PRODUCT', itemId: productMsnId, userId: " " };
      const moglixInsightUrl = environment.BASE_URL + ENDPOINTS.PRODUCT_WIDGET+"?msn=" + productMsnId;
      let promoCodesUrl = environment.BASE_URL + ENDPOINTS.GET_COUPON_CODE+"?msn=" + productMsnId + '&device=web';
      const mobikwikUrl = environment.BASE_URL + ENDPOINTS.GET_CategoryExtras + "mobikwikpdp";
      const brandCouponUrl = environment.BASE_URL + ENDPOINTS.GET_COUPOUN_ON_BRAND_CATEGORY + "?msn=" + productMsnId;
      
      // appending userid in clientside to fetch the promo codes specific to logged in user
      if(this.isBrowser) {
        let user: any = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
          promoCodesUrl += `&userId=${user.userId}`
        }
      }

      const productResponseObj = this.http.get(productUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }));
      
      const ProductReviewsResponseObj = this.http.post(productReviewUrl, reviewRequestBody, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productReviewUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productReviewUrl, err);
          return of(null);
        }));

      const ProductBreadcrumResponseObj = this.http.get(ProductBreadcrumUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(ProductBreadcrumUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, ProductBreadcrumUrl, err);
          return of(null);
        }));

      const productQuesAnsResponseObj = this.http.get(productQuesAnsUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productQuesAnsUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          // this.loaderService.setLoaderState(false);
          console.log(ProductV1Resolver.name, err);
          return of(err);
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productQuesAnsUrl, err);
          return of(null);
        }));

      const productRelatedLinkResponseObj = this.http.get(productRelatedLinkUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productRelatedLinkUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productRelatedLinkUrl, err);
          return of(null);
        }));

      const productSimilarCategoryResponseObj = this.http.get(productSimilarCategoryUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productSimilarCategoryUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productSimilarCategoryUrl, err);
          return of(null);
        }));

      const productCategoryBucketResponseObj = this.http.get(productCategoryBucketUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productCategoryBucketUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productCategoryBucketUrl, err);
          return of(null);
        }));

        const productTagResponseObj = this.http.get(productTagUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productCategoryBucketUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productCategoryBucketUrl, err);
          return of(null);
        }));

      const bestProductsResponseObj = this.http.get(bestProductsUrl, requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(productCategoryBucketUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }), catchError((err) => {
          console.log(`${ProductV1Resolver.name} APIS ERRORS`, productCategoryBucketUrl, err);
          return of(null);
        }));

      const moglixInsightResponseObj = this.http.get(moglixInsightUrl,requestOptions).pipe(share(),
        map(res => {
          const logInfo = this._commonService.getLoggerObj(moglixInsightUrl, 'GET', startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        }));
      
      const promoCodesResponseObj = this.http.get(promoCodesUrl, requestOptions).pipe(share(),
      map(res => {
        const logInfo = this._commonService.getLoggerObj(promoCodesUrl, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));

      const mobikwikResponseObj = this.http.get(mobikwikUrl, requestOptions).pipe(share(),
      map(res => {
        const logInfo = this._commonService.getLoggerObj(mobikwikUrl, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));

      const brandCouponResponseObj = this.http.get(brandCouponUrl, requestOptions).pipe(share(),
      map(res => {
        const logInfo = this._commonService.getLoggerObj(brandCouponUrl, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }));

      const apiList = [
        productResponseObj,
        ProductReviewsResponseObj,
        ProductBreadcrumResponseObj,
        productQuesAnsResponseObj,
        productRelatedLinkResponseObj,
        productSimilarCategoryResponseObj,
        productCategoryBucketResponseObj,
        productTagResponseObj,
        bestProductsResponseObj,
        moglixInsightResponseObj,
        promoCodesResponseObj,
        mobikwikResponseObj,
        brandCouponResponseObj
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
            this.transferState.set(PRODUCT_REVIEW_KEY, result[1]);
            this.transferState.set(PRODUCT_BREADCRUMB_KEY, result[2]);
            this.transferState.set(PRODUCT_Q_AND_A_KEY, result[3]);
            this.transferState.set(PRODUCT_FOOTER_ACCORDIAN_DATA_RELATED_LINK_KEY, result[4]);
            this.transferState.set(PRODUCT_FOOTER_ACCORDIAN_DATA_SIMILAR_CATEGORY_KEY, result[5]);
            this.transferState.set(PRODUCT_FOOTER_ACCORDIAN_DATA_GET_BUCKET_KEY, result[6]);
            this.transferState.set(PRODUCT_TAG_KEY, result[7]);
            this.transferState.set(BEST_PROQDUCTS_KEY, result[8]);
            this.transferState.set(MOGLIX_INSIGHT_KEY, result[9]);
            this.transferState.set(PROMO_CODES_KEY, result[10]);
            this.transferState.set(PDP_MOBIKWIK_KEY, result[11]);
            this.transferState.set(BRAND_COUPON_KEY, result[12]);
          }
          // this.loaderService.setLoaderState(false);
        })
      );
    }
  }

}