import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http';

import { ENDPOINTS } from '../../config/endpoints';
import { environment } from '../../../environments/environment';
import { isPlatformServer } from '@angular/common';

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

    if (this.transferState.hasKey(PRODUCT_KEY)) {
      // id transferState data found then simply pass data
      const productObj = this.transferState.get<object>(PRODUCT_KEY, null);
      this.transferState.remove(PRODUCT_KEY);
      return of(productObj);
    } else {
       // if transferState data not found then fetch data from server
      const URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
      return this.http.get(URL).pipe(
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result);
          }
        })
      )

    }

  }

}
