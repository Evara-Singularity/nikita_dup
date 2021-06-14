import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, share, tap } from 'rxjs/operators'
import { isPlatformServer } from '@angular/common';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { CommonService } from '../services/common.service';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { HttpClient } from '@angular/common/http';
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable({
    providedIn: 'root'
})
export class CategoryResolver implements Resolve<object> {
    private pageName;
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        public _router: Router,
        private loaderService: GlobalLoaderService,
        private _commonService: CommonService,
        private http: HttpClient,
        ) {
        this.pageName = "CATEGORY";
    }

    createDefaultParams(currentQueryParams, params, fragment) {

        const newParams: any = {
            queryParams: {},
            filter: {}
        };
        
        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        newParams['category'] = params['id'];

        newParams['pageName'] = this.pageName;

        if (fragment !== undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');


            /*Below newCurrentUrlFilterData and for loop is added for a special case, / is coming also in voltage filter part*/
            let newCurrentUrlFilterData = '';
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                if (currentUrlFilterData[i] === '/' && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + '$';
                } else {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + currentUrlFilterData[i];
                }
            }

            currentUrlFilterData = newCurrentUrlFilterData.split('/');
            if (currentUrlFilterData.length > 0) {
                const filter = {};
                for (let i = 0; i < currentUrlFilterData.length; i++) {
                    const filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // "price"
                    // ["101 - 500", "501 - 1000"]
                    const filterData = currentUrlFilterData[i]
                        .replace('$', '/')
                        .substr(currentUrlFilterData[i]
                            .indexOf('-') + 1).split('||');
                    filter[filterName] = filterData;
                }
                newParams['filter'] = filter;
            }
        }

        return newParams;
    }
    
    private refreshProducts(currentQueryParams, params, fragment): Observable<{}> {
        const defaultParams = this.createDefaultParams(currentQueryParams, params, fragment);
        this._commonService.updateDefaultParamsNew(defaultParams);
        return this._commonService.refreshProducts();
    }

    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
        this.loaderService.setLoaderState(true);
        const fragment = _activatedRouteSnapshot.fragment;
        const categoryId = _activatedRouteSnapshot.params.id;
        
        const GET_RELATED_CATEGORY_KEY: any = makeStateKey<{}>('get_related-' + categoryId);
        const REFRESH_KEY: any = makeStateKey<{}>('refresh-' + categoryId);
        const FAQ_KEY: any = makeStateKey<{}>('faq-' + categoryId);
        const BREADCRUMP_KEY: any = makeStateKey<{}>('breadcrump-' + categoryId);
        const CMS_KEY: any = makeStateKey<{}>('cms-' + categoryId);
        
        if (this.transferState.hasKey(GET_RELATED_CATEGORY_KEY) && this.transferState.hasKey(REFRESH_KEY) && this.transferState.hasKey(FAQ_KEY) && this.transferState.hasKey(BREADCRUMP_KEY) && this.transferState.hasKey(CMS_KEY)) {
            const GET_RELATED_CATEGORY_KEY_OBJ = this.transferState.get<{}>(GET_RELATED_CATEGORY_KEY, null);
            const REFRESH_KEY_OBJ = this.transferState.get<{}>(REFRESH_KEY, null);
            const FAQ_KEY_OBJ = this.transferState.get<{}>(FAQ_KEY, null);
            const BREADCRUMP_KEY_OBJ = this.transferState.get<{}>(BREADCRUMP_KEY, null);
            const CMS_KEY_OBJ = this.transferState.get<{}>(CMS_KEY, null);
            
            this.transferState.remove(GET_RELATED_CATEGORY_KEY);
            this.transferState.remove(REFRESH_KEY);
            this.transferState.remove(FAQ_KEY);
            this.transferState.remove(BREADCRUMP_KEY);
            this.transferState.remove(CMS_KEY);
            
            this.loaderService.setLoaderState(false);
            return of([GET_RELATED_CATEGORY_KEY_OBJ, REFRESH_KEY_OBJ, FAQ_KEY_OBJ, BREADCRUMP_KEY_OBJ, CMS_KEY_OBJ]);
        } else {
            const currentQueryParams = _activatedRouteSnapshot.queryParams;
            const params = _activatedRouteSnapshot.params;
            const source = _activatedRouteSnapshot['_routerState']['url'].split('#')[0].split('?')[0];
            
            const get_rel_cat_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_BY_ID + '?catId=' + categoryId;
            const faq_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_SCHEMA + "?categoryCode=" + categoryId;
            const breadcrump_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.BREADCRUMB + "?source=" + source + "&type=category";
            const cms_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CMS_CONTROLLED + "?requestParam=article-1&categoryCode=" + categoryId;

            const getRelatedCategoriesObs = this.http.get(get_rel_cat_url).pipe(share());
            const getFAQObs = this.http.get(faq_url).pipe(share());
            const refreshProductsObs = this.refreshProducts(currentQueryParams, params, fragment).pipe(share());
            const getBreadCrump = this.http.get(breadcrump_url).pipe(share());
            const getCmsDynamicDataForCategoryAndBrandObs = this.http.get(cms_url).pipe(share());


            const apiList = [getRelatedCategoriesObs, refreshProductsObs, getFAQObs, getBreadCrump, getCmsDynamicDataForCategoryAndBrandObs];

            if (this._router.url.search('#') < 0) {
                apiList.push(getCmsDynamicDataForCategoryAndBrandObs)
            } else {
                this._commonService.cmsData = null;
                this._commonService.replaceHeading = false;
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
                        this.loaderService.setLoaderState(false);
                    }
                })
            );
        }
    }
    
}
