import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, share, switchMap, tap } from 'rxjs/operators'
import { isPlatformServer } from '@angular/common';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { CommonService } from '../services/common.service';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpClient } from '@angular/common/http';
import { RESPONSE } from '@nguniversal/express-engine/tokens';


@Injectable({
    providedIn: 'root'
})
export class AlpResolver implements Resolve<object> {
    private pageName = 'ATTRIBUTE';
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private loaderService: GlobalLoaderService,
        private _commonService: CommonService,
        private http: HttpClient,
    ) { }

    createDefaultParams(defaultApiParams, currentQueryParams, fragment)
    {
        let newParams = {
            searchTerm: defaultApiParams['str'], category: defaultApiParams['category'], pageName: this.pageName, queryParams: {}, filter: {}
        }
        //api params/filters
        if (defaultApiParams['str']) {
            newParams.queryParams['str'] = defaultApiParams['str'];
        }
        if (defaultApiParams['filter']) {
            let filterTemp = JSON.parse(decodeURIComponent(defaultApiParams['filter']));
            filterTemp = JSON.stringify(filterTemp).replace(/[+]/g, ' ');
            newParams.filter = JSON.parse(filterTemp);
        }
        let defaultParams = this._commonService.getDefaultParams();

        if (defaultParams['queryParams']['orderBy'] != undefined) {
            newParams.queryParams['orderBy'] = defaultParams['queryParams']['orderBy'];
        }
        if (defaultParams['queryParams']['orderWay'] != undefined) {
            newParams.queryParams['orderWay'] = defaultParams['queryParams']['orderWay'];
        }

        if (Object.keys(currentQueryParams).length === 0) {
            newParams.queryParams['orderBy'] = 'popularity';
            defaultParams['queryParams']['orderBy'] = 'popularity';
        }
        for (let key in currentQueryParams) {
            newParams.queryParams[key] = currentQueryParams[key];
        }

        if (fragment != undefined && fragment != null && fragment.length > 0) {
            let currentUrlFilterData: any = fragment.replace(/^\/|\/$/g, '');
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
            /*Below newCurrentUrlFilterData and for loop is added for a special case, / is coming also in voltage filter part*/
            let newCurrentUrlFilterData = "";
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                if (currentUrlFilterData[i] == "/" && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + "$";
                } else {
                    newCurrentUrlFilterData = newCurrentUrlFilterData + currentUrlFilterData[i];
                }
            }
            currentUrlFilterData = newCurrentUrlFilterData.split("/");
            if (currentUrlFilterData.length > 0) {
                var filter = {};
                for (var i = 0; i < currentUrlFilterData.length; i++) {
                    var filterName = currentUrlFilterData[i].substr(0, currentUrlFilterData[i].indexOf('-')).toLowerCase(); // "price"
                    var filterData = currentUrlFilterData[i].replace("$", "/").substr(currentUrlFilterData[i].indexOf('-') + 1).split("||"); // ["101 - 500", "501 - 1000"]
                    filter[filterName] = filterData;
                }
                newParams["filter"] = Object.assign({}, newParams["filter"], filter);
            }
        }
        return newParams;
    }

    private refreshProducts(defaultApiParams, currentQueryParams, fragment): Observable<{}>
    {
        defaultApiParams = this.createDefaultParams(defaultApiParams, currentQueryParams, fragment);
        defaultApiParams["pageName"] = this.pageName;
        this._commonService.updateDefaultParamsNew(defaultApiParams);
        return this._commonService.refreshProducts();
    }


    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object>
    {
        this._commonService.showLoader = true;
        const GET_CIMS_ATTRIBUTE_LISTING: any = makeStateKey<{}>('get_cims_attribute-' + _activatedRouteSnapshot.params['attribute'] + Math.random());
        const CATEGORY_CODE: any = makeStateKey<{}>('alp_category_code' + _activatedRouteSnapshot.params['attribute'] + Math.random());
        const BREADCRUMP: any = makeStateKey<{}>('breadcrump-' + _activatedRouteSnapshot.params['attribute']);
        const LISTING: any = makeStateKey<{}>('alp_listing' + _activatedRouteSnapshot.params['attribute']);

        if (this.transferState.hasKey(GET_CIMS_ATTRIBUTE_LISTING)) {// && this.transferState.hasKey(OTHER_DATA)
            const GET_CIMS_ATTRIBUTE_LISTING_OBJ = this.transferState.get<{}>(GET_CIMS_ATTRIBUTE_LISTING, null);
            const BREADCRUMP_OBJ = this.transferState.get<{}>(BREADCRUMP, null);
            this.transferState.remove(GET_CIMS_ATTRIBUTE_LISTING);
            this.transferState.remove(BREADCRUMP);
            this.loaderService.setLoaderState(false);
            return of([GET_CIMS_ATTRIBUTE_LISTING_OBJ, CATEGORY_CODE, BREADCRUMP_OBJ, LISTING]);
        } else {

            const cims_attribute_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CIMS_ATTRIBUTE + '?friendlyUrl=' + _activatedRouteSnapshot.params['attribute'];
            const get_category_code_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_BY_ID + '?catId=';
            const breadcrump_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.BREADCRUMB + "?type=category";
            const otherDataObj = this.http.get(cims_attribute_url).pipe(share(), mergeMap((_cimsResponse) =>
            {
                const CIMS_DATA = _cimsResponse['data'];
                if (CIMS_DATA && CIMS_DATA['defaultParams']['category']) {
                    const CATEGORY = CIMS_DATA['defaultParams']['category'];
                    const request = forkJoin([of(_cimsResponse),
                    this.http.get(get_category_code_url + CATEGORY).pipe(map(res => res)),
                    this.http.get(get_category_code_url + CATEGORY).pipe(mergeMap(catData => this.http.get(breadcrump_url + '&pagetitle=' + CIMS_DATA['attributesListing']['title'] + '&source=' + catData['categoryDetails']['categoryLink']))),
                    this.refreshProducts(CIMS_DATA['defaultParams'], _activatedRouteSnapshot.queryParams, _activatedRouteSnapshot.fragment).pipe(map(res => res))])
                    return request;
                }
                return forkJoin([of(_cimsResponse)]);
            }));

            return forkJoin([otherDataObj]).pipe(catchError((err) =>
            {
                this.loaderService.setLoaderState(false);
                console.log(err);
                return of(err);
            }),
                tap(result =>
                {
                    this.loaderService.setLoaderState(false);
                    if (isPlatformServer(this.platformId)) {
                        const RESPONSE = result[0];
                        this.transferState.set(GET_CIMS_ATTRIBUTE_LISTING, RESPONSE[0] || null);
                        this.transferState.set(CATEGORY_CODE, RESPONSE[1] || null);
                        this.transferState.set(BREADCRUMP, RESPONSE[2] || null);
                        this.transferState.set(LISTING, RESPONSE[3] || null);
                    }
                })
            );
        }
    }
}
