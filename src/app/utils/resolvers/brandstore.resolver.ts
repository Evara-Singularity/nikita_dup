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
import { environment } from '../../../environments/environment';
import { GlobalLoaderService } from '../services/global-loader.service';
import { isPlatformServer } from '@angular/common';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { GLOBAL_CONSTANT } from '@app/config/global.constant';

@Injectable({
  providedIn: 'root'
})
export class BrandStoreResolver implements Resolve<object> {
  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {

    console.log(GLOBAL_CONSTANT);

    this.loaderService.setLoaderState(true);
    const logosObj = makeStateKey<object>('logosObj');
    const brandsObj = makeStateKey<object>('brandsObj');
    const cmsObj = makeStateKey<object>('cmsObj');

    if (this.transferState.hasKey(logosObj) && this.transferState.hasKey(brandsObj) && this.transferState.hasKey(cmsObj)) {
      const logosData = this.transferState.get<object>(logosObj, null);
      const brandData = this.transferState.get<object>(brandsObj, null);
      const cmsData = this.transferState.get<object>(cmsObj, null);

      this.transferState.remove(brandsObj);
      this.transferState.remove(logosObj);
      this.transferState.remove(cmsObj);
      return of([logosData, brandData, cmsData]);
    } else {
      const logosUrl = environment.BASE_URL + CONSTANTS.GET_PARENT_CAT+'brand-store';
      const brandurl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_BRANDS;
      const cmsurl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CMS_LAYOUT + GLOBAL_CONSTANT.brandStoreCmsId;

      const LogosData = this.http.get(logosUrl);
      const brandsData = this.http.get(brandurl);
      const cmsData = this.http.get(cmsurl);

      return forkJoin([LogosData, brandsData, cmsData]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(logosObj, result[0]);
            this.transferState.set(brandsObj, result[1]);
            this.transferState.set(cmsObj, result[2]);
            this.loaderService.setLoaderState(false);
          }
        })
      )
    }
  }

}

