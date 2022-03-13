import {Injectable} from "@angular/core";
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from "../../../utils/services/data.service";
import CONSTANTS from "../../../config/constants";
import { ENDPOINTS } from '@app/config/endpoints';
@Injectable()
export class SavedCardService{

    constructor(private _dataService: DataService){

    }

    getSavedCards(data){
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API+ ENDPOINTS.CARD.GET_SAVED_CARD, {params:data}).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }

    pay(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, {body:data});
    }

    deleteSavedCard(data){
        //https://api.moglix.com/payment/deleteSavedCards?userEmail=nikhita.aron@moglix.com&cardToken=124576
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CARD.PD_SAVED_CARD, {body:data}).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }
}