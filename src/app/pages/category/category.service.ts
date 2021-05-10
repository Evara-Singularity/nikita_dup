import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { CONSTANTS } from '@app/config/constants';
import { catchError } from 'rxjs/operators/catchError';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from '@app/utils/services/data.service';

@Injectable()
export class CategoryService {

    constructor(private _dataService: DataService) {


    }

    getRelatedCategories(categoryId): Observable<any> {
        const url = CONSTANTS.NEW_MOGLIX_API + '/category/getcategorybyid?catId=' + categoryId;
        return this._dataService.callRestful('GET', url)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ categoryDetails: { active: false }, httpStatus: res.status });
                })
            );
    }
    getCategoryExtraData(categoryId): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + "/category/getcategoryExtras?requestType=" + categoryId;
        return this._dataService.callRestful("GET", url);
    }
    getFaqApi(categoryId): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + "/quest/getCategorySchema?categoryCode=" + categoryId;
        return this._dataService.callRestful("GET", url);
    }
}
