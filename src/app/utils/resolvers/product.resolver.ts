import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';

import { isPlatformServer } from '@angular/common';
import { ENDPOINTS } from '../../config/endpoints';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<object> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    const productMsnId = route.params['msnid'];  // get MSN id from URL
    const PRODUCT_KEY = makeStateKey<object>('product-' + productMsnId);
    const PRODUCT_REVIEW_KEY = makeStateKey<object>('product-review-' + productMsnId);
    const PRODUCT_FBT_KEY = makeStateKey<object>('product-fbt-' + productMsnId);

    if (
      this.transferState.hasKey(PRODUCT_KEY) &&
      this.transferState.hasKey(PRODUCT_REVIEW_KEY) &&
      this.transferState.hasKey(PRODUCT_FBT_KEY)
    ) {
      // id transferState data found then simply pass data
      const productObj = this.transferState.get<object>(PRODUCT_KEY, null);
      const productReviewObj = this.transferState.get<object>(PRODUCT_REVIEW_KEY, null);
      const productFbtObj = this.transferState.get<object>(PRODUCT_FBT_KEY, null);

      this.transferState.remove(PRODUCT_KEY);
      this.transferState.remove(PRODUCT_REVIEW_KEY);
      this.transferState.remove(PRODUCT_FBT_KEY);

      return of([productObj, productReviewObj, productFbtObj]);
    } else {
      // if transferState data not found then fetch data from server
      const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
      const REVIEW_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_REVIEW;
      const FBT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_FBT + `?productId=${productMsnId}`;

      const reviewRequestBody = { review_type: 'PRODUCT_REVIEW', item_type: 'PRODUCT', item_id: productMsnId, user_id: " " };

      const productObs = this.http.get(PRODUCT_URL);
      const productReviewObs = this.http.post(REVIEW_URL, reviewRequestBody);
      const productFbt = this.http.get(FBT_URL);;

      return forkJoin([productObs, productReviewObs, productFbt]).pipe(
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result[0]);
            this.transferState.set(PRODUCT_REVIEW_KEY, result[1]);
            this.transferState.set(PRODUCT_FBT_KEY, result[1]);
          }
        })
      )
    }

  }

}
