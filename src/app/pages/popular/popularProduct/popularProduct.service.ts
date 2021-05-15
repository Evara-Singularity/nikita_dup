import { Injectable } from '@angular/core';
import { CONSTANTS } from '@config/constants';
import { DataService } from "@services/data.service";

@Injectable()
export class PopularProductService {

    constructor(private _dataService: DataService) {
    }


    getCategoryDetail(searchUrl) {
        let url = CONSTANTS.NEW_MOGLIX_API+"/search?str="+searchUrl+"&pageSize=40";
        return this._dataService.callRestful("GET",url);
    }

    getPopularKeywordDetails(searchUrl) {
        let url = CONSTANTS.NEW_MOGLIX_API+"/search/getDetailsForPopularKeywords?popularKeyword="+encodeURI(searchUrl);
        return this._dataService.callRestful("GET",url);
    }
}