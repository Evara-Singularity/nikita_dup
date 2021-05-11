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
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from '../../../environments/environment';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';

@Injectable({
    providedIn: 'root'
})
export class BrandResolver implements Resolve<object> {

    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private http: HttpClient,
        private loaderService: GlobalLoaderService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
        this.loaderService.setLoaderState(true);


        const PRODUCT_KEY = makeStateKey<object>('product-');
        
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
            const REVIEW_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_REVIEW;
            const reviewRequestBody = { review_type: 'PRODUCT_REVIEW', item_type: 'PRODUCT', item_id: '2343242323423423', user_id: " " };
            const productReviewObs = this.http.post(REVIEW_URL, reviewRequestBody);
            alert('a');

            return forkJoin([productReviewObs]).pipe(
                catchError((err) => {
                    this.loaderService.setLoaderState(false);
                    console.log('err', err);
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
