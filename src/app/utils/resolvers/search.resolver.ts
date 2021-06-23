import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators'
import { isPlatformServer } from '@angular/common';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { CommonService } from '../services/common.service';

@Injectable({
    providedIn: 'root'
})
export class SearchResolver implements Resolve<object> {
    private pageName;
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private loaderService: GlobalLoaderService,
        private _commonService: CommonService,
    ) {
        this.pageName = "SEARCH";
    }

    createDefaultParams(currentQueryParams, params, fragment) {
        let newParams: any = {
            queryParams: {}
        };

        let defaultParams = this._commonService.getDefaultParams();
        /**
         *  Below code is added to maintain the state of sortBy : STARTS
         */
        if (defaultParams['queryParams']['orderBy'] != undefined)
            newParams.queryParams['orderBy'] = defaultParams['queryParams']['orderBy'];
        if (defaultParams['queryParams']['orderWay'] != undefined)
            newParams.queryParams['orderWay'] = defaultParams['queryParams']['orderWay'];
        /**
         *  maintain the state of sortBy : ENDS
         */

        //Object.assign(newParams["queryParams"], defaultParams['queryParams'], queryParams);
        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        // newParams["queryParams"] = queryParams;
        newParams["filter"] = {};
        newParams["category"] = params['id'];

        if (fragment != undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
            currentUrlFilterData = currentUrlFilterData.split("/");
            if (currentUrlFilterData.length > 0) {
                const filter = {};
                for (let i = 0; i < currentUrlFilterData.length; i++) {
                    const filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // "price"
                    const filterData = currentUrlFilterData[i].substr(currentUrlFilterData[i].indexOf('-') + 1).split("||"); // ["101 - 500", "501 - 1000"]
                    filter[filterName] = filterData;
                }
                newParams["filter"] = filter;
            }
        }

        newParams["pageName"] = this.pageName;
        return newParams;
    }


    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
        this.loaderService.setLoaderState(true);
        const currentQueryParams = _activatedRouteSnapshot.queryParams;
        const fragment = _activatedRouteSnapshot.fragment;
        const params = _activatedRouteSnapshot.params;
        const defaultParams = this.createDefaultParams(currentQueryParams, params, fragment);
        this._commonService.updateDefaultParamsNew(defaultParams);

        const RPRK: any = makeStateKey<{}>("RPRK");

        if (this.transferState.hasKey(RPRK)) {
            this.loaderService.setLoaderState(false);
            const listingObj = this.transferState.get<object>(RPRK, null);
            this.transferState.remove(RPRK);
            return of([listingObj]);
        } else {
            return forkJoin([this._commonService.refreshProducts()]).pipe(
                catchError((err) => {
                    this._commonService.showLoader = false;
                    console.log(err);
                    return of(err);
                }),
                tap(result => {
                    this._commonService.showLoader = false;
                    if (isPlatformServer(this.platformId)) {
                        this.transferState.set(RPRK, result[0]);
                    }
                })
            );
        }


    }
}
