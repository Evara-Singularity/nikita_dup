import { Injectable } from '@angular/core';
import { DataService } from '@services/data.service';
import { Observable } from 'rxjs';
import { CONSTANTS } from '@config/constants';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    constructor(private _dataService: DataService) {}

    getRelatedCategories(categoryId): Observable<any> {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_BY_ID + '?catId=' + categoryId;
        return this._dataService.callRestful('GET', url)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ categoryDetails: { active: false }, httpStatus: res.status });
                })
            );
    }
    getCategoryExtraData(categoryId): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CategoryExtras + categoryId;
        return this._dataService.callRestful("GET", url);
    }
    getFaqApi(categoryId): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CategorySchema + categoryId;
        return this._dataService.callRestful("GET", url);
    }
    getRelatedArticles(categoryId): Observable<any> {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ArticlesListByCategory + `${categoryId}`;
        return this._dataService.callRestful("GET", url);
    }
}
