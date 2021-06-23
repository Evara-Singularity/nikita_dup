import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { Router } from 'express';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { GlobalLoaderService } from '../services/global-loader.service';

@Injectable({
  providedIn: 'root'
})
export class BrandV1Resolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private _router: Router,
    private _commonService: CommonService,
    private loaderService: GlobalLoaderService
  ) { 
  }

  resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this.loaderService.setLoaderState(true);

    const BRAND_DESC_KEY = makeStateKey<object>('brand-desc-and-other-details');
    const BRAND_LIST_KEY = makeStateKey<object>('brand-lists-pwa');
    const CMS_DATA_KEY = makeStateKey<object>('cms-data-pwa');

    if (
      this.transferState.hasKey(BRAND_DESC_KEY) && 
      this.transferState.hasKey(BRAND_LIST_KEY) && 
      this.transferState.hasKey(CMS_DATA_KEY)
    ) {
      // id transferState data found then simply pass data
      const brandCategory_data = this.transferState.get<object>(BRAND_DESC_KEY, null);
      const brandList_data = this.transferState.get<object>(BRAND_LIST_KEY, null);
      const cms_data = this.transferState.get<object>(BRAND_LIST_KEY, null);

      this.transferState.remove(BRAND_DESC_KEY);
      this.transferState.remove(BRAND_LIST_KEY);
      this.transferState.remove(CMS_DATA_KEY);

      this.loaderService.setLoaderState(false);

      return of([brandCategory_data, brandList_data, cms_data]);
    } else {

      if (!Object.keys(this._commonService.selectedFilterData.filter).length && _activatedRouteSnapshot.fragment) {
        this._commonService.selectedFilterData.filter = this._commonService.updateSelectedFilterDataFilterFromFragment(_activatedRouteSnapshot.fragment);
      }

      const params = {
        filter: this._commonService.selectedFilterData.filter,
        queryParams: _activatedRouteSnapshot.queryParams,
        pageName: "BRAND"
      };
      
      const actualParams = this._commonService.formatParams(params);
      actualParams['brand'] = _activatedRouteSnapshot.params.brand;
      // if (_activatedRouteSnapshot.fragment) {
      //   actualParams['filter'] = encodeURIComponent(_activatedRouteSnapshot.fragment);
      // }
      
      console.log(actualParams);
      console.log(_activatedRouteSnapshot.fragment);

      const GET_BRAND_NAME_API_URL = environment.BASE_URL + ENDPOINTS.GET_BRAND_NAME + '?name=' + _activatedRouteSnapshot.params.brand;
      const GET_BRAND_LIST_API_URL = environment.BASE_URL + ENDPOINTS.GET_BRANDS;
      const CMS_DATA_API_URL = environment.BASE_URL + ENDPOINTS.GET_CMS_CONTROLLED_PAGES + '&brandName=' + _activatedRouteSnapshot.params.brand;

      const cmsDataObs = this.http.get(CMS_DATA_API_URL);
      const isBrandCategoryObs = this.http.get(GET_BRAND_NAME_API_URL);
      const getBrandListObs = this.http.get(GET_BRAND_LIST_API_URL, { params: actualParams });

      const dataList = [isBrandCategoryObs, getBrandListObs, cmsDataObs];

      return forkJoin(dataList).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(BRAND_DESC_KEY, result[0]);
            this.transferState.set(BRAND_LIST_KEY, result[1]);
            this.transferState.set(CMS_DATA_KEY, result[2]);
          }
          this.loaderService.setLoaderState(false);
        })
      )
    }
  }

}
