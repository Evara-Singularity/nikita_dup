import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import {
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, share, tap } from 'rxjs/operators'
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
    private pageName;
    constructor(
        @Inject(PLATFORM_ID) private platformId,
        private transferState: TransferState,
        private loaderService: GlobalLoaderService,
        private _commonService: CommonService,
        private http: HttpClient,
        @Optional() @Inject(RESPONSE) private _response

    ) {
        this.pageName = 'ATTRIBUTE';
    }

    createDefaultParams(defaultApiParams, currentQueryParams, fragment) {
        let newParams = {
            category: defaultApiParams['category'], pageName: 'ATTRIBUTE', queryParams: {}, filter: {}
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
            ////console.log(currentUrlFilterData);
            currentUrlFilterData = currentUrlFilterData.replace(/^\s+|\s+$/gm, '');
            /*Below newCurrentUrlFilterData and for loop is added for a special case, / is coming also in voltage filter part*/
            let newCurrentUrlFilterData = "";
            for (let i = 0; i < currentUrlFilterData.length; i++) {
                if (currentUrlFilterData[i] == "/" && /^\d+$/.test(currentUrlFilterData[i + 1])) {
                    //console.log(/^\d+$/.test(currentUrlFilterData[i+1]), newCurrentUrlFilterData);
                    newCurrentUrlFilterData = newCurrentUrlFilterData + "$";
                    //console.log(newCurrentUrlFilterData);
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
        // console.log('New Params', JSON.stringify(newParams));
        return newParams;
    }

    private refreshProducts(defaultApiParams, currentQueryParams, fragment): Observable<{}> {
        defaultApiParams = this.createDefaultParams(defaultApiParams, currentQueryParams, fragment);
        defaultApiParams["pageName"] = 'ATTRIBUTE';
        this._commonService.updateDefaultParamsNew(defaultApiParams);
        return this._commonService.refreshProducts();
    }


    resolve(_activatedRouteSnapshot: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
        this._commonService.showLoader = true;
        const GET_CIMS_ATTRIBUTE_LISTING: any = makeStateKey<{}>('get_cims_attribute-' + _activatedRouteSnapshot.params['attribute']);
        const OTHER_DATA: any = makeStateKey<{}>('other_data-' + _activatedRouteSnapshot.params['attribute']);
        const BREADCRUMP: any = makeStateKey<{}>('breadcrump-' + _activatedRouteSnapshot.params['attribute']);

        if (this.transferState.hasKey(GET_CIMS_ATTRIBUTE_LISTING) && this.transferState.hasKey(OTHER_DATA)) {
            const GET_CIMS_ATTRIBUTE_LISTING_OBJ = this.transferState.get<{}>(GET_CIMS_ATTRIBUTE_LISTING, null);
            const OTHER_DATA_OBJ = this.transferState.get<{}>(OTHER_DATA, null);
            const BREADCRUMP_OBJ = this.transferState.get<{}>(BREADCRUMP, null);
            this.transferState.remove(GET_CIMS_ATTRIBUTE_LISTING);
            this.transferState.remove(OTHER_DATA);
            this.transferState.remove(BREADCRUMP);
            this.loaderService.setLoaderState(false);
            return of([GET_CIMS_ATTRIBUTE_LISTING_OBJ, OTHER_DATA_OBJ, BREADCRUMP_OBJ]);
        } else {

            const cims_attribute_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CIMS_ATTRIBUTE + '?friendlyUrl=' + _activatedRouteSnapshot.params['attribute'];
            const get_category_code_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_BY_ID + '?catId=';
            const breadcrump_url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.BREADCRUMB + "?type=category";


            // attributeListing['title']

            const getCimsAttributeObs = this.http.get(cims_attribute_url).pipe(share());
            const otherDataObj = this.http.get(cims_attribute_url).pipe(share(), mergeMap(data =>
                    forkJoin([
                        this.http.get(get_category_code_url + data['data']['defaultParams']['category']).pipe(map(res => res)),
                        this.http.get(get_category_code_url + data['data']['defaultParams']['category']).pipe(mergeMap(catData => this.http.get(breadcrump_url + '&pagetitle=' + data['data']['attributesListing']['title'] + '&source=' + catData['categoryDetails']['categoryLink']))),
                        this.refreshProducts(data['data']['defaultParams'], _activatedRouteSnapshot.queryParams, _activatedRouteSnapshot.fragment).pipe(map(res => res))]),
                ));

            return forkJoin([getCimsAttributeObs, otherDataObj]).pipe(catchError((err) => {
                    this.loaderService.setLoaderState(false);
                    console.log(err);
                    return of(err);
                }),
                tap(result => {
                    //Abhishek:added condition
                    this.loaderService.setLoaderState(false);
                    if(result[0]['data'] == null){
                        this._response.status(404);
                    } else if(isPlatformServer(this.platformId)) {
                        this.transferState.set(GET_CIMS_ATTRIBUTE_LISTING, result[0]);
                        this.transferState.set(OTHER_DATA, result[1]);
                    }
                })
            );
        }
    }
}
