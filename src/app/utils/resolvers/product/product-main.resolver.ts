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
import { ENDPOINTS } from '../../../config/endpoints';
import { environment } from '../../../../environments/environment';
import { GlobalLoaderService } from '../../services/global-loader.service';
import { CommonService } from '../../services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ProductResolver implements Resolve<object> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    public _commonService: CommonService,
    private loaderService: GlobalLoaderService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    this.loaderService.setLoaderState(true);

    let productMsnId = route.params['msnid'];  // get MSN id from URL
    if (productMsnId.indexOf("-g") > -1) {
      productMsnId = productMsnId.substring(0, productMsnId.length - 2);
    }

    const PRODUCT_KEY = makeStateKey<object>('product-' + productMsnId);

    if (
      this.transferState.hasKey(PRODUCT_KEY)
    ) {
      // id transferState data found then simply pass data
      const productObj = this.transferState.get<object>(PRODUCT_KEY, null);

      this.transferState.remove(PRODUCT_KEY);
      
      this.loaderService.setLoaderState(false);
      return of([productObj]);
    } else {
      // if transferState data not found then fetch data from server
      const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;

      const productObs = this.http.get(PRODUCT_URL);
      
      const pdpFirstFoldApiList = [productObs];


      return forkJoin(pdpFirstFoldApiList).pipe(
        catchError((err)=>{
          this.loaderService.setLoaderState(false);
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
