import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressListModel } from '../models/shared-checkout.models';
import { CartService } from './cart.service';
import { DataService } from './data.service';
import { GlobalLoaderService } from './global-loader.service';
import { LocalAuthService } from './auth.service';

//TODO:Below methods in common service so clean up accordigly.
@Injectable({
    providedIn: 'root'
})
export class AddressService
{
    readonly API = CONSTANTS.NEW_MOGLIX_API;
    readonly EMPTY_ADDRESS: AddressListModel = { deliveryAddressList: [], billingAddressList: [] };
    handleError = (returnValue) => { this._globaleLoader.setLoaderState(false); return of(returnValue); }

    constructor(private _localAuthService: LocalAuthService, private _dataService: DataService, private _globaleLoader: GlobalLoaderService, private _cartService:CartService) { }

    //serviceable methods
    getAddressList(params)
    {
        this._globaleLoader.setLoaderState(true);
        const URL = `${this.API}${ENDPOINTS.GET_ADD_LIST}`;
        const PARAMS = { params: params, headerData: { "If-None-Match": 'W/"2-4KoCHiHd29bYzs7HHpz1ZA"' }, };
        return this._dataService.callRestful("GET", URL, PARAMS)
            .pipe(
                map((response) =>
                {
                    this._globaleLoader.setLoaderState(false);
                    if (response['status']) {
                        return this.separateDeliveryAndBillingAddress(response['addressList']);
                    }
                    return this.EMPTY_ADDRESS;
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.EMPTY_ADDRESS))
            );
    }

    postAddress(address)
    {
        this._globaleLoader.setLoaderState(true);
        const URL = `${this.API}${ENDPOINTS.POST_ADD}?onlineab=y`;
        return this._dataService.callRestful("POST", URL, { body: address }).pipe(
            map((response) =>
            {
                this._globaleLoader.setLoaderState(false);
                if (response['status']) {
                    return response['addressList'];
                }
                return { message: response['statusDescription'] || "Unable to save address"};
            }),
            catchError((error: HttpErrorResponse) => this.handleError([])),
        );
    }

    getGSTINDetails(gstin)
    {
        const URL = `${this.API}${ENDPOINTS.TAXPAYER_BY_TIN}${gstin}`;
        return this._dataService.callRestful("GET", URL);
    }

    getBusinessDetail(data)
    {
        this._globaleLoader.setLoaderState(true);
        const URL = `${this.API}${ENDPOINTS.CBD}`;
        return this._dataService.callRestful("GET", URL, { params: data }).pipe(
            map((response) =>
            {
                this._globaleLoader.setLoaderState(false);
                if (response['status']) {
                    return response['data'];
                }
                return null;
            }),
            catchError((error: HttpErrorResponse) => this.handleError(null)),
        );
    }

    setBusinessDetail(obj)
    {
        let URL = `${this.API}${ENDPOINTS.UPD_CUS}`;
        return this._dataService.callRestful("POST", URL, { body: obj }).pipe(
            map((response) =>
            {
                if (response['status']) { return response['status'] }
                return false;
            }),
            catchError((error: HttpErrorResponse) => this.handleError(false))
        );;
    }

    getStateList(countryId)
    {
        this._globaleLoader.setLoaderState(true);
        const URL = `${this.API}${ENDPOINTS.GET_StateList}`;
        const PARAMS = { params: { countryId: countryId } };
        return this._dataService.callRestful("GET", URL, PARAMS).pipe(
            map((response) =>
            {
                this._globaleLoader.setLoaderState(false);
                if (response['status']) { return response['dataList'] }
                return [];
            }),
            catchError((error: HttpErrorResponse) => this.handleError([]))
        );
    }

    getCountryList()
    {
        const URL = `${this.API}${ENDPOINTS.GET_CountryList}`;
        return this._dataService.callRestful("GET", URL)
            .pipe(
                map((response) =>
                {
                    if (response['status']) { return response['dataList'] }
                    return [];
                }),
                catchError((error: HttpErrorResponse) => { return of([]); })
            );
    }

    getCityByPostcode(postCode)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CITY_BY_PIN}${postCode}`;
        return this._dataService.callRestful("GET", URL).pipe(
            map((response) =>
            {
                if (response['status']) { return response['dataList'] }
                return [];
            }),
            catchError((error: HttpErrorResponse) => { return of([]); })
        );
    }

    //use this in product and checkout
    getServiceabilityAndCashOnDelivery(data)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.VALIDATE_PRODUCT_SER}`;
        return this._dataService.callRestful("POST", URL, { body: data }).pipe(
            map((response) =>
            {
                if (response['status']) { return response['data'] }
                return [];
            }),
            catchError((error: HttpErrorResponse) => { return of(null); })
        );
    }

    //utility methods section 

    //idAddressType=1 implies delivery
    //idAddressType=2 implies billing
    separateDeliveryAndBillingAddress(addressList: any[])
    {
        let deliveryAddressList: any[] = null;
        let billingAddressList: any[] = null;
        if (addressList.length === 0) { return { deliveryAddressList: [], billingAddressList: [] } }
        deliveryAddressList = addressList.filter((address) => address['addressType']['idAddressType'] === 1);
        if (deliveryAddressList.length === addressList.length) { return { deliveryAddressList: deliveryAddressList, billingAddressList: [] } }
        billingAddressList = addressList.filter((address) => address['addressType']['idAddressType'] === 2);
        return { deliveryAddressList: deliveryAddressList, billingAddressList: billingAddressList }
    }

    deleteAddress(index?,type?,address?) {
        if (address)
        {
            const addressType = address['addressType']['addressType'];
            const idAddress = address['idAddress']
            if (addressType === 'shipping' && this._cartService.shippingAddress){
                const cidAddress = this._cartService.shippingAddress['idAddress'];
                if (idAddress === cidAddress) { this._cartService.shippingAddress = null; }
            } else if (this._cartService.billingAddress) {
                const cidAddress = this._cartService.billingAddress['idAddress'];
                if (idAddress === cidAddress) { this._cartService.billingAddress = null; }
            }
        }else{
            this._cartService.shippingAddress = null;
            this._cartService.billingAddress = null;
        }
    }
}
