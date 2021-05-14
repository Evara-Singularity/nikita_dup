import {Injectable} from "@angular/core";
import CONSTANTS from "../../config/constants";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class WalletService{

    constructor(private _dataService: DataService){

    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/payment/pay", {body:data});

    }
}
