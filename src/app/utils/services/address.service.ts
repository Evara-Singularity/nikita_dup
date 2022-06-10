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
import { CheckoutUtil } from './../../pages/checkout-v2/checkout-util';
import { LocalAuthService } from './auth.service';
declare let dataLayer;

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

    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    invoiceType = this.INVOICE_TYPES.RETAIL;
    handleInvoiceTypeEvent(invoiceType: string) { this.invoiceType = invoiceType; }

    billingAddress = null;
    handleBillingAddressEvent(address)
    {
        this.billingAddress = address;
        this._cartService.billingAddress = address;
    }

    deliveryAddress = null;
    handleDeliveryAddressEvent(address)
    {
        this.deliveryAddress = address;
        this._cartService.shippingAddress = address;
        this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress, this.billingAddress);
    }

    /**
     * @description initiates the non-serviceable & non COD items processing
     * @param invoiceType containes retail | tax
     * @param deliveryAddress contains deliverable address
     * @param billingAddress contains billing address and optional for 'retail' case
     */
    verifyDeliveryAndBillingAddress(invoiceType, deliveryAddress, billingAddress) {
        if (deliveryAddress) { this._cartService.shippingAddress = deliveryAddress; }
        if (billingAddress) { this._cartService.billingAddress = billingAddress; }
        if (invoiceType) { this._cartService.invoiceType = invoiceType; }
        const POST_CODE = deliveryAddress && deliveryAddress['postCode'];
        if (!POST_CODE) return;
        if (invoiceType === this.INVOICE_TYPES.TAX && (!billingAddress)) return;
        this.verifyServiceablityAndCashOnDelivery(POST_CODE);
    }

    /**
     * @description to extract non-serviceable and COD msns
     * @param postCode deliverable post code
     */
    cartSession = null;
    verifyServiceablityAndCashOnDelivery(postCode) {
        const cartItems: any[] = this.cartSession ? this.cartSession['itemsList'] || [] : [];
        if ((!cartItems) || (cartItems.length === 0)) return;
        const MSNS = cartItems.map(item => item.productId);
        this.getServiceabilityAndCashOnDelivery({ productId: MSNS, toPincode: postCode }).subscribe((response) =>
        {
            if (!response) return;
            const AGGREGATES = CheckoutUtil.formatAggregateValues(response);
            const NON_SERVICEABLE_MSNS: any[] = CheckoutUtil.getNonServiceableMsns(AGGREGATES);
            const NON_CASH_ON_DELIVERABLE_MSNS: any[] = CheckoutUtil.getNonCashOnDeliveryMsns(AGGREGATES);
            this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
            this.updateNonDeliverableItems(cartItems, NON_CASH_ON_DELIVERABLE_MSNS);
        })
    }

    /**
     * @description to update the non serviceable items which are used in cart notfications
     * @param contains items is cart
     * @param nonServiceableMsns containes non serviceable msns
     */
    updateNonServiceableItems(cartItems: any[], nonServiceableMsns: any[]) {
        if (nonServiceableMsns.length) {
            const ITEMS = CheckoutUtil.filterCartItemsByMSNs(cartItems, nonServiceableMsns);
            const NON_SERVICEABLE_ITEMS = CheckoutUtil.formatNonServiceableFromCartItems(ITEMS);
            this._cartService.setUnserviceables(NON_SERVICEABLE_ITEMS);
            return;
        }
        this._cartService.setUnserviceables([]);
        this.sendServiceableCriteo();
    }

    /**@description updates global object to set in COD is available or not and used in payment section */
    updateNonDeliverableItems(cartItems: any[], nonCashonDeliverableMsns: any[]) {
        this._cartService.codNotAvailableObj['itemsArray'] = cartItems.filter((item) => nonCashonDeliverableMsns.includes(item.productId));
        this._cartService.cashOnDeliveryStatus.isEnable = nonCashonDeliverableMsns.length === 0;
    }

    sendServiceableCriteo()
    {
        let cartSession = this._cartService.getGenericCartSession;
        let dlp = [];
        for (let p = 0; p < cartSession["itemsList"].length; p++) {
            let product = {
                id: cartSession["itemsList"][p]['productId'],
                name: cartSession["itemsList"][p]['productName'],
                price: cartSession["itemsList"][p]['totalPayableAmount'],
                variant: '',
                quantity: cartSession["itemsList"][p]['productQuantity']
            };
            dlp.push(product);
        }
        dataLayer.push({
            'event': 'checkout',
            'ecommerce': {
                'checkout': {
                    'actionField': { 'step': 3, 'option': 'address' },
                    'products': dlp
                }
            },
        });
        let userSession = this._localAuthService.getUserSession();
        if (userSession && userSession.authenticated && userSession.authenticated == "true") {
            /*Start Criteo DataLayer Tags */
            dataLayer.push({
                'event': 'setEmail',
                'email': (userSession && userSession.email) ? userSession.email : ''
            });
            /*End Criteo DataLayer Tags */
        }
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
