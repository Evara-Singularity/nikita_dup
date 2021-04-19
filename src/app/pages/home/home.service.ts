import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators/catchError';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import CONSTANTS from 'src/app/config/constants';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class HomeService {

    constructor(public _dataService: DataService) { }

    // getHomePageData() {
    //     return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + '/homepage/layoutbyjson?requestType=mobile')
    //     .pipe(
    //         catchError((res: HttpErrorResponse) => {
    //             return of(null);
    //         })
    //     );
    // }

    getFlyoutDataApi(url) {
        return this._dataService.callRestful('GET', url)
        .pipe(
            catchError((res: HttpErrorResponse) => {
                return of([]);
            })
        );
    }
}
