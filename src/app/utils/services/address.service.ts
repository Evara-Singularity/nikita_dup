import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressListModal } from './../models/shared-checkout.modals';
import { DataService } from './data.service';
import { GlobalLoaderService } from './global-loader.service';

//TODO:Below methods in common service.


@Injectable({
    providedIn: 'root'
})
export class AddressService
{
    readonly API = CONSTANTS.NEW_MOGLIX_API;
    readonly EMPTY_ADDRESS: AddressListModal = { deliveryAddressList: [], billingAddressList: [] };

    constructor(private _dataService: DataService, private _globaleLoader: GlobalLoaderService) { }

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
                catchError((res: HttpErrorResponse) =>
                {
                    this._globaleLoader.setLoaderState(false);
                    return of(this.EMPTY_ADDRESS);
                }),
            );
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
                return response
            }),
            catchError((res: HttpErrorResponse) =>
            {
                this._globaleLoader.setLoaderState(false);
                return of({ status: false, statusCode: res.status, addressList: [] });
            }),
        );
    }

    getCountryList()
    {
        this._globaleLoader.setLoaderState(true);
        const URL = `${this.API}${ENDPOINTS.GET_CountryList}`;
        return this._dataService.callRestful("GET", URL)
            .pipe(
                map((response) =>
                {
                    this._globaleLoader.setLoaderState(false);
                    return response
                }),
                catchError((res: HttpErrorResponse) =>
                {
                    this._globaleLoader.setLoaderState(false);
                    return of({ status: false, statusCode: res.status, dataList: [] });
                })
            );
    }

    //idAddressType=1 implies delivery
    //idAddressType=2 implies billing
    separateDeliveryAndBillingAddress(addressList: any[])
    {
        let deliveryAddressList: any[] = null;
        let billingAddressList: any[] = null;
        if (addressList.length === 0) { return { deliveryAddressList: [], billingAddressList: [] } }
        addressList.sort((address1, address2) =>
        {
            const a1 = address1['addressType']['idAddressType'];
            const a2 = address2['addressType']['idAddressType'];
            return (a1 < a2) ? -1 : 1;
        });
        deliveryAddressList = addressList.filter((address) => address['addressType']['idAddressType'] === 1);
        if (deliveryAddressList.length === addressList.length) { return { deliveryAddressList: deliveryAddressList, billingAddressList: [] } }
        billingAddressList = addressList.slice(deliveryAddressList.length);
        return { deliveryAddressList: deliveryAddressList, billingAddressList: billingAddressList }
    }
}
