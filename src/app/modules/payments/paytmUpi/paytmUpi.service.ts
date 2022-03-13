
import {Injectable} from "@angular/core";
import { ENDPOINTS } from '@app/config/endpoints';
import CONSTANTS from "../../../config/constants";
import { DataService } from "../../../utils/services/data.service";

@Injectable()
export class PaytmUpiService{

    constructor(private _dataService: DataService){

    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, {body:data});

    }
    paytmNewApicall(paytmupi){
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_VPA + paytmupi); 
   }
}
