import { LocalAuthService } from '@services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddressListModel, DeliveryAddressModel } from '../models/shared-checkout.models';
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
        private _localAuthService: LocalAuthService) { }

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

    postAddress(address)
    {
        this._globaleLoader.setLoaderState(true);
        const URL = `${this.API}${ENDPOINTS.POST_ADD}?onlineab=y`;
        return this._dataService.callRestful("POST", URL, { body: address }).pipe(
            map((response)=>{
                this._globaleLoader.setLoaderState(false);
                if (response['status']) {
                    return response['addressList'];
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

    getBusinessDetail(data)
    {
        const URL = `${this.API}${ENDPOINTS.CBD}`;
        return this._dataService.callRestful("GET", URL, { params: data });
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
            catchError((res: HttpErrorResponse) =>
            {
                this._globaleLoader.setLoaderState(false);
                return of([]);
            }),
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
                catchError((res: HttpErrorResponse) => { return of([]); })
            );
    }

    getCityByPinCode(pinCode)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CITY_BY_PIN }${pinCode}`;
        return this._dataService.callRestful("GET", URL);
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

    getCreateEditDeliveryAddressType(address, countryList, stateList)
    {
        const COUNTRY_ID = this.getCountry(countryList, address);
        const STATE_ID = this.getCountry(stateList, address);
        const ADDRESS = {};
        ADDRESS['idCountry'] = COUNTRY_ID;
        ADDRESS['idState'] = STATE_ID;
        ADDRESS['idAddress'] = address['idAddress'];
        ADDRESS['addressCustomerName'] = address['addressCustomerName'];
        ADDRESS['phone'] = address['phone'];
        ADDRESS['alternatePhone'] = address['alternatePhone'];
        ADDRESS['postCode'] = address['postCode'];
        ADDRESS['landmark'] = address['landmark'];
        ADDRESS['addressLine'] = address['addressLine'];
        ADDRESS['city'] = address['city'];
        ADDRESS['email'] = address['email'];
        ADDRESS['phoneVerified'] = address['phoneVerified'] || false;
        return ADDRESS;
    }

    getCountry(countryList, address)
    {
        if (address && address['country'] && address['country']['idCountry']) {
            return parseInt(address['country']['idCountry']);
        } else {
            return countryList[0]['idCountry'];
        }
    }

    getState(stateList, address)
    {
        if (address && address['state'] && address['state']['idState']) {
            return parseInt(address['state']['idState']);
        } else {
            return stateList[0]['idState'];
        }
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
