import {Injectable} from "@angular/core";
import { ENDPOINTS } from '@app/config/endpoints';
import CONSTANTS from "../../../../config/constants";
import { DataService } from "../../../../utils/services/data.service";

@Injectable()
export class RazorPayFormService{

    constructor(public _dataService: DataService){
    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+ ENDPOINTS.PAYMENT, {body:data});
    }
}