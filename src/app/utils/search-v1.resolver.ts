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
import { GlobalLoaderService } from './services/global-loader.service';

@Injectable({
  providedIn: 'root'
})
export class SearchV1Resolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private loaderService: GlobalLoaderService
  ) { 
    this.loaderService.setLoaderState(true);
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const SEARCH_DATA_KEY = makeStateKey<object>('search-pwa');
    const queryParams = this.getQueryParams(route.queryParams);
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
      const searchObs = this.http.get(URL, { params: queryParams });
      return forkJoin([searchObs]).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(SEARCH_DATA_KEY, result[0]);
          }
        })
      )

    }
  }

  /**
   * @param queryParams current search route query parameters redirected from headernav module
   * @returns query params for API that is mapped with queryParams
   */
  getQueryParams(queryParams: Params) {
    const params = Object.assign({});
    // add static params
    params['type'] = 'm' //mobile
    params['abt'] = 'y' // new search params
    // add paging related params
    params['pageIndex'] = (queryParams['page']) ? queryParams['page'] : 0;
    params['pageSize'] = CONSTANTS.GLOBAL.PLP_PAGE_COUNT
    // sorting/prder related params
    params['orderBy'] = (queryParams['orderby']) ? 'popularity' : 'popularity'; // change as per sorting functionality
    params['orderWay'] = (queryParams['orderway']) ? queryParams['orderway'] : 'desc';
    //keyword to be searched
    params['str'] = (queryParams['search_query']) ? queryParams['search_query'] : '';
    // Todo: filter related params 
    return params;
  }

}
