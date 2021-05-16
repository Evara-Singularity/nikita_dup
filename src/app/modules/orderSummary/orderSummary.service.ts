import { Injectable } from "@angular/core";

import { catchError } from 'rxjs/operators/catchError';
import { of } from 'rxjs/observable/of';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from "../../utils/services/data.service";
import CONSTANTS from "../../config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
@Injectable()
export class OrderSummaryService {

    constructor(public _ds: DataService) {

    }

    applyPromoCode(obj) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validatePromoCode;
        return this._ds.callRestful('POST', url, { body: obj });
    }

    getShippingCharges(obj) {

        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
        return this._ds.callRestful("POST", url, { body: obj }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );

    }

    getAllPromoCodesByUserId(userID) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes + '?userId=' + userID;
        return this._ds.callRestful('GET', url).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    getPromoCodeDetailById(offerId) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoId=' + offerId;
        return this._ds.callRestful('GET', url).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }
}
