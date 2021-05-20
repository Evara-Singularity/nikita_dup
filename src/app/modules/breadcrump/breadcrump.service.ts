import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from '@app/utils/services/data.service';
import { Observable } from "rxjs/Observable";

@Injectable()
export class BreadcrumpService {

    constructor(public _dataService: DataService) {
    }

    getBreadcrumpData(link, type ,pageTitle): Observable<any> {
        let curl = CONSTANTS.NEW_MOGLIX_API+ ENDPOINTS.BREADCRUMB + "?source=" +link+"&type="+type;
         if(pageTitle){
            curl +="&pagetitle=" +pageTitle;  
        }
        return this._dataService.callRestful("GET", curl);
    }

}