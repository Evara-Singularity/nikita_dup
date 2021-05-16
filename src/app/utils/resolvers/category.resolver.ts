import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'
import { isPlatformServer } from '@angular/common';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { CommonService } from '../services/common.service';
import { CategoryService } from '@services/category.service';
import { Router } from '@angular/router';

const GFAQK: any = makeStateKey<{}>("GFAQK")// GFAQK: Get Frequently Asked Question Key
const GRCRK: any = makeStateKey<{}>('GRCRK'); // GRCRK: Get Related Category Result Key
const RPRK: any = makeStateKey<{}>('RPRK'); // RPRK: Refresh Product Result Key

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
        private _categoryService: CategoryService
    ) {
        this.pageName = "CATEGORY";
    }

    createDefaultParams(currentQueryParams, params, fragment) {

        const newParams: any = {
            queryParams: {}
        };

        const defaultParams = this._commonService.getDefaultParams();
        /**
         *  Below code is added to maintain the state of sortBy : STARTS
         */
        if (defaultParams['queryParams']['orderBy'] !== undefined) {
            newParams.queryParams['orderBy'] = defaultParams['queryParams']['orderBy'];
        }
        if (defaultParams['queryParams']['orderWay'] !== undefined) {
            newParams.queryParams['orderWay'] = defaultParams['queryParams']['orderWay'];
        }
        /**
         *  maintain the state of sortBy : ENDS
         */


        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        newParams['filter'] = {};

        newParams['category'] = params['id'];

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

        newParams['pageName'] = this.pageName;
        return newParams;
    }

    private getRelatedCategories(categoryID): Observable<{}> {
        if (this.transferState.hasKey(GRCRK)) {
            return of(this.transferState.get(GRCRK, {}));
        } else {
            return this._categoryService.getRelatedCategories(categoryID);
        }
    }

    private getFAQ(categoryID): Observable<{}> {
        if (this.transferState.hasKey(GFAQK)) {
            return of(this.transferState.get(GFAQK, []));
        } else {
            return this._categoryService.getFaqApi(categoryID).pipe(map(res => res['status'] && res['code'] == 200 ? res['data'] : []));
        }
    }

    private refreshProducts(currentQueryParams, params, fragment): Observable<{}> {
        const defaultParams = this.createDefaultParams(currentQueryParams, params, fragment);

        this._commonService.updateDefaultParamsNew(defaultParams);

        if (this.transferState.hasKey(RPRK) && !fragment) {
            return of(this.transferState.get(RPRK, {}));
        } else {
            return this._commonService.refreshProducts();
        }
    }

    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
        this.loaderService.setLoaderState(true);
        const currentQueryParams = _activatedRouteSnapshot.queryParams;
        const categoryId = _activatedRouteSnapshot.params.id;
        const fragment = _activatedRouteSnapshot.fragment;
        const params = _activatedRouteSnapshot.params;
        const getRelatedCategoriesObs = this.getRelatedCategories(categoryId).pipe(map(res => res));
        const getFAQObs = this.getFAQ(categoryId).pipe(map(res => res));
        const refreshProductsObs = this.refreshProducts(currentQueryParams, params, fragment).pipe(map(res => res));
        const getCmsDynamicDataForCategoryAndBrand = this._commonService.getCmsDynamicDataForCategoryAndBrand(categoryId).pipe(map(res => res));

        const apiList = [getRelatedCategoriesObs, refreshProductsObs, getFAQObs];

        if (this._router.url.search('#') < 0) {
            apiList.push(getCmsDynamicDataForCategoryAndBrand)
        } else {
            this._commonService.cmsData = null;
            this._commonService.replaceHeading = false;
        }

        const RPRK: any = makeStateKey<{}>("RPRK");
        if (this.transferState.hasKey(RPRK) && !fragment) {
            this.loaderService.setLoaderState(false);
            const listingObj = this.transferState.get<object>(RPRK, null);
            return of([listingObj]);
        } else {
            return forkJoin(apiList).pipe(
                catchError((err) => {
                    this.loaderService.setLoaderState(false);
                    return of(err);
                }),
                tap(result => {
                    if (isPlatformServer(this.platformId)) {
                        result['flag'] = true;
                        this.transferState.set(GRCRK, result[0]);
                        this.loaderService.setLoaderState(false);
                    }
                })
            );
        }


    }
}
