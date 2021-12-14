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
    // Show loder of the page
    this.loaderService.setLoaderState(true);

    // Get product MSN from url
    let productMsnId = route.params['msnid'];  // get MSN id from URL

    if (productMsnId.indexOf("-g") > -1) {
      productMsnId = productMsnId.substring(0, productMsnId.length - 2);
    }

    // make product key
    const PRODUCT_KEY = makeStateKey<object>('product-' + productMsnId);

    if ( this.transferState.hasKey(PRODUCT_KEY) ) {
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
      const productObs = this.http.get(PRODUCT_URL);
      
      // List of API's needed for renderig of first fold UI of Product Page 
      const pdpFirstFoldApiList = [productObs];

      return forkJoin(pdpFirstFoldApiList).pipe(
        catchError((err)=>{
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          console.clear();
          console.log(result[0]);
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(PRODUCT_KEY, result[0]);
            this.loaderService.setLoaderState(false);
          }
        })
      )
    }

  }

}
