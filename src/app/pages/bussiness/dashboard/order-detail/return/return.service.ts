import { Injectable } from '@angular/core';
import { API } from './../../../../../config/apiConfig';
import {DataService} from './../../../../data.service';


@Injectable()
export class ReturnService {

    constructor(public dataService: DataService) { }

    returnItem(obj)
    {
        let url = API.BASE_URLS.NEW_MOGLIX_API+"/payment/returnRefund";
        return this.dataService.callRestful("POST", url, {body:obj});
    }

    getCancelReasons(){
        let url = API.BASE_URLS.NEW_MOGLIX_API + "/order/cancelReasons";
        return this.dataService.callRestful("GET", url)
    }
}