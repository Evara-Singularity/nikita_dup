import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from './data.service';
const ERROR_RESPONSE = { data: null, status: false };

@Injectable({
    providedIn: 'root'
})
export class ProductBrowserService
{

    constructor(private _dataService: DataService, public http: HttpClient)
    { }

    getPastOrderProducts(userId)
    {
        //const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_PAST_ORDERS}${userId}`;
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.RECENTLY_VIEWED}${userId}`;
        return this._dataService.callRestful("GET", URL).pipe(
            catchError((error: HttpErrorResponse) => { return of(ERROR_RESPONSE); })
        );
    }

    getRecentProducts(userId)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.RECENTLY_VIEWED}${userId}`;
        return this._dataService.callRestful("GET", URL);
    }

    getSimilarProducts(productName, categoryId)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.SIMILAR_PRODUCTS}?str=${productName}&category=${categoryId}`;
        return this._dataService.callRestful('GET', URL).pipe(
            catchError((res: HttpErrorResponse) => { return of({ products: [], httpStatus: res.status }); })
        );
    }
}
