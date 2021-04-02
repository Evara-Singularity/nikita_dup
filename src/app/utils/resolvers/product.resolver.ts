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
import { isPlatformServer } from '@angular/common';
import { ENDPOINTS } from '../../config/endpoints';
import { environment } from '../../../environments/environment';
import { GlobalLoaderService } from '../services/global-loader.service';

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<object> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    this.loaderService.setLoaderState(true);

    let productMsnId = route.params['msnid'];  // get MSN id from URL
    if (productMsnId.indexOf("-g") > -1) {
      productMsnId = productMsnId.substring(0, productMsnId.length - 2);
    }

    const PRODUCT_KEY = makeStateKey<object>('product-' + productMsnId);
    const PRODUCT_REVIEW_KEY = makeStateKey<object>('product-review-' + productMsnId);
    const PRODUCT_BREADCRUMB_KEY = makeStateKey<object>('product-breadcrumb-' + productMsnId);
    const PRODUCT_Q_AND_A_KEY = makeStateKey<object>('product-quesAns-' + productMsnId);
    const PRODUCT_FBT = makeStateKey<object>('product-fbt-' + productMsnId);
    const PRODUCT_STATUS_COUNT = makeStateKey<object>('product-count-' + productMsnId);

    if (
      this.transferState.hasKey(PRODUCT_KEY) &&
      this.transferState.hasKey(PRODUCT_REVIEW_KEY) &&
      this.transferState.hasKey(PRODUCT_BREADCRUMB_KEY) &&
      this.transferState.hasKey(PRODUCT_Q_AND_A_KEY) &&
      this.transferState.hasKey(PRODUCT_FBT) && 
      this.transferState.hasKey(PRODUCT_STATUS_COUNT)
    ) {
      // id transferState data found then simply pass data
      const productObj = this.transferState.get<object>(PRODUCT_KEY, null);
      const productReviewObj = this.transferState.get<object>(PRODUCT_REVIEW_KEY, null);
      const productCrumbObj = this.transferState.get<object>(PRODUCT_BREADCRUMB_KEY, null);
      const productQuesAnsObj = this.transferState.get<object>(PRODUCT_Q_AND_A_KEY, null);
      const productFbtObj = this.transferState.get<object>(PRODUCT_FBT, null);
      const productStatusCountObj = this.transferState.get<object>(PRODUCT_STATUS_COUNT, null);

      this.transferState.remove(PRODUCT_KEY);
      this.transferState.remove(PRODUCT_REVIEW_KEY);
      this.transferState.remove(PRODUCT_BREADCRUMB_KEY);
      this.transferState.remove(PRODUCT_Q_AND_A_KEY);
      this.transferState.remove(PRODUCT_FBT);
      this.transferState.remove(PRODUCT_STATUS_COUNT);
      this.loaderService.setLoaderState(false);
      return of([productObj, productReviewObj, productCrumbObj, productQuesAnsObj, productFbtObj, productStatusCountObj]);
    } else {
      // if transferState data not found then fetch data from server
      const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
      const REVIEW_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_REVIEW;
      const CRUM_URL = environment.BASE_URL + ENDPOINTS.BREADCRUMB + `?source=${productMsnId}&type=product`;
      const Q_AND_A_URL = environment.BASE_URL + ENDPOINTS.Q_AND_A + "?itemId=" + productMsnId.toUpperCase();
      const PRODUCT_FBT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_FBT + "?productId=" + productMsnId.toUpperCase();
      const PRODUCT_STATUS_COUNT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_STATUS_COUNT + "?productId=" + productMsnId.toUpperCase();

      const reviewRequestBody = { review_type: 'PRODUCT_REVIEW', item_type: 'PRODUCT', item_id: productMsnId, user_id: " " };

      const productObs = this.http.get(PRODUCT_URL);
      const productReviewObs = this.http.post(REVIEW_URL, reviewRequestBody);
      const productCrumb = this.http.get(CRUM_URL);
      const product_Q_AND_A = this.http.get(Q_AND_A_URL);
      const product_fbt = this.http.get(PRODUCT_FBT_URL);
      const product_status_count = this.http.get(PRODUCT_STATUS_COUNT_URL);

      return forkJoin([productObs, productReviewObs, productCrumb, product_Q_AND_A, product_fbt, product_status_count]).pipe(
        catchError((err)=>{
          this.loaderService.setLoaderState(false);
          console.log('err', err);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result[0]);
            this.transferState.set(PRODUCT_REVIEW_KEY, result[1]);
            this.transferState.set(PRODUCT_BREADCRUMB_KEY, result[2]);
            this.transferState.set(PRODUCT_Q_AND_A_KEY, result[3]);
            this.transferState.set(PRODUCT_FBT, result[4]);
            this.transferState.set(PRODUCT_STATUS_COUNT, result[5]);
            this.loaderService.setLoaderState(false);
          }
        })
      )
    }

  }

}
