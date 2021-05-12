import {Injectable} from "@angular/core";
import CONSTANTS from "src/app/config/constants";
import { DataService } from "src/app/utils/services/data.service";
@Injectable()
export class RecentlyViewedCarouselService{
    constructor(private _dataService: DataService){

    }
    getrecentProdutc(user_id){
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API+"/recentlyviewed/getRecentlyViewd?customerId=" +user_id);
    }
}