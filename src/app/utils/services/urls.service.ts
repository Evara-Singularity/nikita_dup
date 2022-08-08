import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from "./data.service";

@Injectable({ providedIn: 'any' })
export class UrlsService
{
    //user
    readonly GET_BUSINESS_DETAILS_BY_ID = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CBD}`;
    //cart
    readonly GET_CART_BY_SESSION_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_CartBySession}`;
    readonly CART_SHIPPING_CHARGES_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_ShippingValue}`;
    readonly VALIDATE_DTO_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.VALIDATE_BD}`;
    //promocode
    readonly DETAILS_BY_PROMOCODE_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CART.getPromoCodeDetails}?promoCode=`;
    readonly VALIDATE_PROMOCODE_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CART.validatePromoCode}`;
    //address
    readonly ADDRESS_LIST_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_ADD_LIST}`;
    //payment
    readonly RETRY_PAYMENT_URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_PAYMENT_DETAILS}`;


    //dont inject anything apart from DataService
    constructor(private _dataService: DataService) { }

    //user
    getBusinessDetail(userId)
    {
        return this._dataService.callRestful("GET", this.GET_BUSINESS_DETAILS_BY_ID, { params: { customerId: userId } }).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }
    
    //=======================================================END=================================================================//

    //promocode
    validatePromocode(shoppingCartDTO)
    {
        return this._dataService.callRestful('POST', this.VALIDATE_PROMOCODE_URL, { body: shoppingCartDTO }).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }

    //=======================================================END=================================================================//

    //cart
    getCartSession(sessionId, buyNow)
    {
        const reqCartSession = { "sessionid": sessionId, buyNow: buyNow };
        return this._dataService.callRestful("GET", this.GET_CART_BY_SESSION_URL, { params: reqCartSession }).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }

    getShippingCharges(shipping)
    {
        return this._dataService.callRestful('POST', this.CART_SHIPPING_CHARGES_URL, { body: shipping }).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }

    validateDto(validateDto)
    {
        return this._dataService.callRestful("POST", this.VALIDATE_DTO_URL, { body: validateDto }).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }

    //=======================================================END=================================================================//

    //address
    getAddressListByUserId(userId, invoiceType)
    {
        const reqAddressList = { customerId: userId, invoiceType: invoiceType };
        const ADDRESS_LIST_PARAMS = { params: reqAddressList, headerData: { "If-None-Match": 'W/"2-4KoCHiHd29bYzs7HHpz1ZA"' }, };
        return this._dataService.callRestful("GET", this.ADDRESS_LIST_URL, ADDRESS_LIST_PARAMS).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }

    //=======================================================END=================================================================//

    //payment
    getRetryPaymentByOrderId(orderId)
    {
        return this._dataService.callRestful("GET", this.RETRY_PAYMENT_URL, { params: { orderId: orderId } }).pipe(
            catchError((error: HttpErrorResponse) => this.errorHandler(error))
        );
    }

    //=======================================================END=================================================================//

    //implement log by declaring in environment.ts
    readonly errorHandler = function (error, customeResponse?)
    {
        //use environment and enable log
        const response = customeResponse ? customeResponse : { status: false };
        return of(response);
    }
}