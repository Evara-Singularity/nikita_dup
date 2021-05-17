import { Injectable } from '@angular/core';
import { DataService } from '@services/data.service';
import { Observable } from 'rxjs';
import { CONSTANTS } from '@config/constants';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    constructor(private _dataService: DataService) {}

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
    getRelatedArticles(categoryId): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + `/cmsApi/getArticlesListByCategory?categoryCode=${categoryId}`;
        return this._dataService.callRestful("GET", url);
    }
}
