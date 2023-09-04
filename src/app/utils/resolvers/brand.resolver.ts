import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { environment } from 'environments/environment';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, mergeMap, share, tap } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { GlobalLoaderService } from '../services/global-loader.service';
import { map } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class BrandResolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private http: HttpClient,
    private _commonService: CommonService,
    private loaderService: GlobalLoaderService,
    private _loggerService : LoggerService,
  ) { 
  }

  resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this.loaderService.setLoaderState(true);
    const languageHeader = {
      'language': 'hi'
    };
    const requestOptions = {                                                                                                                                                                                 
      headers: new HttpHeaders((_activatedRouteSnapshot.data['language'] == 'hi')?languageHeader:{}), 
    };

    const BRAND_DESC_KEY = makeStateKey<object>('brand-desc-and-other-details');
    const BRAND_LIST_KEY = makeStateKey<object>('brand-lists-pwa' + _activatedRouteSnapshot.fragment);
    const CMS_DATA_KEY = makeStateKey<object>('cms-data-pwa');
    const ATTRIBUTE_KEY = makeStateKey<object>('attribute-url-data-pwa');
    const SIMILAR_KEY = makeStateKey<object>('similar-category-pwa');
    const SIMILAR_BRAND_KEY = makeStateKey<object>('similar-brand-pwa');
    const GET_INFORMATION_VIDEO_KEY = makeStateKey<{}>('information-key');
    const startTime = new Date().getTime();

    if (
      this.transferState.hasKey(BRAND_DESC_KEY) && 
      this.transferState.hasKey(BRAND_LIST_KEY) && 
      this.transferState.hasKey(CMS_DATA_KEY) &&
      this.transferState.hasKey(ATTRIBUTE_KEY) &&
      this.transferState.hasKey(SIMILAR_KEY) &&
      this.transferState.hasKey(SIMILAR_BRAND_KEY)&&
      this.transferState.hasKey(GET_INFORMATION_VIDEO_KEY) 
    ) {
      const brandCategory_data = this.transferState.get<object>(BRAND_DESC_KEY, null);
      const brandList_data = this.transferState.get<object>(BRAND_LIST_KEY, null);
      const cms_data = this.transferState.get<object>(CMS_DATA_KEY, null);
      const attribute_data = this.transferState.get<object>(ATTRIBUTE_KEY, null);
      const similar_category_data = this.transferState.get<object>(SIMILAR_KEY, null);
      const similar_brand_data = this.transferState.get<object>(SIMILAR_BRAND_KEY, null);
      const INFORMATION_VIDEO_KEY_OBJ = this.transferState.get<object>(GET_INFORMATION_VIDEO_KEY, null);


      this.transferState.remove(BRAND_DESC_KEY);
      this.transferState.remove(BRAND_LIST_KEY);
      this.transferState.remove(CMS_DATA_KEY);
      this.transferState.remove(ATTRIBUTE_KEY);
      this.transferState.remove(SIMILAR_KEY);
      this.transferState.remove(SIMILAR_BRAND_KEY);
      this.transferState.remove(GET_INFORMATION_VIDEO_KEY);

      this.loaderService.setLoaderState(false);

      return of([brandCategory_data, brandList_data, similar_category_data,  cms_data, attribute_data, similar_brand_data,INFORMATION_VIDEO_KEY_OBJ]);
    } else {
      const GET_BRAND_NAME_API_URL = environment.BASE_URL + ENDPOINTS.GET_BRAND_NAME + '?name=' + encodeURIComponent(_activatedRouteSnapshot.params.brand);
      let GET_BRAND_LIST_API_URL = environment.BASE_URL + ENDPOINTS.GET_BRANDS;
      // let BUCKET_LIST_API_URL = environment.BASE_URL + ENDPOINTS.GET_BUCKET;
      let CMS_DATA_API_URL = environment.BASE_URL + ENDPOINTS.GET_CMS_CONTROLLED_PAGES + '&brandName=' + _activatedRouteSnapshot.params.brand;
      const ATTRIBUTE_URL = environment.BASE_URL + ENDPOINTS.GET_RELATED_LINKS + "?categoryCode=" + _activatedRouteSnapshot.params.category;
      const SIMILAR_CATEGORY_URL = environment.BASE_URL + ENDPOINTS.SIMILAR_CATEGORY + "?catId=" + _activatedRouteSnapshot.params.category;
      const SIMILAR_BRAND_URL = environment.BASE_URL + ENDPOINTS.SIMILAR_BRAND + "?brand=" + _activatedRouteSnapshot.params.brand;
      const get_information_video_url = environment.BASE_URL + ENDPOINTS.INFORMATION_VIDEO + "?categoryCode=" +_activatedRouteSnapshot.params.category;


      const params = {
        filter:  this._commonService.updateSelectedFilterDataFilterFromFragment(_activatedRouteSnapshot.fragment),
        queryParams: _activatedRouteSnapshot.queryParams,
        pageName: "BRAND"
      };
      
      this._commonService.updateSelectedFilterDataFilterFromFragment(_activatedRouteSnapshot.fragment);
      const actualParams = this._commonService.formatParams(params);

      this._commonService.selectedFilterData.page = _activatedRouteSnapshot.queryParams.page || 1;

      const isBrandCategoryObs = this.http.get(GET_BRAND_NAME_API_URL, requestOptions).pipe(
        map((res) => {
          const logInfo =  this._commonService.getLoggerObj(GET_BRAND_NAME_API_URL,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );

      const similarCategoryObs = this.http.get(SIMILAR_CATEGORY_URL).pipe(
        map((res) => {
          const logInfo =  this._commonService.getLoggerObj(SIMILAR_CATEGORY_URL,'GET',startTime)
          logInfo.endDateTime = new Date().getTime();
          logInfo.responseStatus = res["status"];
          this._loggerService.apiServerLog(logInfo);
          return res;
        })
      );

      const similarBrandObs = this.http.get(SIMILAR_BRAND_URL, requestOptions).pipe(catchError((e)=>{
        return of(null) ;
      }), 
      map((res) => {
        const logInfo =  this._commonService.getLoggerObj(SIMILAR_BRAND_URL,'GET',startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      }) );

      const dataList = [isBrandCategoryObs, null, similarCategoryObs, similarBrandObs];

      if (_activatedRouteSnapshot.params.hasOwnProperty('category')) {
        CMS_DATA_API_URL += '&categoryCode=' + _activatedRouteSnapshot.params.category;
        const cmsDataObs = this.http.get(CMS_DATA_API_URL).pipe(
          map((res) => {
            const logInfo =  this._commonService.getLoggerObj(CMS_DATA_API_URL,'GET',startTime)
            logInfo.endDateTime = new Date().getTime();
            logInfo.responseStatus = res["status"];
            this._loggerService.apiServerLog(logInfo);
            return res;
          })
        );
        actualParams['category'] = _activatedRouteSnapshot.params.category;

        const alpAttributeDataObs = this.http.get(ATTRIBUTE_URL).pipe(
          map((res) => {
            const logInfo =  this._commonService.getLoggerObj(ATTRIBUTE_URL,'GET',startTime)
            logInfo.endDateTime = new Date().getTime();
            logInfo.responseStatus = res["status"];
            this._loggerService.apiServerLog(logInfo);
            return res;
          })
        );
        dataList.push(cmsDataObs, alpAttributeDataObs);
      }


      const getBrandListObs = this.http.get(GET_BRAND_NAME_API_URL).pipe(share(), mergeMap(data => {
        actualParams['brand'] = data['brandName'];
        actualParams['bucketReq'] = 'n';
        return forkJoin([
          this.http.get(GET_BRAND_LIST_API_URL, { params: actualParams, headers: requestOptions['headers']}).pipe(
            map((res) => {
              const logInfo =  this._commonService.getLoggerObj(GET_BRAND_LIST_API_URL,'GET',startTime)
              logInfo.endDateTime = new Date().getTime();
              logInfo.responseStatus = res["status"];
              this._loggerService.apiServerLog(logInfo);
              return res;
            })
          ),
        ]) 
        }),
       map(res => {
        const logInfo =  this._commonService.getLoggerObj(GET_BRAND_NAME_API_URL,'GET',startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        return res;
      })
      );

      dataList[1] = getBrandListObs;

      const getInformationVideoObs = this.http.get(get_information_video_url).pipe(share(), 
      map(res => {
        const logInfo = this._commonService.getLoggerObj(get_information_video_url, 'GET', startTime)
        logInfo.endDateTime = new Date().getTime();
        logInfo.responseStatus = res["status"];
        this._loggerService.apiServerLog(logInfo);
        // console.log('res  ==>', res);
        return res;
      }), catchError((err) => {
        console.log('getInformationVideoObs error==>', err);
        // this.loaderService.setLoaderState(false);
        return of([]);
        // return of(err);
      }));

      dataList.push(getInformationVideoObs);

      return forkJoin(dataList).pipe(
        catchError((err) => {
          this.loaderService.setLoaderState(false);
          return of(err);
        }),
        tap(result => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(BRAND_DESC_KEY, result[0]);
            this.transferState.set(BRAND_LIST_KEY, result[1]);
            this.transferState.set(SIMILAR_KEY, result[2]);
            this.transferState.set(CMS_DATA_KEY, result[3]);
            this.transferState.set(ATTRIBUTE_KEY, result[4]);
            this.transferState.set(GET_INFORMATION_VIDEO_KEY, result[5]);
          }
          this.loaderService.setLoaderState(false);
        })
      )
    }
  }

}
