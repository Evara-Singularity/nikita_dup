import {Injectable} from "@angular/core";
import { of } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from "../../utils/services/data.service";
import CONSTANTS from "../../config/constants";
@Injectable()
export class SavedCardService{

    constructor(private _dataService: DataService){

    }

    getSavedCards(data){
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API+"/payment/getSavedCards", {params:data}).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/payment/pay", {body:data});
    }

    deleteSavedCard(data){
        //https://api.moglix.com/payment/deleteSavedCards?userEmail=nikhita.aron@moglix.com&cardToken=124576
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/payment/postdeleteSavedCards", {body:data}).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }
}