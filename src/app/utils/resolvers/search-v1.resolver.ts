import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  Params
} from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { GlobalLoaderService } from '../services/global-loader.service';

@Injectable({
  providedIn: 'root'
})
export class SearchV1Resolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private _commonService: CommonService,
    private loaderService: GlobalLoaderService
  ) {}

  resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this.loaderService.setLoaderState(true);
    const SEARCH_DATA_KEY = makeStateKey<object>('search-pwa');

    if (
      this.transferState.hasKey(SEARCH_DATA_KEY)
    ) {
      // id transferState data found then simply pass data
      const search_data = this.transferState.get<object>(SEARCH_DATA_KEY, null);
      this.transferState.remove(SEARCH_DATA_KEY);

      this.loaderService.setLoaderState(false);
      return of([search_data]);
    } else {
      const URL = environment.BASE_URL + ENDPOINTS.SEARCH;
      const params = {
        filter: this._commonService.selectedFilterData.filter,
        queryParams: _activatedRouteSnapshot.queryParams,
        pageName: "SEARCH"
      };
      const actualParams = this._commonService.formatParams(params);

      const searchObs = this.http.get(URL, { params: actualParams });

      return forkJoin([searchObs]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SEARCH_DATA_KEY, result[0]);
          }
          this.loaderService.setLoaderState(false);
        })
      )
    }
  }

}
