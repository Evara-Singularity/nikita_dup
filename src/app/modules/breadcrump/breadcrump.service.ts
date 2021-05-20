import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import CONSTANTS from 'src/app/config/constants';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class BreadcrumpService {

    constructor(public _dataService: DataService) {

    }

    getBreadcrumpData(link, type, pageTitle): Observable<any> {
        let curl = CONSTANTS.NEW_MOGLIX_API + "/homepage/getbreadcrumb?source=" + link + "&type=" + type;
        if (pageTitle) {
            curl += "&pagetitle=" + pageTitle;
        }
        return this._dataService.callRestful("GET", curl);
    }
}