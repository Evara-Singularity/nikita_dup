/**
 * Created by kuldeep on 4/4/17.
 */

import {Injectable} from "@angular/core";
import CONSTANTS from "src/app/config/constants";
import { DataService } from "src/app/utils/services/data.service";
// import {DataService} from "../../data.service";
// import { API } from "../../../config/apiConfig";

@Injectable()
export class RecentlyViewedCarouselService{
    constructor(private _dataService: DataService){

    }
    getRecentlyViewedData(type, curl){
        if(typeof window == 'undefined'){
            // return this._dataService.callRestful('GET', curl);
        }
    }
    getrecentProdutc(user_id){
        // return of(
        //     {
        //         "statusCode": 200,
        //         "status": true,
        //         "data": [
        //             {
        //                 "outOfStock":false,
        //                 "brandName": "Eastman",
        //                 "productName": "Eastman Ball Pein Hammers, E-2064, 800 gms (Pack of 2)",
        //                 "partNumber": "MSNIN2QO8CP7",
        //                 "priceMrp": 744,
        //                 "priceWithoutTax": 482,
        //                 "priceWithTax": 569,
        //                 "url":"kirloskar-chhotu-05-hp-monoblock-water-pump/mp/msn2w6byxave3f",
        //                 "productImage": "https://cdn.moglix.com/p/I/Q/K/d/MINIQKCT5DR4W-medium.jpg"
        //             }
        //         ]
        //     }
        // )
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API+"/recentlyviewed/getRecentlyViewd?customerId=" +user_id);

    }
}