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
import CONSTANTS from 'src/app/config/constants';

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

    this.loaderService.setLoaderState(true);
    const logosObj = makeStateKey<object>('logosObj');
    const brandsObj = makeStateKey<object>('brandsObj');
    if (this.transferState.hasKey(logosObj) && this.transferState.hasKey(brandsObj)) {
      const logosData = this.transferState.get<object>(logosObj, null);
      const brandData = this.transferState.get<object>(brandsObj, null);
      this.transferState.remove(logosObj);
      this.transferState.remove(logosObj);
      return of([logosData, brandData]);
    } else {
      const logosUrl = environment.BASE_URL + '/category/getparentcategoryjsonbody?requestType=brand-store';
      const brandurl = CONSTANTS.NEW_MOGLIX_API + '/search/getAllBrands';

      const LogosData = this.http.get(logosUrl);
      const brandsData = this.http.get(brandurl);

      return forkJoin([LogosData, brandsData]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          console.log('err', err);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(logosObj, result[0]);
            this.transferState.set(brandsObj, result[1]);
            this.loaderService.setLoaderState(false);
          }
        })
      )
    }
  }

}

