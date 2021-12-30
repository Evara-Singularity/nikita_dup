import {Injectable} from "@angular/core";
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from "../../utils/services/data.service";
import CONSTANTS from "../../config/constants";
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable()
export class EmiService{

    constructor(private _dataService: DataService){

    }

    getEmiValues(data){
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CLUSTER_EMI_VAL, {params:data}).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, {body:data});
    }
}