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
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, share, tap } from 'rxjs/operators';
import { CommonService } from '../services/common.service';
import { GlobalLoaderService } from '../services/global-loader.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryResolver implements Resolve<any> {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private transferState: TransferState,
    private _commonService: CommonService,
    private http: HttpClient,
    private loaderService: GlobalLoaderService
  ) { 
  }

  resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this.loaderService.setLoaderState(true);
    const categoryId = _activatedRouteSnapshot.params.id;
    const source = _activatedRouteSnapshot['_routerState']['url'].split('#')[0].split('?')[0];

    const GET_RELATED_CATEGORY_KEY: any = makeStateKey<{}>('get_related-' + categoryId);
    const REFRESH_KEY: any = makeStateKey<{}>('refresh-' + categoryId + _activatedRouteSnapshot.fragment);
    const FAQ_KEY: any = makeStateKey<{}>('faq-' + categoryId);
    const BREADCRUMP_KEY: any = makeStateKey<{}>('breaattributedcrump-' + categoryId);
    const CMS_KEY: any = makeStateKey<{}>('cms-' + categoryId);
    const RELATED_ARTICLES_KEY = makeStateKey<{}>('related_articles-' + categoryId);
    const ATTRIBUTE_KEY = makeStateKey<{}>('attribute-' + categoryId);

    if (
      this.transferState.hasKey(GET_RELATED_CATEGORY_KEY) &&
      this.transferState.hasKey(REFRESH_KEY) &&
      this.transferState.hasKey(FAQ_KEY) &&
      this.transferState.hasKey(BREADCRUMP_KEY) &&
      this.transferState.hasKey(CMS_KEY) && 
      this.transferState.hasKey(RELATED_ARTICLES_KEY) &&
      this.transferState.hasKey(ATTRIBUTE_KEY)
    ) {
        const GET_RELATED_CATEGORY_KEY_OBJ = this.transferState.get<{}>(GET_RELATED_CATEGORY_KEY, null);
        const REFRESH_KEY_OBJ = this.transferState.get<{}>(REFRESH_KEY, null);
        const FAQ_KEY_OBJ = this.transferState.get<{}>(FAQ_KEY, null);
        const BREADCRUMP_KEY_OBJ = this.transferState.get<{}>(BREADCRUMP_KEY, null);
        const CMS_KEY_OBJ = this.transferState.get<{}>(CMS_KEY, null);
        const RELATED_ARTICLES_OBJ = this.transferState.get<{}>(RELATED_ARTICLES_KEY, {});
        const ATTRIBUTE_OBJ = this.transferState.get<{}>(ATTRIBUTE_KEY, {});
        
        this.transferState.remove(GET_RELATED_CATEGORY_KEY);
        this.transferState.remove(REFRESH_KEY);
        this.transferState.remove(FAQ_KEY);
        this.transferState.remove(BREADCRUMP_KEY);
        this.transferState.remove(CMS_KEY);
        this.transferState.remove(RELATED_ARTICLES_KEY);
        this.transferState.remove(ATTRIBUTE_KEY);

        this.loaderService.setLoaderState(false);
        return of([GET_RELATED_CATEGORY_KEY_OBJ, REFRESH_KEY_OBJ, FAQ_KEY_OBJ, BREADCRUMP_KEY_OBJ, CMS_KEY_OBJ, RELATED_ARTICLES_OBJ, ATTRIBUTE_OBJ]);
    } else {
        const get_rel_cat_url = environment.BASE_URL + ENDPOINTS.GET_CATEGORY_BY_ID + '?catId=' + categoryId;
        const faq_url = environment.BASE_URL + ENDPOINTS.GET_CATEGORY_SCHEMA + "?categoryCode=" + categoryId;
        const refresh_product_url = environment.BASE_URL + ENDPOINTS.GET_CATEGORY + "?category=" + categoryId + "&bucketReq=n";
        const breadcrump_url = environment.BASE_URL + ENDPOINTS.BREADCRUMB + "?source=" + source + "&type=category";
        const cms_url = environment.BASE_URL + ENDPOINTS.GET_CMS_CONTROLLED + "?requestParam=article-1&categoryCode=" + categoryId;
        const attribute_url = environment.BASE_URL + ENDPOINTS.GET_RELATED_LINKS + "?categoryCode=" + categoryId;
        const related_article_url = environment.BASE_URL + ENDPOINTS.GET_RELATED_ARTICLES + categoryId;
       
        const params = {
          filter: this._commonService.updateSelectedFilterDataFilterFromFragment(_activatedRouteSnapshot.fragment),
          queryParams: _activatedRouteSnapshot.queryParams,
          pageName: "CATEGORY"
        };

        const actualParams = this._commonService.formatParams(params);
        this._commonService.selectedFilterData.page = _activatedRouteSnapshot.queryParams.page || 1;

        const getRelatedCategoriesObs = this.http.get(get_rel_cat_url).pipe(share());
        const getFAQObs = this.http.get(faq_url).pipe(share());
        const refreshProductsObs = this.http.get(refresh_product_url, { params: actualParams }).pipe(share());
        const getBreadCrump = this.http.get(breadcrump_url).pipe(share());
        const getCmsDynamicDataForCategoryAndBrandObs = this.http.get(cms_url).pipe(share());
        const getAttributeObs = this.http.get(attribute_url).pipe(share());
        const getRelatedArticleObs = this.http.get(related_article_url).pipe(share());

        const apiList = [getRelatedCategoriesObs, refreshProductsObs, getFAQObs, getBreadCrump, getAttributeObs, getRelatedArticleObs];

        if (state.url.search('#') < 0) {
            apiList.push(getCmsDynamicDataForCategoryAndBrandObs);
        }


        return forkJoin(apiList).pipe(
            catchError((err) => {
                this.loaderService.setLoaderState(false);
                return of(err);
            }),
            tap(result => {
                if (isPlatformServer(this.platformId)) {
                    this.transferState.set(GET_RELATED_CATEGORY_KEY, result[0]);
                    this.transferState.set(REFRESH_KEY, result[1]);
                    this.transferState.set(FAQ_KEY, result[2]);
                    this.transferState.set(BREADCRUMP_KEY, result[3]);
                    this.transferState.set(CMS_KEY, result[4] || []);
                    this.transferState.set(RELATED_ARTICLES_KEY, result[5] || {});
                    this.transferState.set(ATTRIBUTE_KEY, result[6]);
                  }
                  this.loaderService.setLoaderState(false);
            })
        );
    }
  }

}
