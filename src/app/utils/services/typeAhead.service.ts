import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { DataService } from './data.service';
import CONSTANTS from '../../config/constants';

@Injectable({
  providedIn: 'root'
})
export class TypeAheadService {

  constructor(
    private _dataService: DataService
  ) {
  }

  getSuggession(query: string): any {
    const url = CONSTANTS.NEW_MOGLIX_API +'/homepage/getsuggestion' + '?str=' + query;
    return this._dataService.callRestful('GET', url)
      .pipe(
        catchError((res: HttpErrorResponse) => {
          return of(null);
        })
      );
  }
  goToDirectBrandCatPage(term) {
    let url = CONSTANTS.NEW_MOGLIX_API + '/search/isBrandCategory?str=' + term;
    return this._dataService.callRestful('GET', url);
  }

  getTrendingCategories() {
    return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/category/trendingCategory");
  }

}
