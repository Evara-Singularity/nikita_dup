import {Injectable} from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from '@app/config/endpoints';
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class PaymentService{

    constructor(private _dataService: DataService){

    }

    getAll(body){
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_PAYMENT, {body: body});
    }

    getBusinessDetail(userId) {    
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.BD +userId;
        return this._dataService.callRestful("GET", url);
    }

    getSavedCards(data, type){
        if(type && type=='tax'){
            return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CARD.GET_SAVED_CARD, {params:data});
        }else
            return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CARD.GET_SAVED_CARD, {params:data});
    }
}