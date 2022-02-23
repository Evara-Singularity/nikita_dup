import { LocalAuthService } from '@services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressListModel } from '../models/shared-checkout.models';
import { DataService } from './data.service';
import { GlobalLoaderService } from './global-loader.service';

//TODO:Below methods in common service.


@Injectable({
    providedIn: 'root'
})
export class AddressService
{
    readonly API = CONSTANTS.NEW_MOGLIX_API;
    readonly EMPTY_ADDRESS: AddressListModel = { deliveryAddressList: [], billingAddressList: [] };

    constructor(private _dataService: DataService, private _globaleLoader: GlobalLoaderService,
        private _localAuthService:LocalAuthService) { }

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

    getVerifiedPhones(addressList: any[]): any[]
    {
        const USER_SESSION = this._localAuthService.getUserSession();
        let verifiedPhones = [];
        if (USER_SESSION && USER_SESSION['phoneVerified']) {
            verifiedPhones.push(USER_SESSION['phone']);
        }
        if (addressList.length) {
            const filtered = addressList.filter((address) => { return address.phoneVerified });
            const phones = filtered.map((address) => address.phone);
            verifiedPhones = [...verifiedPhones, ...phones];
        }
        return verifiedPhones;
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
