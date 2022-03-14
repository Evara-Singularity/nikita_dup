import {Injectable} from "@angular/core";
import CONSTANTS from "../../../config/constants";
import { DataService } from "@app/utils/services/data.service";
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable()
export class NetBankingService{

    constructor(private _dataService: DataService){

    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, {body:data});
    }
}