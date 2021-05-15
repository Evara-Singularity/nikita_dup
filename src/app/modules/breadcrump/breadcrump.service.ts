import { Injectable } from '@angular/core';
import { DataService } from '@app/utils/services/data.service';
import { CONSTANTS } from '@app/config/constants';
import { Observable } from "rxjs/Observable";

@Injectable()
export class BreadcrumpService {

    constructor(public _dataService: DataService) {

    }

    getBreadcrumpData(link, type ,pageTitle): Observable<any> {
        let curl = CONSTANTS.NEW_MOGLIX_API+"/homepage/getbreadcrumb?source="+link+"&type="+type;
         if(pageTitle){
            curl +="&pagetitle=" +pageTitle;  
        }
        // return this.dataService.callRestful("GET", url);
        return this._dataService.callRestful("GET", curl);
    }

    getBreadCrumpHttpApi(type, url){
        return this._dataService.callRestful("GET", url);
    }
}