import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators/catchError';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class HomeService {

    constructor(public _dataService: DataService) { }

    getFlyoutDataApi(url) {
        return this._dataService.callRestful('GET', url)
        .pipe(
            catchError((res: HttpErrorResponse) => {
                return of([]);
            })
        );
    }
}
