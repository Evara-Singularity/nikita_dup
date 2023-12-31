import { CartUtils } from './cart-utils';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, delay, map, mergeMap, shareReplay, switchMap, tap, concatMap } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';
import { Address } from '../models/address.modal';
import { AddToCartProductSchema } from "../models/cart.initial";
import { LocalAuthService } from './auth.service';
import { DataService } from './data.service';
import { GlobalLoaderService } from './global-loader.service';

@Injectable({ providedIn: 'root' })
export class CartService
{

    readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
    readonly INVOICE_TYPE_RETAIL = 'retail';
    readonly INVOICE_TYPE_TAX = 'tax';
    readonly cashOnDeliveryStatus = { isEnable: true, message: "" };
    public extra: Subject<{ errorMessage: string }> = new Subject();
    public orderSummary: Subject<any> = new Subject();
    public totalPayableAmount: Subject<number> = new Subject<number>();
    public homePageFlyOut: Subject<any> = new Subject();
    public validateCartSession: Subject<any> = new Subject();
    public validAttributes: Subject<any> = new Subject();
    public payBusinessDetails: any;
    public businessDetailSubject: Subject<any> = new Subject<any>();
    public selectedBusinessAddressObservable: Subject<any> = new Subject();
    public productShippingChargesListObservable: Subject<any> = new Subject();
    private notificationsSubject: Subject<any[]> = new Subject<any[]>();
    public promoCodeSubject: Subject<{ promocode: string, isNewPromocode: boolean, totalOffer?: number }> = new Subject<{ promocode: string, isNewPromocode: boolean }>();
    public isCartEditButtonClick: boolean = false;
    public prepaidDiscountSubject: Subject<any> = new Subject<any>(); // promo & payments
    public cartCountSubject: Subject<any> = new Subject<any>(); // cartCountSubject 
    public autoLoginSubject: Subject<any> = new Subject<any>(); // autoLoginSubject 
    public wishListSubject: Subject<any> = new Subject<any>(); // autoLoginSubject 
    public codNotAvailableObj = {}; // cart.component
    public quickCheckoutCodMaxErrorMessage = null; 
    itemsValidationMessage = [];
    cartNotications = [];
    notifications = [];
    appliedPromoCode = null;
    allPromoCodes: Array<any> = [];
    topMatchedPromoCode: object = {};
    shippingCharges: number = 0;
    isPromoCodeValid: boolean = false;
    showNotification: boolean = false;

    // checkout related global vars
    private _billingAddress: Address;
    private _shippingAddress: Address;
    private _invoiceType: 'retail' | 'tax' = this.INVOICE_TYPE_RETAIL;
    private _lastPaymentMode = null;
    private _lastParentOrderId = null;

    // vars used in revamped cart login 
    private _buyNow;
    private _buyNowSessionDetails;
    private cartSession: any = {
        "noOfItems": 0,
        "cart": {},
        "itemsList": [],
        "proxy": true//front end created dummy cart session
    };
    public cart: Subject<{ count: number, currentlyAdded?: any }> = new Subject();
    private _cartUpdatesChanges: BehaviorSubject<any> = new BehaviorSubject(this.cartSession);
    public isProductRemoved: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _shippingPriceChanges: BehaviorSubject<any> = new BehaviorSubject(this.cartSession);
    private _shippingApiCall: BehaviorSubject<any> = new BehaviorSubject(this.cartSession);
    public isAddedToCartSubject: Subject<any> = new Subject<any>();

    private previousUrl: string = null;
    private currentUrl: string = null;
    prepaidDataMapping: any=null;
    totalPrepaidSaving=0;

    // TODO: move it to component level
    totalPayableAmountAfterPrepaid: number=0;
    totalPayableAmountWithoutPrepaid:number=0


    constructor(
        private _dataService: DataService, private _localStorageService: LocalStorageService, private localAuthService: LocalAuthService,
        private _loaderService: GlobalLoaderService, private _toastService: ToastMessageService,
        private _router: Router, private _globalLoader: GlobalLoaderService, private _location: Location, private _globalAnalyticsService: GlobalAnalyticsService,
    ) { this.setRoutingInfo(); }

    set billingAddress(address: Address) { this._billingAddress = address }

    get billingAddress() { return this._billingAddress }

    set shippingAddress(address: Address) { this._shippingAddress = address }

    get shippingAddress() { return this._shippingAddress }

    /**
     * Use const INVOICE_TYPE_RETAIL && INVOICE_TYPE_TAX
     */
    set invoiceType(type: 'retail' | 'tax') { this._invoiceType = type }

    get invoiceType() { return this._invoiceType }

    //ODP-1866
    set lastPaymentMode(mode: string) { this._lastPaymentMode = mode; }

    get lastPaymentMode() { return this._lastPaymentMode; }

    set lastParentOrderId(id: number) { this._lastParentOrderId = id; }

    get lastParentOrderId() { return this._lastParentOrderId; }

    get getPreviousUrl() { return this.previousUrl; }

    private setRoutingInfo()
    {
        this.currentUrl = this._router.url;
        this._router.events.subscribe(event =>
        {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            };
        });
    }

    getShippingValue(cartSession)
    {
        return this._dataService.callRestful('POST', CONSTANTS.GATEWAY_API + ENDPOINTS.GET_ShippingValue, { body: cartSession }).
            pipe(catchError((res: HttpErrorResponse) => { return of({ status: false, statusCode: res.status }); }));
    }

    setPayBusinessDetails(data) { Object.assign(this.payBusinessDetails, data); }

    getPayBusinessDetails() { return this.payBusinessDetails; }  

    //prepaid object
    generatePrepaidSession(prepaidDiscount) {
        this.totalPrepaidSaving = 0;
        this.prepaidDataMapping = Object.assign({}, ...prepaidDiscount.map(object => {
            if (object.applicable) {
                this.totalPrepaidSaving = this.totalPrepaidSaving + object.amount
            }
            return ({ [object.msn]: object })
        }))
    }

    get totalDisplayPayableAmountWithPrepaid() {
        let totalBasicAmount = this.getGenericCartSession.cart.tawot + this.getGenericCartSession.cart.tpt;
        // shipping
        totalBasicAmount = totalBasicAmount + (this.getGenericCartSession.cart.shippingCharges || 0)
        // offer 
        if (this.getGenericCartSession.cart.totalOffer !== 0 && this.getGenericCartSession.cart.totalOffer !== null) {
            totalBasicAmount = totalBasicAmount -  this.getGenericCartSession.cart.totalOffer
        }
        // prepaid saving
        totalBasicAmount = totalBasicAmount - (this.totalPrepaidSaving || 0)
        return totalBasicAmount;
    }

    get totalDisplayPayableAmountWithOutPrepaid() {
        let totalBasicAmount = this.getGenericCartSession.cart.tawot + this.getGenericCartSession.cart.tpt;
        // shipping
        totalBasicAmount = totalBasicAmount + (this.getGenericCartSession.cart.shippingCharges || 0)
        // offer 
        if (this.getGenericCartSession.cart.totalOffer !== 0 && this.getGenericCartSession.cart.totalOffer !== null) {
            totalBasicAmount = totalBasicAmount -  this.getGenericCartSession.cart.totalOffer
        }
        // prepaid saving
        return totalBasicAmount;
    }



    // get generic cart session object
    generateGenericCartSession(cartSessionFromAPI)
    {
        if (cartSessionFromAPI['prepaidDiscountList']) {
            this.generatePrepaidSession(cartSessionFromAPI['prepaidDiscountList']);
        }
        const modifiedCartSessionObject = {
            cart: Object.assign({}, cartSessionFromAPI['cart']),
            itemsList: (cartSessionFromAPI["itemsList"] ? [...cartSessionFromAPI["itemsList"]] : []),
            addressList: (cartSessionFromAPI["addressList"] ? [...cartSessionFromAPI["addressList"]] : []),
            payment: cartSessionFromAPI["payment"],
            offersList: cartSessionFromAPI["offersList"],
            extraOffer: cartSessionFromAPI["extraOffer"],
            prepaidDiscountList:cartSessionFromAPI['prepaidDiscountList'] || null            
        }
        let totalAmount: number = 0;
        let tawot: number = 0; // totalAmountWithOutTax
        let tpt: number = 0; //totalPayableTax
        let itemsList = modifiedCartSessionObject.itemsList ? modifiedCartSessionObject.itemsList : [];
        for (let item of itemsList) {
            if (item["bulkPrice"] == null) {
                item["totalPayableAmount"] = this.getTwoDecimalValue(item["productUnitPrice"] * item["productQuantity"]);
                item['tpawot'] = this.getTwoDecimalValue(item['priceWithoutTax'] * item['productQuantity']);
                item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            else {
                item["totalPayableAmount"] = (item["bulkPrice"]) ? this.getTwoDecimalValue(item["bulkPrice"] * item["productQuantity"]) : 0;
                item['tpawot'] = (item['bulkPriceWithoutTax']) ? this.getTwoDecimalValue(item['bulkPriceWithoutTax'] * item['productQuantity']) : 0;
                item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            totalAmount = this.getTwoDecimalValue(totalAmount + item.totalPayableAmount);
            tawot = this.getTwoDecimalValue(tawot + item.tpawot);
            tpt = tpt + item['tax'];
        };
        modifiedCartSessionObject.cart.totalAmount = totalAmount;
        modifiedCartSessionObject.cart.totalPayableAmount = (totalAmount + modifiedCartSessionObject.cart['shippingCharges']) - (modifiedCartSessionObject.cart['totalOffer'] || 0);
        modifiedCartSessionObject.cart.tawot = tawot;
        modifiedCartSessionObject.cart.tpt = tpt;
        modifiedCartSessionObject.itemsList = itemsList;
        return modifiedCartSessionObject;
    }

    // Get generic cart session
    get getGenericCartSession() { return this.cartSession; }

    // return the Cart Session Object
    setGenericCartSession(cart)
    {
        this.cartSession = JSON.parse(JSON.stringify(cart));
    }

    getCartSession() { return JSON.parse(JSON.stringify(this.cartSession)); }

    getTwoDecimalValue(a) { return Math.floor(a * 100) / 100; }

    // TODO: refactor this function as this Social login module
    updateCartSessions(routerLink, sessionDetails, buyNow?)
    {
        const cartObject = {
            "cart": sessionDetails["cart"],
            "itemsList": sessionDetails["itemsList"],
            "addressList": sessionDetails['addressList'],
            "payment": sessionDetails['payment'],
            "deliveryMethod": sessionDetails['deliveryMethod'],
            "offersList": sessionDetails['offersList']
        };
        return this.updateCartSession(cartObject)
    }

    /**
     * 
     * @param cartSessions 
     * @returns  // used in shared auth and shared cart item to create shipping API request
     */
    getShippingObj(cartSessions)
    {
        return CartUtils.getShippingObj(cartSessions, this.shippingAddress || null);
    }

    getCartBySession(params): Observable<any>
    {
        /**
         *  Return cart from server session.
         *  Save returned to service local variable: `cartSession`
         */
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CartBySession, { params: params })
            .pipe(map((cartSessionResponse) => this.handleCartResponse(cartSessionResponse)),);
    }

    private handleCartResponse(cartSessionResponse): any
    {
        if (cartSessionResponse?.['status'] == true && cartSessionResponse?.['statusCode'] == 200) {
            return cartSessionResponse
        }
        if (cartSessionResponse?.['status'] == true && cartSessionResponse?.['statusCode'] == 202) {
            // incase of session mismatch update new cart and userData 
            // cartsesion response will be different from regular cart session response
            console.log('CARTSESSION LOGS ==> mismatch condition encountered', cartSessionResponse);
            this.localAuthService.setUserSession(cartSessionResponse['userData']);
            return cartSessionResponse['cart'];
        }
        if (cartSessionResponse?.['status'] == false) {
            // logout user this case so that new valid session can be created
            this._toastService.show({ type: 'error', text: "Cart failed, Please login and try again", tDelay: 5000 });
            this.logOutAndClearCart();
            return null;
        }
    }

    logOutAndClearCart(redirectURL = null)
    {
        this.logoutCall().pipe(
            map(logoutReponse =>
            {
                this._localStorageService.clear("user");
                this.cart.next({ count: 0 });
                return logoutReponse;
            }),
            mergeMap(logoutReponse => this.checkForUserAndCartSessionAndNotify()),
        ).subscribe(status =>
        {
            if (status) {
                this._router.navigate([(redirectURL) ? redirectURL : '/login']);
            }
        })
    }

    set buyNowSessionDetails(sessionDetails) { this._buyNowSessionDetails = sessionDetails; }

    get buyNowSessionDetails() { return this._buyNowSessionDetails; }

    set buyNow(buyNow) { this._buyNow = buyNow; }

    get buyNow() { return this._buyNow; }

    /***
     * COMMON CHECKOUT LOGIC STARTS FOR SHARED CART MODULE
     */
    checkForShippingCharges()
    {
        this._getShipping(this.getGenericCartSession).subscribe(cartSession =>
        {
            this._notifyCartChanges(cartSession, '')
        })
    }

    /**
     * COMMON LOGIN AND CART MERGE CODE FOR SHARDED AUTH MODULE
     * */
    performAuthAndCartMerge(
        config: {
            enableShippingCheck?: boolean,
            redirectUrl?: string,
        }
    ): Observable<any>
    {
        const userSession = this.localAuthService.getUserSession();
        const cartSession = Object.assign(this.getGenericCartSession);
        cartSession['cart']['userId'] = userSession.userId;
        
        if(cartSession.cart && cartSession.cart.sessionId == undefined){
            cartSession.cart.sessionId = userSession.sessionId
        }
        return this.getSessionByUserId(cartSession)
            .pipe(
                mergeMap((cartSession) =>
                {
                    if (this.buyNow) {
                        return this.updateCartSessions(null, this._updateCartSessionForBuyNow(cartSession, userSession))
                    } else {
                        const updatedCartSession = this.generateGenericCartSession(cartSession);
                        this.setGenericCartSession(updatedCartSession);
                        return of(cartSession);
                    }
                }),
                mergeMap((cartSession: any) => {
                    if(cartSession && cartSession['offersList'] && cartSession['offersList'].length) {
                        return this.VerifyPromoCode(cartSession, userSession);
                    } else {
                        this.isPromoCodeValid = true;
                        return of(cartSession);
                    }
                }),
                mergeMap(cartSession =>
                {
                    if (cartSession && !this.isPromoCodeValid) { return this.updateCartSession(cartSession); }
                    return of(cartSession)
                }),
                mergeMap((cartSession: any) =>
                {
                    // only run shipping API when specified, eg. not required in Auth Module
                    // shipping API should be called after updatecart API always
                    const updatedCartSession = this.generateGenericCartSession(cartSession);
                    this.setGenericCartSession(updatedCartSession);
                    if (config.enableShippingCheck) {
                        return this._getShipping(cartSession);
                    } else {
                        return of(cartSession);
                    }
                }),
                map((result) =>
                {
                    if (result && result['cart'] && result['itemsList'] && Array.isArray(result['itemsList'])) {
                        return this._notifyCartChanges(result, config.redirectUrl || null);
                    } else {
                        return of(null);
                    }
                })
            )
    }

    private VerifyPromoCode(cartSession, userSession): Observable<any> {
        this.isPromoCodeValid = false;
        const promoId = cartSession['offersList'][0]['offerId'] || null;
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validateUserPromoCode + `?promoId=${promoId}&userId=${userSession.userId}`).pipe(
            map(res => {
                if (!res['status']) {
                    this.genericRemovePromoCode();
                    this.showNotification = true;
                    this._toastService.show({ type: 'error', text: res['statusDescription'] });
                } else {
                    this.isPromoCodeValid = true;
                    this.showNotification = false;
                }
                return cartSession;
            })
        )
    }

    private _updateCartSessionForBuyNow(cartSession, userSession): any
    {
        // update cartsession and with buynow flag
        const cartId = cartSession['cart']['cartId'];
        cartSession = this.buyNowSessionDetails; // should be set in while buynow
        cartSession['cart']['cartId'] = cartId;
        cartSession['itemsList'][0]['cartId'] = cartId;
        cartSession['cart']['userId'] = userSession.userId; //make sure correct userId is passed
        return cartSession;
    }

    private _getShipping(cartSession2): Observable<any>
    {
        // console.trace();
        const cartSession = this.getCartSession();
        let sro = this.getShippingObj(cartSession);
        // console.trace('_getShipping', Object.assign({}, cartSession), this.getCartSession())
        return this.getShippingValue(sro)
            .pipe(
                map((sv: any) =>
                {
                    if (sv && sv['status'] && sv['statusCode'] === 200) {
                        cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                        if (sv['data']['totalShippingAmount'] !== undefined && sv['data']['totalShippingAmount'] !== null) {
                            let itemsList = cartSession['itemsList'];
                            for (let i = 0; i < itemsList.length; i++) {
                                cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                            }
                        }
                    }
                    // console.log('shipping  cart session', this.generateGenericCartSession(cartSession));
                    const updatedCartSessionAfterShipping = this.generateGenericCartSession(cartSession);
                    // console.log('updatedCartSessionAfterShipping', updatedCartSessionAfterShipping);
                    this.setShippingPriceChanges(updatedCartSessionAfterShipping);
                    this.setGenericCartSession(updatedCartSessionAfterShipping);
                    return updatedCartSessionAfterShipping;
                })
            );
    }

    updateShippingCharges(sv, cartSession) {
        if (sv && sv['status'] && sv['statusCode'] === 200) {
            cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
            if (sv['data']['totalShippingAmount'] !== undefined && sv['data']['totalShippingAmount'] !== null) {
                let itemsList = cartSession['itemsList'];
                for (let i = 0; i < itemsList.length; i++) {
                    cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                }
            }
        }
        // console.log('shipping  cart session', this.generateGenericCartSession(cartSession));
        const updatedCartSessionAfterShipping = this.generateGenericCartSession(cartSession);
        // console.log('updatedCartSessionAfterShipping', updatedCartSessionAfterShipping);
        this.setShippingPriceChanges(updatedCartSessionAfterShipping);
        this.setGenericCartSession(updatedCartSessionAfterShipping);
        return updatedCartSessionAfterShipping;
    }

    public getShippingAndUpdateCartSession(cartSession): Observable<any>
    {
        if(cartSession && (cartSession['itemsList'] as any[]).length)
        {
            return this._getShipping(cartSession);
        }
        return of(cartSession)
    }

    /**
     * Trigger call subjects that are related to cart for updates for subscribers
     * @param result 
     * @param redirectUrl
     * @returns 
     */
    private _notifyCartChanges(result, redirectUrl)
    {
        // create generic format of cart
        const cartSession = this.generateGenericCartSession(result);
        // set cart obj copy in local var
        this.setGenericCartSession(cartSession);
        // this notify that cart is updated subcribe to changes when required. 
        // USE @getCartUpdatesChanges for subscribing
        this._cartUpdatesChanges.next(cartSession);
        // used in checkout order summary
        this.orderSummary.next(result);
        // incase login used
        this.localAuthService.login$.next(redirectUrl);
        // add product in cart count for header nav
        this.cart.next({ count: result.noOfItems || (result.itemsList ? result.itemsList.length : 0) });
        return cartSession;
    }

    // PAYMENTS RELATED UTILS STARTS 
    createValidatorRequest(extra)
    {
        const cart = this.cartSession["cart"];
        const cartItems = this.cartSession["itemsList"];
        const billingAddress = this.billingAddress;
        const userSession = this._localStorageService.retrieve('user');
        const offersList = Object.assign([], this.cartSession["offersList"]);;
        if (offersList != undefined && offersList.length > 0) {
            for (let key in offersList) {
                delete offersList[key]["createdAt"];
                delete offersList[key]["updatedAt"];
            }
        }
        let obj = {
            shoppingCartDto: {
                cart: {
                    cartId: cart["cartId"],
                    sessionId: cart["sessionId"],
                    userId: userSession["userId"],
                    agentId: cart["agentId"] ? cart["agentId"] : null,
                    isPersistant: true,
                    createdAt: null,
                    updatedAt: null,
                    closedAt: null,
                    orderId: null,
                    totalAmount: cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    totalOffer: cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                    totalAmountWithOffer: cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                    taxes: cart["taxes"] == null ? 0 : cart["taxes"],
                    totalAmountWithTaxes: cart["totalAmountWithTax"],
                    shippingCharges: cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                    currency: cart["currency"] == null ? "INR" : cart["currency"],
                    isGift: cart["gift"] == null ? false : cart["gift"],
                    giftMessage: cart["giftMessage"],
                    giftPackingCharges: cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                    totalPayableAmount: extra.paymentId == 14 ? extra.totalPayableAmount :  (cart["totalAmount"] == null ? 0 : cart["totalAmount"] ),
                    noCostEmiDiscount: extra.noCostEmiDiscount == 0 ? 0 : extra.noCostEmiDiscount,
                },
                itemsList: this.getItemsList(cartItems),
                addressList: [{
                    addressId: extra.addressList.idAddress,
                    type: "shipping",
                    invoiceType: this.invoiceType,
                }],
                payment: {
                    paymentMethodId: extra.paymentId,
                    type: extra.mode,
                    bankName: extra.bankname,
                    bankEmi: extra.bankcode,
                    emiFlag: extra.emiFlag,
                    gateway: extra.gateway,
                },
                deliveryMethod: {
                    deliveryMethodId: 77,
                    type: "kjhlh",
                },
                prepaidDiscounts: (extra.mode == 'COD' || extra.bankOffer) ? null : ((this.getCartSession().prepaidDiscountList) ? this.getCartSession().prepaidDiscountList : null),
                offersList: offersList != undefined && offersList.length > 0 ? offersList : null,
                extraOffer: this.cartSession["extraOffer"] ? this.cartSession["extraOffer"] : null,
                device: CONSTANTS.DEVICE.device,
            },
        };
        if(extra.bankOffer)
        {
            let bankOffer = {
                bankOffer:extra.bankOffer ? extra.bankOffer : null,
                bin: extra.ccnum.slice(0, 6),
                paymentMode: extra.paymentMode,
                cardNumber : extra.ccnum,
                paymentCode : extra.paymentMode == 'emi' ? extra.paymentCode : null,
                userToken : userSession["userId"]
            }
            obj["shoppingCartDto"]["bankOffer"]  = bankOffer;
            obj["shoppingCartDto"]["prepaidDiscounts"]=[]; 
        }
        if (cart["buyNow"]) {
            obj["shoppingCartDto"]["cart"]["buyNow"] = cart["buyNow"];
        }
        if (billingAddress !== undefined && billingAddress !== null) {
            obj.shoppingCartDto.addressList.push({
                addressId: billingAddress['idAddress'],
                type: "billing",
                invoiceType: this.invoiceType,
            });
        }
        if(this.lastParentOrderId)
        {
            cart['lastParentOrderId'] = this.lastParentOrderId
        }
        return obj;
    }

    public getItemsList(cartItems)
    {
        let itemsList = [];
        if (cartItems != undefined && cartItems != null && cartItems.length > 0) {
            for (let i = 0; i < cartItems.length; i++) {
                let item = {
                    productId: cartItems[i]["productId"],
                    productName: cartItems[i]["productName"],
                    brandName: cartItems[i]["brandName"],
                    productImg: cartItems[i]["productImg"],
                    amount: cartItems[i]["amount"],
                    offer: cartItems[i]["offer"],
                    amountWithOffer: cartItems[i]["amountWithOffer"],
                    taxes: cartItems[i]["taxes"],
                    amountWithTaxes: cartItems[i]["amountWithTaxes"],
                    totalPayableAmount: cartItems[i]["totalPayableAmount"],
                    isPersistant: true,
                    productQuantity: cartItems[i]["productQuantity"],
                    productUnitPrice: cartItems[i]["productUnitPrice"],
                    expireAt: cartItems[i]["expireAt"],
                    bulkPriceMap: cartItems[i]["bulkPriceMap"],
                    bulkPrice: cartItems[i]["bulkPrice"],
                    priceWithoutTax: cartItems[i]["priceWithoutTax"],
                    bulkPriceWithoutTax: cartItems[i]["bulkPriceWithoutTax"],
                    taxPercentage: cartItems[i]["taxPercentage"],
                    categoryCode: cartItems[i]["categoryCode"],
                    taxonomyCode: cartItems[i]["taxonomyCode"],
                };
                if (cartItems[i]["buyNow"]) {
                    item["buyNow"] = true;
                }
                itemsList.push(item);
            }
        }
        return itemsList;
    }

    public _getPrepaidDiscount(body)
    {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_PrepaidDiscount, { body: body }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    /** Pradeep:As per Yogender, by passing the logic.
     * if this is enabled then cart totalPayableAmount should be modified
    */
    validatePaymentsDiscount(paymentMode, paymentId): Observable<any>
    {
        //Pradeep:by pass code
        const byPass = true;
        if (byPass) {
            const cart = this.cartSession['cart'];
            const totalPayableAmount = (cart['totalAmount'] + cart['shippingCharges'] )- cart['totalOffer'];
            return of({ prepaidDiscount: 0, totalPayableAmount: totalPayableAmount });
        }
        //Pradeep:this is original code which should be there and remove above by pass code.
        return of({
            "mode": paymentMode,
            "paymentId": paymentId,
            addressList: this.shippingAddress
        }).pipe(
            map((args) =>
            {
                const validatorRequest = this.createValidatorRequest(args);
                return validatorRequest.shoppingCartDto;
            }),
            mergeMap((payload) =>
            {
                return this._getPrepaidDiscount(payload).pipe(map((cartSessionResponse) =>
                {
                    if (cartSessionResponse && cartSessionResponse['status'] == true && cartSessionResponse['data']) {
                        return cartSessionResponse['data']
                    }
                    return null;
                }))
            }),
            map((cartSession) =>
            {
                if (!cartSession) return null;
                let prepaidDiscount = 0;
                let totalPayableAmount = 0;

                if (cartSession['extraOffer'] && cartSession['extraOffer']['prepaid']) {
                    prepaidDiscount = cartSession['extraOffer']['prepaid']
                }

                if (cartSession && cartSession['cart']) {
                    const cart = Object.assign({}, cartSession['cart']);
                    let shipping = cart.shippingCharges ? cart.shippingCharges : 0;
                    let totalAmount = cart.totalAmount ? cart.totalAmount : 0;
                    let totalOffer = cart.totalOffer ? cart.totalOffer : 0;
                    totalPayableAmount = totalAmount + shipping - totalOffer - prepaidDiscount;
                }
                return {
                    prepaidDiscount,
                    totalPayableAmount,
                    cartSession
                }
            })
        )
    }

    // PAYMENTS RELATED UTILS STARTS 
    // COMMON CART LOGIC IMPLEMENTATION STARTS
    /** 
     * Target modules Product listing pages i.e. search, brand, category, brand+categrory
     * this function return null or cartsession object 
     * null is returned incase product already in cart AND null is also return incase of buynow without login. 
     * incase of without login buynow, temp session can checked in cartService.buyNowSessionDetails
    */
     addToCart(args: {
        buyNow: boolean,
        productDetails: AddToCartProductSchema
    }): Observable<any>
    {
        this.buyNow = args.buyNow;
        this.buyNowSessionDetails = null;
        return this._checkForUserAndCartSession().pipe((
            // Action : Check whether product already exist in cart itemList if exist exit
            map(cartSession =>
            {
                // incase of buynow do not exlude 
                let productItemExistInCart = false;
                productItemExistInCart = this._checkProductItemExistInCart(args.productDetails.productId, cartSession);
                let updatedCartSession = cartSession;
                updatedCartSession = this._checkQuantityOfProductItemAndUpdate(
                    args.productDetails,
                    cartSession,
                    args.productDetails.productQuantity,
                    args.buyNow,
                    args.productDetails.isProductUpdate
                );
                //this._loaderService.setLoaderState(false);
                if (args.buyNow) {
                    return { cartSession: updatedCartSession, productItemExistInCart };
                }
                return {
                    cartSession: updatedCartSession,
                    productItemExistInCart,
                }
            })
        )).pipe(
            // Action : update sessionId & cartId in productDetails
            map(({ cartSession, productItemExistInCart }) =>
            {
                // console.log('step 2 ==>', cartSession);
                if (!cartSession) {
                    return cartSession;
                } else {
                    // do not add product if already existed in cart
                    if (!productItemExistInCart) {
                        args.productDetails.cartId = cartSession['cart']['cartId'];
                        args.productDetails.buyNow = args.buyNow;
                        cartSession['cart']['buyNow'] = args.buyNow;
                        // Action : While adding check whether it is buynow flow, 
                        // if yes then a add a single product and maintain buynow flow
                        const items = (cartSession['itemsList']) ? [...cartSession['itemsList']] : [];
                        // update buynow flag items
                        cartSession['itemsList'] = (args.buyNow) ? [args.productDetails] : [...items, args.productDetails];
                    }
                    // remove promocodes incase of buynow
                    cartSession = (args.buyNow) ? this._removePromoCode(cartSession) : Object.assign({}, cartSession);
                    // calculate total price and cart value.
                    cartSession = this.generateGenericCartSession(cartSession)
                    //if not buynow flow then update global cart session in service
                    if (!args.buyNow) {
                        this.setGenericCartSession(cartSession);
                    }
                    return cartSession;
                }
            }),
            mergeMap(cartSession =>
            {
                return this._getUserSession().pipe(
                    map(userSession =>
                    {
                        if (args.buyNow && (!userSession || userSession['authenticated'] != "true")) {
                            // add temp session for buynow
                            // as per current flow, update cart api should not be called for buynow if user is not logged in
                            this.buyNow = true;
                            this.buyNowSessionDetails = cartSession;
                            return null;
                        } else {
                            return cartSession;
                        }
                    }),
                )
            }),
            mergeMap(request =>
            {
                if (request) { return this.updateCartSession(request).pipe(
                    map(updatedCartResponse=>{
                        const updatedCartSession = this.generateGenericCartSession(updatedCartResponse);
                        this.setGenericCartSession(updatedCartSession);
                        return updatedCartResponse;
                    })
                ); }
                return of(null)
            }),
            mergeMap((cartSession: any) =>
            {
                // this will be called to update the discount of products when there is an applied promocode
                if (cartSession && cartSession['offersList'] && cartSession['offersList'].length) {
                    const offerId = cartSession['offersList'][0]['offerId'];
                    const promo = this.allPromoCodes.find(promo => promo.promoId === offerId);
                    this.verifyAndApplyPromocode(cartSession, promo['promoCode'], false).subscribe(({ cartSession, isUpdated }: any) => {
                        if (isUpdated) {
                            this.postProcessAfterPromocode(promo['promoCode'], cartSession['promoCode'], true);
                            return;
                        }
                    })
                    return cartSession;
                } else {
                    return of(cartSession);
                }
            }),
            mergeMap((cartSession: any) =>
            {
                // only run shipping API when specified, eg. not required in Auth Module
                // shipping API should be called after updatecart API always
                if (cartSession) {
                    return this._getShipping(cartSession).pipe(
                        map((cartSession: any) => {
                            return cartSession; 
                        }),
                        map((cartSession) => { return this._notifyCartChanges(cartSession, null); })
                    );
                } else {
                    return of(cartSession);
                }
            }),
        )
    }

    /**
     * @param sessionCart
     * Update cart on server session and then in local service varialbe: `cartSession` also
     */

     multipleAddToCart(args: {
        buyNow: boolean,
        productDetailsList
    }): Observable<any>
    {
        this.buyNow = args.buyNow;
        this.buyNowSessionDetails = null;
        return this._checkForUserAndCartSession().pipe(
          // Action : Check whether product already exist in cart itemList if exist exit
          map((cartSession) => {
            // incase of buynow do not exlude
            for (let i = 0; i < args.productDetailsList.length; i++) {
              let productItemExistInCart = false;
              productItemExistInCart = this._checkProductItemExistInCart(
                args.productDetailsList[i].productId,
                cartSession
              );
              let updatedCartSession = cartSession;
              updatedCartSession = this._checkQuantityOfProductItemAndUpdate(
                args.productDetailsList[i],
                cartSession,
                args.productDetailsList[i].productQuantity,
                args.buyNow,
                args.productDetailsList[i].isProductUpdate
              );
              // do not add product if already existed in cart
              if (!productItemExistInCart) {
                args.productDetailsList[i].cartId =
                  cartSession["cart"]["cartId"];
                args.productDetailsList[i].buyNow = args.buyNow;
                cartSession["cart"]["buyNow"] = args.buyNow;
                // Action : While adding check whether it is buynow flow,
                // if yes then a add a single product and maintain buynow flow
                const items = cartSession["itemsList"]
                  ? [...cartSession["itemsList"]]
                  : [];
                // update buynow flag items
                cartSession["itemsList"] = args.buyNow
                  ? [args.productDetailsList[i]]
                  : [...items, args.productDetailsList[i]];
              }
              // remove promocodes incase of buynow
              //cartSession = (args.buyNow) ? this._removePromoCode(cartSession) : Object.assign({}, cartSession);
              // calculate total price and cart value.
              console.log("cartSession ---->", cartSession);
              cartSession = this.generateGenericCartSession(cartSession);
              //if not buynow flow then update global cart session in service
              if (!args.buyNow) {
                this.setGenericCartSession(cartSession);
              }
              if (i == args.productDetailsList.length - 1) {
                return cartSession;
              }
            }
          }),
          mergeMap((request) => {
            if (request) {
              return this.updateCartSession(request).pipe(
                map((updatedCartResponse) => {
                  const updatedCartSession =
                    this.generateGenericCartSession(updatedCartResponse);
                  this.setGenericCartSession(updatedCartSession);
                  return updatedCartResponse;
                })
              );
            }
            return of(null);
          }),
          mergeMap((cartSession: any) => {
            // only run shipping API when specified, eg. not required in Auth Module
            // shipping API should be called after updatecart API always
            if (cartSession) {
              return this._getShipping(cartSession).pipe(
                map((cartSession: any) => {
                  return cartSession;
                }),
                map((cartSession) => {
                  return this._notifyCartChanges(cartSession, null);
                })
              );
            } else {
              return of(cartSession);
            }
          })
        );
    }
    updateCartSession(sessionCart): Observable<any>
    {
        // delete extra props
        this._loaderService.setLoaderState(true);
        sessionCart['itemsList'].map((item) =>
        {
            delete item['tax'];
            delete item['tpawot'];
        });
        delete sessionCart['cart']['tawot'];
        delete sessionCart['cart']['tpt'];
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPD_CART, { body: sessionCart })
            .pipe(
                map((cartSessionReponse) =>
                {
                    this._loaderService.setLoaderState(false);
                    if (cartSessionReponse['status']) {
                        return this.generateGenericCartSession(cartSessionReponse);;
                    }
                    // api returns false, then return actual object returned from server
                    return cartSessionReponse;
                })
            );
    }

    // latest cartsession
    public getCartUpdatesChanges(): Observable<any>
    {
        return this._cartUpdatesChanges.pipe(shareReplay(1));
    }

    public setCartUpdatesChanges(cartsession): void
    {
        this._cartUpdatesChanges.next(cartsession);
    }

    public productRemovalNofify(): Observable<any> {
        return this.isProductRemoved.asObservable();
    }

    public getShippingPriceChanges(): Observable<any>
    {
        return this._shippingPriceChanges.asObservable()
    }

    public setShippingPriceChanges(cartsession): void {
        this._shippingPriceChanges.next(cartsession);
    }

    public shippingValueApiUpdates(): Observable<any>
    {
        return this._shippingApiCall.asObservable()
    }

    public callShippingValueApi(cartsession): void {
        // console.log('callShippingValueApi cartsession', cartsession);
        this._shippingApiCall.next(cartsession);
    }

    // refresh and chnages to communicated 
    public refreshCartSesion()
    {
        // we do not want to refresh cart by pages component in case buynow event
        // conditional are hacks used because localtion.goback() refresh page and 
        // call getcartsession API from pages component (root module)
        //console.log('WINDOW Histroy', window.history.length, this.previousUrl, this.currentUrl, this._router.url);
        if (
            (
                !this._buyNow &&
                !this.buyNowSessionDetails &&
                (this._router.url.indexOf('checkout/payment') === -1) &&
                (this._router.url.indexOf('auto-login') === -1) &&
                !(this._router.url.indexOf('checkout/address') > 0 && this.previousUrl.indexOf('checkout/payment') > 0 && this._buyNow)
            ) || (
                (this._router.url.indexOf('checkout/payment') > 0) && (this.previousUrl.indexOf('checkout/payment') > 0)
            )
        ) {
            this.checkForUserAndCartSessionAndNotify().subscribe(status =>
            {
                if (status) {
                    this._cartUpdatesChanges.next(this.cartSession);
                } else {
                    console.trace('cart refresh failed');
                }
            })
        }
    }

    // incase of update use this to notify cart session
    publishCartUpdateChange(cartSession) { this._cartUpdatesChanges.next(cartSession); }

    // delete a item from cart and update cart session
    updateCartAfterRemovingItem(removeIndex)
    {
        let cartSession = this.getGenericCartSession;
        cartSession.itemsList.splice(removeIndex, 1);
        this.updateCartSession(cartSession).subscribe(updatedCartSession =>
        {
            this.publishCartUpdateChange(updatedCartSession);
            this._loaderService.setLoaderState(false);
            if (!updatedCartSession.itemsList.length) this._router.navigateByUrl('/quickorder');
            this._toastService.show({ type: 'error', text: 'Product successfully removed from Cart' });
            this.setGenericCartSession(updatedCartSession);
        });
    }

    checkForUserAndCartSessionAndNotify(buyNow?): Observable<boolean>
    {
        return this._getUserSession().pipe(
            map(userSessionDetails =>
            {
                const request = Object.assign({}, { "sessionid": userSessionDetails['sessionId'] });
                if (buyNow){
                    request['buyNow'] = buyNow;
                }
                return request;
            }),
            mergeMap(request =>
            {
                return this.getCartBySession(request).pipe(
                    map((res: any) =>
                    {
                        return this.generateGenericCartSession(res);
                    })
                );
            }),
            // mergeMap(request =>
            // {
            //     return this.getShippingAndUpdateCartSession(request).pipe(
            //         map((res: any) =>
            //         {
            //             return this.generateGenericCartSession(res);
            //         })
            //     );
            // }),
            map(cartSessionResponse =>
            {
                if (cartSessionResponse) {
                    this._notifyCartChanges(cartSessionResponse, '');
                    return true;
                } else {
                    return false;
                }
            })
        )
    }

    getAddToCartProductItemRequest(args: { productGroupData, buyNow, selectPriceMap?, quantity?, isFbt?, languageMode?, originalProductBO?, v1?}, v1 = false, fbtProduct = false): AddToCartProductSchema {
        const userSession = this.localAuthService.getUserSession();
        const partNumber = v1 ? args.productGroupData['msn'] : args.productGroupData['partNumber'] || args.productGroupData['defaultPartNumber'];
        const isProductPriceValid = v1 ? args.productGroupData['isProductPriceValid'] : args.productGroupData['isProductPriceValid'] || args.productGroupData['productPartDetails'][partNumber]['productPriceQuantity'] != null;
        const priceQuantityCountry = (isProductPriceValid) ? v1 ? args.productGroupData['priceQuantityCountry'] : Object.assign({}, args.productGroupData['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
        const productPartDetails = !v1 ? args.productGroupData['productPartDetails'][partNumber] : args.productGroupData;
        const productMrp = (isProductPriceValid && priceQuantityCountry) ? priceQuantityCountry['mrp'] : null;
        const productTax = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice']) && !isNaN(priceQuantityCountry['sellingPrice'])) ?
            (Number(priceQuantityCountry['sellingPrice']) - Number(priceQuantityCountry['sellingPrice'])) : 0;
        const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
        const priceWithoutTax = (priceQuantityCountry) ? priceQuantityCountry['priceWithoutTax'] : null;
        const productBrandDetails = args.productGroupData['brandDetails'] || args.productGroupData.productBrandDetails;
        const productCategoryDetails = args.productGroupData['categoryDetails'] ? args.productGroupData['categoryDetails'][0] : args.productGroupData.productCategoryDetails;
        const productMinimmumQuantity = (priceQuantityCountry && priceQuantityCountry['moq']) ? priceQuantityCountry['moq'] : 1;
        const incrementUnit = (priceQuantityCountry && priceQuantityCountry['incrementUnit']) ? priceQuantityCountry['incrementUnit'] : 1;
        const productLinks = productPartDetails['productLinks'];
        const productURL = (args.languageMode) ? v1 ? args.productGroupData['productUrl'] : args.originalProductBO['defaultCanonicalUrl'] : (productPartDetails['canonicalUrl'] || productLinks['canonical'] || productLinks['default']);
        const product = {
            sessionId: userSession.sessionId,
            cartId: null,
            productId: partNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
            amount: Number(productMrp),
            offer: null,
            amountWithOffer: null,
            taxes: productTax,
            amountWithTaxes: null,
            totalPayableAmount: productPrice,
            productName: (args.languageMode && !fbtProduct) ? args.originalProductBO['productName'] : args.productGroupData['productName'],
            brandName: (args.languageMode && !fbtProduct) ? args.originalProductBO['brandDetails']['brandName'] : productBrandDetails['brandName'],
            brandId: (productBrandDetails)?productBrandDetails['idBrand']:'',
            priceWithoutTax: priceWithoutTax,
            taxPercentage: priceQuantityCountry['taxRule']['taxPercentage'],
            productImg: v1 ? `${this.imageCdnPath}${args.productGroupData['productAllImages'][0]['links']['thumbnail']}` : (productPartDetails['images']) ? `${this.imageCdnPath}${productPartDetails['images'][0]['links']['thumbnail']}` : '',
            isPersistant: true,
            productQuantity: (args.quantity && !isNaN(args.quantity) && +args.quantity > productMinimmumQuantity) ? args.quantity : productMinimmumQuantity,
            productUnitPrice: productPrice,
            expireAt: null,
            productUrl: productLinks ? productLinks.canonical : productURL,
            bulkPriceMap: priceQuantityCountry['bulkPrices'],
            bulkPrice: null,
            bulkPriceWithoutTax: null,
            categoryCode: productCategoryDetails['categoryCode'],
            taxonomyCode: productCategoryDetails['taxonomyCode'],
            buyNow: args.buyNow,
            filterAttributesList: args.productGroupData['filterAttributesList'] || null,
            discount: this.calculcateDiscount(priceQuantityCountry['discount'], productMrp, productPrice),
            category: (args.languageMode) ? v1 ? args.originalProductBO['categoryDetails']['taxonomy'] : args.originalProductBO['categoryDetails'][0]['taxonomy'] : productCategoryDetails['taxonomy'],
            isOutOfStock: this._setOutOfStockFlag(priceQuantityCountry),
            quantityAvailable: priceQuantityCountry['quantityAvailable'] || 0,
            productMRP: productMrp,
            productSmallImage: v1 ? CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productAllImages[0].links.small : CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productPartDetails[partNumber].images[0].links.small,
            productImage: v1 ? CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productAllImages[0].links.medium : CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productPartDetails[partNumber].images[0].links.medium,
            url: productPartDetails.canonicalUrl,
            isProductUpdate: 0,
            sellingPrice: productPrice,
            moq: productMinimmumQuantity,
            incrementUnit: incrementUnit,
            packageUnit: (priceQuantityCountry && priceQuantityCountry['packageUnit']) ? priceQuantityCountry['packageUnit'] : null
        } as AddToCartProductSchema;
        if (args.isFbt) {
            product['isFbt'] = args.isFbt;
        }
        if (args.selectPriceMap && args.selectPriceMap['bulkSellingPrice'] && args.selectPriceMap['bulkSPWithoutTax']) {
            product['bulkPrice'] = args.selectPriceMap['bulkSellingPrice']
            product['bulkPriceWithoutTax'] = args.selectPriceMap['bulkSPWithoutTax']
        }
        return product
    }

    /**
 * 
 * @param discountIfExist : If discount is given then it will make sure it has 0 places after decimal & is floor value
 * @param mrp : used if discountIfExist does not exist
 * @param SellingPrice  used if discountIfExist does not exist
 * @returns discount or 0
 */
    calculcateDiscount(discountIfExist, mrp, SellingPrice): number
    {
        if (discountIfExist && !Number.isNaN(discountIfExist)) {
            return +Math.floor(+(discountIfExist)).toFixed(0)
        } else if (mrp && SellingPrice && !Number.isNaN(mrp) && !Number.isNaN(SellingPrice)) {
            return +(Math.floor(+(((mrp - SellingPrice) / mrp) * 100)).toFixed(0))
        } else {
            return 0;
        }
    }

    private _checkProductItemExistInCart(productId, cartSession)
    {
        const itemsList = (cartSession && cartSession['itemsList']) ? [...cartSession['itemsList']] : [];
        const filteredArr = itemsList.filter(items => items['productId'] == productId);
        return (filteredArr.length > 0) ? filteredArr[0] : null;
    }

    private _checkQuantityOfProductItemAndUpdate(product: AddToCartProductSchema, cartSession, quantity: number = 1, buyNow: boolean = false, isProductUpdate: number = 0)
    {
        let itemsList = (cartSession && cartSession['itemsList']) ? [...cartSession['itemsList']] : [];
        itemsList.map((productItem: AddToCartProductSchema) =>
        {
            if (productItem.productId == product.productId) {
                // increment quantity by 1
                productItem['productQuantity'] = +productItem['productQuantity'] + +quantity;
                if (isProductUpdate > 0) {
                    productItem['productQuantity'] = isProductUpdate;
                }
                // make sure quantity is not greater than avaliable qunatity
                if (product.productQuantity > productItem.quantityAvailable) {
                    productItem['productQuantity'] = productItem.quantityAvailable;
                }
                // also incase bulk price adjust bulk price
                // console.log('(product.bulkPriceMap ==>', (product.bulkPriceMap))
                if (product.bulkPriceMap && Object.keys(product.bulkPriceMap).length > 0) {
                    const appliedPriceMap = product.bulkPriceMap['india'].filter(prices => (product.productQuantity >= prices.minQty && product.productQuantity <= prices.maxQty));
                    const selectedProductBulkPrice = (appliedPriceMap.length > 0) ? appliedPriceMap[0] : null;
                    if (selectedProductBulkPrice) {
                        productItem['bulkPrice'] = selectedProductBulkPrice['bulkSellingPrice']
                        productItem['bulkPriceWithoutTax'] = selectedProductBulkPrice['bulkSPWithoutTax']
                    }
                }
            }
            return productItem;
        });

        if (buyNow) {
            itemsList = itemsList.filter(item => item.productId == product.productId);
            itemsList.map((productItem: AddToCartProductSchema) =>
            {
                productItem['buyNow'] = true;
                return productItem;
            });
            cartSession['cart']['buyNow'] = buyNow;
        }

        cartSession['itemsList'] = itemsList;
        return cartSession;
    }


    private _setOutOfStockFlag(priceQuantityCountry)
    {
        let productOutOfStock = false
        if (priceQuantityCountry) {
            // incase outOfStockFlag of is avaliable then set its value
            productOutOfStock = priceQuantityCountry['outOfStockFlag'];
            // apart from outOfStockFlag if mrp is exist and is zero set product of OOS
            if (priceQuantityCountry['mrp']) {
                if (parseInt(priceQuantityCountry['mrp']) == 0) {
                    productOutOfStock = true;
                }
                if (parseInt(priceQuantityCountry['quantityAvailable']) == 0) {
                    productOutOfStock = true;
                }
            } else {
                productOutOfStock = true;
            }
        } else {
            // incase priceQuantityCountry element not present in API
            productOutOfStock = true;
        }
        return productOutOfStock;
    }

    /**
     * 
     * @returns always return cart session obj.
     * either from cartsessoion from service 
     * or by calling usersession api and then calling getcartsession API
     * use this function to always get cart session no further handling required.
     */
    private _checkForUserAndCartSession(): Observable<any>
    {
        return of(this.getGenericCartSession).pipe(
            mergeMap(cartSessionDetails =>
            {
                if (cartSessionDetails && cartSessionDetails['cart']) {
                    return of(this.generateGenericCartSession(cartSessionDetails));
                } else {
                    return this._getUserSession().pipe(
                        map(userSessionDetails =>
                        {
                            return Object.assign({}, { "sessionid": userSessionDetails['sessionId'] })
                        }),
                        mergeMap(request =>
                        {
                            return this.getCartBySession(request).pipe(
                                map((res: any) => this.generateGenericCartSession(res))
                            );
                        })
                    )
                }
            }),
        )
    }

    /**
     * @returns get user session details from localstorage or by API
     */
    private _getUserSession(): Observable<any>
    {
        let user = this._localStorageService.retrieve('user');
        if (user) {
            return of(user);
        }
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_SESSION).pipe(
            map(res =>
            {
                this.localAuthService.setUserSession(res);
                this.autoLoginSubject.next(res);
                return res;
            })
        );
    }

    private _removePromoCode(cartSession): any
    {
        cartSession['offersList'] = [];
        cartSession['extraOffer'] = null;
        cartSession['cart']['totalOffer'] = 0;
        let itemsList = cartSession["itemsList"];
        itemsList.forEach((element, index) =>
        {
            cartSession["itemsList"][index]['offer'] = null;
        });
        return cartSession;
    }
    // COMMON CART LOGIC IMPLEMENTATION ENDS
    // HTTP Wrappers
    getValidateCartMessageApi(params)
    {
        // used in cart.components.ts
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_GetCartValidationMessages, { params: params });
    }

    setValidateCartMessageApi(data)
    {
        // used in cart.components.ts
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SET_SetCartValidationMessages, { body: data });
    }


    validateCartApi(cart)
    {
        // used in cart.components.ts
        const cartN = JSON.parse(JSON.stringify(cart));
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_CART, { body: this.buyNow ? cartN : cart }).pipe(
            tap((response) => { return response; }),
            shareReplay(1)
        );
    }

    getSessionByUserId(cart)
    {
        // used in Shared Auth modules components
        cart['device']="web";
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CartByUser, { body: cart });
    }

    // TOOD: only used on cart.component.ts if required can be removed
    getProduct(product)
    {
        let params = { productId: product.productId };
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/product/getProductGroup", { params: params });
    }

    logoutCall()
    {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGOUT);
    }

    getShippingChargesApi(obj)
    {
        console.log(1);
        let url = CONSTANTS.GATEWAY_API + ENDPOINTS.CART.getShippingValue;
        return this._dataService.callRestful("POST", url, { body: obj }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    getMessageList(data, items)
    {
        let messageList = [];
        const msns: Array<string> = data ? Object.keys(data) : null;
        if (msns && items && items.length > 0) {
            items.forEach((item) =>
            {
                if (msns.indexOf(item['productId']) != -1) {
                    let msg = {};
                    msg['msnid'] = item['productId'];
                    if (data[item['productId']]['updates']['outOfStockFlag']) {
                        msg['data'] = { productName: item['productName'], text1: ' is currently Out of Stock. Please remove from cart', text2: '', oPrice: '', nPrice: '' };
                        msg['type'] = "oos";
                    }
                    else if (data[item['productId']]['updates']['priceWithoutTax'] && (data[item['productId']]['productDetails']['priceWithoutTax'] < item["priceWithoutTax"])) {
                        msg['data'] = { productName: item['productName'], text1: ' price has been updated from ', text2: 'to', oPrice: item["priceWithoutTax"], nPrice: data[item['productId']]['productDetails']['priceWithoutTax'] };
                        msg['type'] = "price";
                    } else if (data[item['productId']]['updates']['shipping'] != undefined) {
                        //check if shipping msg is already present in message list.
                        let addmsg: number = messageList.findIndex(ml => ml.type == "shipping");
                        if (data[item['productId']]['updates']['shipping'] != undefined) {
                            msg['data'] = { text1: 'Shipping Charges have been updated.' };
                            msg['type'] = "shipping";
                        }
                        if (data[item['productId']]['updates']['discount'] != undefined) {
                            if (msg['data']) {
                                msg['data'] = { text1: 'Shipping Charges and Applied Promo Code have been updated.' };
                                msg['type'] = "shippingcoupon";
                            }
                        }
                        //  }
                    } else if (data[item['productId']]['updates']['discount'] == true || data[item['productId']]['updates']['discount'] == false) {
                        //check if shipping msg is already present in message list.
                        if (data[item['productId']]['updates']['discount'] == true || data[item['productId']]['updates']['discount'] == false) {
                            msg['data'] = { text1: 'Applied Promo Code has been updated.' };
                            msg['type'] = "coupon";
                        }
                        if (data[item['productId']]['updates']['shipping']) {
                            if (msg['data']) {
                                msg['data'] = { text1: 'Shipping Charges and Applied Promo Code have been updated.' };
                                msg['type'] = "shippingcoupon";
                            }
                        }
                    }
                    if (msg['data']) {
                        if (messageList.findIndex(ml => ml.type == "shipping") != -1 && (msg['type'] == 'coupon' || msg['type'] == 'shippingcoupon')) {
                            const index = messageList.findIndex(ml => ml.type == "shipping");
                            if (index > -1) {
                                messageList[index].data.text1 = "Shipping Charges and Applied Promo Code have been updated.";
                                messageList[index].type = "shippingcoupon";
                            }
                        }
                        else if (messageList.findIndex(ml => ml.type == "coupon") != -1 && (msg['type'] == 'shipping' || msg['type'] == 'shippingcoupon')) {
                            const index = messageList.findIndex(ml => ml.type == "coupon");
                            if (index > -1) {
                                messageList[index].data.text1 = "Shipping Charges and Applied Promo Code have been updated.";
                                messageList[index].type = "shippingcoupon";
                            }
                        }
                        else if (messageList.findIndex(ml => ml.type == "shipping") == -1 && messageList.findIndex(ml => ml.type == "coupon") == -1 && messageList.findIndex(ml => ml.type == "shippingcoupon") == -1) {
                            messageList.push(msg);
                        }
                    }
                }
            });
        }
        return messageList;
    }

    updateCartItem(item, productResult)
    {
        item["amount"] = Number(productResult['mrp']),
            item["totalPayableAmount"] = Number(productResult['sellingPrice']),
            item["productMRP"] = productResult['mrp'],
            item["priceWithoutTax"] = productResult['priceWithoutTax'],
            item["tpawot"] = Number(productResult['priceWithoutTax']),
            item["productSelling"] = productResult['sellingPrice'],
            item["productUnitPrice"] = Number(productResult['sellingPrice'])
        if (item['bulkPriceWithoutTax'] && productResult['bulkPrices']) {
            item['bulkPriceMap'] = productResult['bulkPrices'];
            productResult['bulkPrices']['india'].forEach((element, index) =>
            {
                if (element.minQty <= item['productQuantity'] && item['productQuantity'] <= element.maxQty) {
                    item['bulkPrice'] = element.bulkSellingPrice;
                    item['bulkPriceWithoutTax'] = element.bulkSPWithoutTax;
                }
                if (productResult['bulkPrices']['india'].length - 1 == index && item['productQuantity'] >= element.maxQty) {
                    item['bulkPrice'] = element.bulkSellingPrice;
                    item['bulkPriceWithoutTax'] = element.bulkSPWithoutTax;
                }
            });
        }
        return item;
    }

    getAllPromoCodes(cartId = null, totalPayableAmount = null)
    {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes + '?cartId=' + cartId;
        url = (totalPayableAmount) ? url + `&totalCartAmount=${totalPayableAmount}` : url;
        return this._dataService.callRestful('GET', url);
    }

    getAllPromoCodesByUserId(userID = null, cartId = null, totalPayableAmount = null) {
        // console.trace();
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes + '?userId=' + userID + '&cartId=' + cartId + '&buyNow=' + (this._buyNow || 'false');
        url = (totalPayableAmount) ? url + `&totalCartAmount=${totalPayableAmount}` : url;
        return this._dataService.callRestful('GET', url);
    }

    getPromoCodeDetailById(offerId)
    {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoId=' + offerId;
        return this._dataService.callRestful('GET', url);
    }

    applyPromoCode(obj)
    {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validatePromoCode;
        return this._dataService.callRestful('POST', url, { body: obj });
    }

    getPromoCodeDetailByName(promoCode)
    {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoCode=' + promoCode;
        return this._dataService.callRestful('GET', url);
    }

    //promo code section
    getPromoCodesByUserId(userId = null, isUpdatePromoCode = true) {
        this._loaderService.setLoaderState(true);
        const cartSession = this.getCartSession();
        const shipingValueRequest = this.getShippingObj(cartSession);
        // console.log('shipingValueRequest', shipingValueRequest);
        const offerId = (cartSession['offersList'][0] && cartSession['offersList'][0]['offerId']) ? cartSession['offersList'][0]['offerId'] : "";
        if (userId) {
            this.getAllPromoCodesByUserId(userId,cartSession['cart']['cartId'],(shipingValueRequest['totalPayableAmount'] || null)).pipe(map(res=>{
                if (res && res['data']) {
                    (res['data'] as []).sort((a, b) => b['isApplicable'] - a['isApplicable'])
                }
                return res;
            })).subscribe(res => {
                this.processPromoData(res, offerId, isUpdatePromoCode);
            });
        } else {
            this.getAllPromoCodes(cartSession['cart']['cartId'], (shipingValueRequest['totalPayableAmount'] || null)).pipe(map(res=>{
                if (res && res['data']) {
                    (res['data'] as []).sort((a, b) => b['isApplicable'] - a['isApplicable'])
                }
                return res;
            })).subscribe(res => {
                this.processPromoData(res, offerId, isUpdatePromoCode);
            })
        }
    }

    processPromoData(res, offerId, isUpdatePromoCode = false) {
        if (res['statusCode'] === 200) {
            this.allPromoCodes = res['data'];
            this.topMatchedPromoCode = this.allPromoCodes.find(res=> res.isApplicable === true)
            const promo = this.allPromoCodes.find(promo => promo.promoId === offerId);
            if (promo) {
                this.appliedPromoCode = promo['promoCode'];
                //back end code as getCartBysession is not updating with offerdetails of promocde applied
                // this.updatePromoDetail(this.appliedPromoCode);
                if (!isUpdatePromoCode) {
                    this.postProcessAfterPromocodeWithoutUpdate(this.appliedPromoCode);
                }else{
                    this.updatePromoDetail(this.appliedPromoCode);
                }
            }else{
                // call shipping directly,
                this.postProcessAfterPromocodeWithoutUpdate();
            }
            this.pushPromocodesDataLayer();
        }
        this._loaderService.setLoaderState(false);
    }

    //if back end work expected then remove this functionality
    updatePromoDetail(promoCode)
    {
        const cartSession = this.getCartSession();
        if (promoCode) {
            this.applyPromoCode({ 'shoppingCartDto': cartSession }).subscribe((response) =>
            {
                if (response && response['status']) {
                    const data = response['data'];
                    cartSession['cart']['totalOffer'] = data['discount'];
                    cartSession['extraOffer'] = null;
                    this.postProcessAfterPromocode(promoCode, cartSession, false);
                }
            });
        }
    }

    genericApplyPromoCode(promcode) {
        this._loaderService.setLoaderState(true);
        this.getPromoCodeDetailByName(promcode).subscribe(({ status, data, statusDescription: message }: any) => {
            if (status) {
                let obj = [{ offerId: data['promoAttributes']['promoId'], type: '15' }];
                const cartSession = this.getGenericCartSession;
                cartSession['offersList'] = obj;
                this.verifyAndApplyPromocode(cartSession, promcode, false).subscribe(({ cartSession, isUpdated }: any) => {
                    if (isUpdated) {
                        this.postProcessAfterPromocode(promcode, cartSession, true);
                        return;
                    }
                })
            } else {
                this.appliedPromoCode = '';
                this.promoCodeSubject.next({ promocode: this.appliedPromoCode, isNewPromocode: false });
                this._loaderService.setLoaderState(false);
                this._toastService.show({ type: 'error', text: message });
            }
        }, error => {
            this.appliedPromoCode = '';
            this.promoCodeSubject.next({ promocode: this.appliedPromoCode, isNewPromocode: false });
            this._loaderService.setLoaderState(false);
        });
    }

    postProcessAfterPromocode(promocode, cartSession, isNewPromocode)
    {
        const totalOffer = cartSession['cart']['totalOffer'] || null;
        let tempCartSession = null;
        this.updateCartSession(cartSession).pipe(
            switchMap((newCartSession) =>
            {
                tempCartSession = newCartSession;
                return this.verifyShippingCharges(tempCartSession)
            }),
        ).subscribe((newCartSession) =>
        {
            newCartSession['extraOffer'] = null;
            newCartSession['cart']['totalOffer'] = totalOffer;
            const _cartSession = this.generateGenericCartSession(newCartSession);
            this.setGenericCartSession(_cartSession);
            // this._cartUpdatesChanges.next(cartSession);
            this.orderSummary.next(_cartSession);
            if (totalOffer) { this.promoCodeSubject.next({ promocode: promocode, isNewPromocode: isNewPromocode, totalOffer: totalOffer}); }
            this._loaderService.setLoaderState(false);
        })
    }

    postProcessAfterPromocodeWithoutUpdate(promocode = null) {
        const cartSessionTemp = this.getCartSession();
        this.getShippingAndUpdateCartSession(cartSessionTemp).subscribe(cartsessionResponse => {
            const cartSession = cartsessionResponse;
            const totalOffer = cartSession['cart']['totalOffer'] || null;
            cartSession['extraOffer'] = null;
            cartSession['cart']['totalOffer'] = totalOffer;
            const _cartSession = this.generateGenericCartSession(cartSession);
            this.setGenericCartSession(_cartSession);
            this.orderSummary.next(_cartSession);
            if (totalOffer && promocode) { this.promoCodeSubject.next({ promocode: promocode, isNewPromocode: false }); }
            this._loaderService.setLoaderState(false);
        })
    }

    verifyAndApplyPromocode(_cartSession, promcode, isUpdateCart)
    {
        let returnValue = { cartSession: _cartSession, isUpdated: false };
        let cartSession = this.generateGenericCartSession(_cartSession)
        const cartObject = { 'shoppingCartDto': cartSession };
        return this.applyPromoCode(cartObject).pipe(map((response) =>
        {
            const status = response['status'];
            const data = response['data'] ? response['data'] : null;
            const message = response['statusDescription'] || 'Offer is not applied as coupon discount is 0';
            returnValue.isUpdated = true;
            if (status === true && (data && data['discount'] > 0) && (data['discount'] <= cartSession['cart']['totalAmount'])) {
                cartSession['cart']['totalOffer'] = data['discount'];
                cartSession['extraOffer'] = null;
                const productDiscount = data['productDis'];
                const productIds = Object.keys(data['productDis'] ? data['productDis'] : {});
                cartSession['itemsList'].map((item) =>
                {
                    item['offer'] = null;
                    if (productIds.includes(item['productId'])) {
                        item['offer'] = productDiscount[item['productId']];
                    }
                    return item['offer'];

                });
                returnValue['cartSession'] = cartSession;
                this.appliedPromoCode = promcode;
                return returnValue;
            }
            if (status === false || (data && data['discount'] === 0)) {
                cartSession['cart']['totalOffer'] = 0;
                cartSession['offersList'] = [];
                cartSession['itemsList'].map((item) => item['offer'] = null);
                this.appliedPromoCode = '';
                this._loaderService.setLoaderState(false);
                returnValue['cartSession'] = cartSession;
                if ((data && data['discount'] > 0) && (data['discount'] >= cartSession['cart']['totalAmount'])) {
                    this._toastService.show({ type: 'error', text: 'Your cart amount is less than ' + data['discount'] });
                    return returnValue;
                }
                if (!isUpdateCart) {
                    this._toastService.show({ type: 'error', text: message });
                }
                this.promoCodeSubject.next({ promocode: this.appliedPromoCode , isNewPromocode: false });
                return returnValue;
            }
            return returnValue;
        }), catchError((error: HttpErrorResponse) => 
        {
            this._loaderService.setLoaderState(false);
            return of(returnValue);
        }));
    }

    genericRemovePromoCode()
    {
        if (!this.appliedPromoCode) { return; }
        this._loaderService.setLoaderState(true);
        let cartSession = this.getGenericCartSession;
        cartSession['offersList'] = [];
        cartSession['extraOffer'] = null;
        cartSession['cart']['totalOffer'] = 0;
        cartSession.itemsList.map((element) => { element['offer'] = null; });
        this.getShippingAndUpdateCartSession(cartSession).subscribe(
            data =>
            {
                this.appliedPromoCode = '';
                this.promoCodeSubject.next({ promocode: this.appliedPromoCode, isNewPromocode: false });
                this.setGenericCartSession(cartSession);
                this.updateCartSession(cartSession).subscribe(res =>
                {
                    this.publishCartUpdateChange(cartSession);
                    this.setGenericCartSession(this.generateGenericCartSession(cartSession));
                    this._loaderService.setLoaderState(false);
                    this._toastService.show({ type: 'success', text: "Promo Code Removed" });
                });
            }
        );
    }

    private _getUserBusinessDetail(data)
    {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this._dataService.callRestful("GET", url, { params: data }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    pay(pdata)
    {
        let userSession = this._localStorageService.retrieve("user");
        return this._getUserBusinessDetail({ customerId: userSession.userId }).pipe(
            map((res: any) => res),
            mergeMap((d) =>
            {
                let bd: any = null;
                if (d && d.status && d.statusCode == 200) {
                    bd = {
                        company: d["data"]["companyName"],
                        gstin: d["data"]["gstin"],
                        is_gstin: d["data"]["isGstInvoice"],
                    };
                }
                pdata["validatorRequest"]["shoppingCartDto"]["businessDetails"] = bd;
                return this._dataService
                    .callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PAYMENT, {
                        body: pdata,
                    })
                    .pipe(
                        catchError((res: HttpErrorResponse) =>
                        {
                            return of({ status: false, statusCode: res.status });
                        }),
                        map((res: any) =>
                        {
                            return res;
                        })
                    );
            })
        );
    }

    /**@description display unavailable items in pop-up */
    showUnavailableItems: boolean = false;
    unavailableItemsList: any[];
    viewUnavailableItems(types: string[])
    {
        const itemsList: any[] = JSON.parse(JSON.stringify(this.getGenericCartSession['itemsList']));
        const unserviceableMsns = JSON.parse(JSON.stringify(this.notifications))
            .filter(item => types.includes(item['type'])).reduce((acc, cv) => { return [...acc, ...[cv['msnid']]] }, []);
        this.unavailableItemsList = itemsList.filter(item => item['oos'] || unserviceableMsns.indexOf(item['productId']) != -1);
        if (this.unavailableItemsList.length === 0) return;
        this.showUnavailableItems = true;
    }

    removeUnavailableItems(items: any[], isWishlistProduct?: boolean, message?: string) {
        const MSNS = items.map(item => item['productId']);
        this.removeCartItemsByMsns(MSNS, isWishlistProduct, message)//postprocessing
        this.showUnavailableItems = false;
    }

    //Post processing
    removeCartItemsByMsns(msns: string[], isWishlistProduct?: boolean, message?: string)
    {
        const CART_SESSION = JSON.parse(JSON.stringify(this.cartSession));
        const EXISTING_ITEMS = (CART_SESSION['itemsList'] as any[]);
        const REMOVABLE_ITEMS = []; const NON_REMOVABLE_ITEMS = [];
        EXISTING_ITEMS.forEach((item) =>
        {
            if (msns.includes(item['productId'])) { REMOVABLE_ITEMS.push(item); return; }
            NON_REMOVABLE_ITEMS.push(item);
        });
        this.removeNotificationsByMsns(msns).subscribe((response) => console.log("removed notfication by msns"));
        this.updateCartAfterItemsDelete(CART_SESSION, NON_REMOVABLE_ITEMS, isWishlistProduct, message);
    }

    verifyShippingCharges(cartSession)
    {
        const SHIPPING_DATA = this.getShippingObj(cartSession);
        const URL = `${CONSTANTS.GATEWAY_API}${ENDPOINTS.CART.getShippingValue}`;
        return this._dataService.callRestful("POST", URL, { body: SHIPPING_DATA }).pipe(
            map((response) =>
            {
                if (response['statusCode'] == 200) {
                    const DATA = response['data']
                    cartSession['cart']['shippingCharges'] = DATA['totalShippingAmount'];
                    for (let item of cartSession['itemsList']) {
                        const PRODUCT_ID = item['productId']
                        item['shippingCharges'] = DATA['itemShippingAmount'][PRODUCT_ID];
                    }
                    return cartSession;
                }
            },
                catchError((error: HttpErrorResponse) => { return cartSession }))
        );
    }

    updateCartAfterItemsDelete(cartSession, items: any[], isWishlistProduct?: boolean, message?: string)
    {
        cartSession['itemsList'] = [];
        if (items.length) { cartSession['itemsList'] = items; }
        this._globalLoader.setLoaderState(true);
        let tempCartSession = null;
        let totalOffer = null;
        this.verifyAndApplyPromocode(cartSession, this.appliedPromoCode, true).pipe(
            switchMap((response) =>
            {
                tempCartSession = response['cartSession'];
                totalOffer = tempCartSession['cart']['totalOffer'] || null;
                return this.updateCartSession(tempCartSession);
            }),
            switchMap((newCartSession) =>
            {
                tempCartSession = newCartSession;
                return this.verifyShippingCharges(tempCartSession)
            }),
            switchMap((newCartSession) =>
            {
                tempCartSession = newCartSession;
                return this.updateCartSession(tempCartSession)
            }),
            switchMap((newCartSession) =>
            {
                tempCartSession = newCartSession;
                return this.validateCartApi(tempCartSession)
            })).
            subscribe((response) =>
            {
                this._toastService.show({ type: 'error', text: `${!isWishlistProduct ? "Product successfully removed from Cart" :`${message}!`}` });
                const ITEM_LIST = tempCartSession['itemsList'];
                
                if (ITEM_LIST && ITEM_LIST.length == 0 && this._router.url.indexOf('/checkout') != -1) {
                    this.clearBuyNowFlow();
                    // clears browser history so they can't navigate with back button
                    this._location.replaceState('/');
                    this._router.navigateByUrl('/quickorder');
                }
                if (tempCartSession.hasOwnProperty('itemsList')) {
                    tempCartSession['cart']['totalOffer'] = totalOffer;
                    tempCartSession['extraOffer'] = null;
                    this._notifyCartChanges(tempCartSession, null);
                }
                // 50 ms wait time for cartItems to update after product removed
                setTimeout(() => {
                    this.isProductRemoved.next(true)
                    this._globalLoader.setLoaderState(false);
                }, 50);
            })
    }

    updateNonDeliverableItemsAfterRemove(cartItems:any[])
    {
        const freshmsns = cartItems.map((item)=>item.productId);
        let tempcods:any[] = [];
        if (this.codNotAvailableObj['itemsArray'])
        {
            tempcods = (this.codNotAvailableObj['itemsArray'] as any[]);
            tempcods = tempcods.filter((item) => freshmsns.includes(item.productId))
        }
        this.codNotAvailableObj['itemsArray'] = tempcods;
        this.cashOnDeliveryStatus.isEnable = (tempcods.length == 0);
    }

    clearBuyNowFlow()
    {
        const flashdata = this._localStorageService.retrieve("flashdata");
        if (this._buyNow || (flashdata && flashdata['buyNow'] == true)) {
            this.buyNow = false;
            this.buyNowSessionDetails = null;
            this._localStorageService.clear("flashdata");
            this.refreshCartSesion();
        }
    }

    /**Cart Notification to be displayed only for logged in user
     * Validate Cart + getValidationMessages.
     * compare with cart and update messages
     * hit setvalidationMessage to update notifications
     * hit the update cart api with latest prices from validate cart
     * Once increment/decrment/change/remove remove validation message and hit the setValidations
     * On land of payment clear validations and hit the setvalidations api
     * OOS to instock, instock to OOS.
     * quick order page : hide non-serviceable
     * checkout : display all notifications.
     * payment:clear all validations
    */

    async setUnserviceables(unserviceables: any[])
    {
        this.notifications = await this.notifications.filter((notifcation) => notifcation.type !== 'unserviceable');
        this.notifications = [...this.notifications, ...unserviceables];
        this.notificationsSubject.next(this.notifications);
    }

    async setCartNotifications(cartNotifications: any[])
    {
        this.notifications = await this.notifications.filter((notifcation) => notifcation.type == 'unserviceable');
        this.notifications = [...this.notifications, ...cartNotifications];
        // adding notification in user login flow when invalid coupons available in session
        if(this.showNotification) {
            const couponObj = {
                type: 'coupon',
                data: {
                    text1: "Applied coupon has been removed as it is not valid"
                }
            }
            // in case of invalid coupon in login, displaying the above custom message by removing generic message
            const index = this.notifications.findIndex(each => each['data']['text1'] == 'Applied Promo Code has been updated.');
            if(index != -1) {
                this.notifications.splice(index, 1);
            }
            this.notifications.push(couponObj);
            this.appliedPromoCode = '';
        }
        this.notificationsSubject.next(this.notifications);
    }

    verifyAndUpdateNotfications(time?) {
        if (this.localAuthService.isUserLoggedIn()) {
            const USER_SESSION = this.localAuthService.getUserSession();
            const CART_SESSION = this.getGenericCartSession;
            const VALIDATE_CART_REQUEST = { "shoppingCartDto": CART_SESSION };
            const VALIDATE_CART_MESSAGE_REQUEST = { userId: USER_SESSION['userId'] };
            const buyNow = this.buyNow;
            if (buyNow) { VALIDATE_CART_MESSAGE_REQUEST['buyNow'] = buyNow; }
            return forkJoin([this.validateCartApi(VALIDATE_CART_REQUEST), this.getValidateCartMessageApi(VALIDATE_CART_MESSAGE_REQUEST)]).pipe(delay(time ? time : 0))
        } else {
            return of(null);
        }
    }


    public verifyAndUpdateNotficationsAfterCall(responses: [Object, Object]) {
        const CART_SESSION = this.getGenericCartSession;
        const validateCartResponse = responses[0];
        const validateCartMessageResponse = responses[1];
        let validateCartData = null, validateCartMessageData = null;
        if (validateCartResponse['status']) { validateCartData = validateCartResponse['data']; }
        if (validateCartMessageResponse['statusCode']) { validateCartMessageData = validateCartMessageResponse['data']; }
        this.processNotifications(CART_SESSION['itemsList'], validateCartData, validateCartMessageData);
    }

    /**
     * @description
     * @param userId :logged in user id
     * @param items : current cart items
     * @param validateCartData : data of any updated cart related item changes
     * @param validateCartMessageData : provides current existing notifications
     */
    processNotifications(items: any[], validateCartData, validateCartMessageData)
    {
        const VALIDATE_CART_NOTIFICATION_MSNS: string[] = validateCartData ? Object.keys(validateCartData) : [];
        const FILTERED_CART_ITEMS: any[] = items.filter((item) => VALIDATE_CART_NOTIFICATION_MSNS.includes(item['productId']));
        let oldNotfications: any[] = validateCartMessageData || [];
        let info = this.buildNotifications(FILTERED_CART_ITEMS, validateCartData);
        let newNotfications: any[] = info['messageList'];
        let increasedPrice: string[] = info['increasedPriceMSNS'];
        oldNotfications = this.filterOldNotifcations(oldNotfications, increasedPrice);
        this.cartNotications = this.mergeNotifications(oldNotfications, newNotfications);
        this.updateCartItemsAfterNotfications(items, validateCartData);
        this.setCartNotifications(this.cartNotications);
    }

    filterOldNotifcations(oldNotfications: any[], increasedPrice: any[])
    {
        return oldNotfications.filter((notification) =>
        {
            const nType: string = notification['type'];
            const isPriceIncreased = increasedPrice.includes(notification['msnid'])
            if (isPriceIncreased || nType === "oos" || nType === "unserviceable") {
                return false;
            }
            return true;
        })
    }

    buildNotifications(FILTERED_ITEMS: any[], validateCartData): { messageList: any[], increasedPriceMSNS: string[] }
    {
        const messageList = [];
        const increasedPriceMSNS = []
        FILTERED_ITEMS.forEach((item) =>
        {
            let msg = {};
            const CART_PRODUCT_MSN = item['productId'];
            const CART_PRODUCT_NAME = item['productName'];
            const CART_PRODUCT_PRICE = item["priceWithoutTax"];
            const UPDATES = validateCartData[CART_PRODUCT_MSN]['updates'];
            msg['msnid'] = item['productId'];
            if (UPDATES['outOfStockFlag']) {
                msg['type'] = "oos";
                msg['data'] = { productName: CART_PRODUCT_NAME, text1: ' is currently Out of Stock. Please remove from cart', text2: '', oPrice: '', nPrice: '' };
            } else if (UPDATES['priceWithoutTax'] && (UPDATES['priceWithoutTax'] != CART_PRODUCT_PRICE)) {
                if (UPDATES['priceWithoutTax'] < CART_PRODUCT_PRICE) {
                    msg['type'] = "price";
                    msg['data'] = { productName: CART_PRODUCT_NAME, text1: '   price has been updated from ', text2: 'to', oPrice: CART_PRODUCT_PRICE, nPrice: validateCartData[CART_PRODUCT_MSN]['productDetails']['priceWithoutTax'] };
                } else {
                    increasedPriceMSNS.push(CART_PRODUCT_MSN);
                }
            } else if (UPDATES['shipping']) {
                msg['type'] = "shipping";
                msg['data'] = { text1: 'Shipping Charges have been updated.' };
                if (UPDATES['discount']) {
                    msg['type'] = "shippingcoupon";
                    msg['data'] = { text1: 'Shipping Charges and Applied Promo Code have been updated.' };
                }
            } else if (UPDATES['discount'] === true || UPDATES['discount'] === false) {
                msg['data'] = { text1: 'Applied Promo Code has been updated.' };
                msg['type'] = "coupon";
                if (UPDATES['shipping']) {
                    msg['data'] = { text1: 'Shipping Charges and Applied Promo Code have been updated.' };
                    msg['type'] = "shippingcoupon";
                }
            }
            if (msg['data']) {
                const SHIPPING_INDEX = messageList.findIndex(ml => ml.type == "shipping");
                const COUPON_INDEX = messageList.findIndex(ml => ml.type == "coupon");
                const SHIPPING_COUPON_INDEX = messageList.findIndex(ml => ml.type == "shippingcoupon");
                const IS_SHIPPINGCOUPON_TYPE = (msg['type'] === 'shippingcoupon');
                if (SHIPPING_INDEX > -1 && (msg['type'] == 'coupon' || IS_SHIPPINGCOUPON_TYPE)) {
                    messageList[SHIPPING_INDEX].data.text1 = "Shipping Charges and Applied Promo Code have been updated.";
                    messageList[SHIPPING_INDEX].type = "shippingcoupon";
                }
                else if (COUPON_INDEX > -1 && (msg['type'] == 'shipping' || IS_SHIPPINGCOUPON_TYPE)) {
                    messageList[COUPON_INDEX].data.text1 = "Shipping Charges and Applied Promo Code have been updated.";
                    messageList[COUPON_INDEX].type = "shippingcoupon";
                }
                else if (SHIPPING_INDEX == -1 && COUPON_INDEX == -1 && SHIPPING_COUPON_INDEX == -1) {
                    messageList.push(msg);
                }
            }
        });
        return { messageList: messageList, increasedPriceMSNS: increasedPriceMSNS };
    }

    mergeNotifications(oldNotfications: any[], newNotfications: any[])
    {
        let finalNotfications = [];
        if (oldNotfications.length > 0 && newNotfications.length === 0) {
            finalNotfications = oldNotfications;
        } else if (newNotfications.length > 0 && oldNotfications.length === 0) {
            finalNotfications = newNotfications;
        }
        else if (oldNotfications.length > 0 && newNotfications.length > 0) {
            if (oldNotfications.length > newNotfications.length) {
                finalNotfications = this.updateOldWithNewNotifications(oldNotfications, newNotfications)
            } else if (oldNotfications.length < newNotfications.length) {
                finalNotfications = this.updateNewWithOldNotifications(newNotfications, oldNotfications)
            } else {
                finalNotfications = this.updateOldWithNewNotifications(oldNotfications, newNotfications)
            }
        }
        return finalNotfications;
    }

    updateOldWithNewNotifications(oldNotfications: any[], newNotfications: any[])
    {
        let overriddenNotfications = [];
        let freshNotifications = [];
        let oosNotifications = [];
        let remainingNotfications = [];
        const COMMON_MSNS = [];
        const NEW_OOS_MSNS = newNotfications.filter((notification) => notification['type'] === 'oos').map((notification) => notification['msnid']);
        for (let oIndex = 0; oIndex < oldNotfications.length; oIndex++) {
            for (let iIndex = 0; iIndex < newNotfications.length; iIndex++) {
                if (oldNotfications[oIndex]['msnid'] === newNotfications[iIndex]['msnid']) {
                    overriddenNotfications.push(newNotfications[iIndex]);
                    COMMON_MSNS.push(oldNotfications[oIndex]['msnid']);
                    break;
                }
            }
        }
        freshNotifications = newNotfications.filter((notification) => !(COMMON_MSNS.includes(notification['msnid'])));
        oosNotifications = oldNotfications.filter((notification) => NEW_OOS_MSNS.includes(notification['msnid']));
        remainingNotfications = oldNotfications.filter((notification) =>
        {
            const msn = notification['msnid'];
            return !(NEW_OOS_MSNS.includes(msn)) && !(COMMON_MSNS.includes(msn))
        })
        return [...overriddenNotfications, ...freshNotifications, ...oosNotifications, ...remainingNotfications];
    }

    updateNewWithOldNotifications(newNotfications: any[], oldNotfications: any[])
    {
        let overriddenNotfications = [];
        let freshNotifications = [];
        let oosNotifications = [];
        let remainingNotfications = [];
        const COMMON_MSNS = [];
        const NEW_OOS_MSNS = newNotfications.filter((notification) => notification['type'] === 'oos').map((notification) => notification['msnid']);
        for (let oIndex = 0; oIndex < newNotfications.length; oIndex++) {
            for (let iIndex = 0; iIndex < oldNotfications.length; iIndex++) {
                if (oldNotfications[iIndex]['msnid'] === newNotfications[oIndex]['msnid']) {
                    overriddenNotfications.push(newNotfications[iIndex]);
                    COMMON_MSNS.push(oldNotfications[oIndex]['msnid']);
                    break;
                }
            }
        }
        freshNotifications = newNotfications.filter((notification) => !(COMMON_MSNS.includes(notification['msnid'])));
        oosNotifications = oldNotfications.filter((notification) => NEW_OOS_MSNS.includes(notification['msnid']));
        remainingNotfications = oldNotfications.filter((notification) =>
        {
            const msn = notification['msnid'];
            return !(NEW_OOS_MSNS.includes(msn)) && !(COMMON_MSNS.includes(msn))
        })
        return [...overriddenNotfications, ...freshNotifications, ...oosNotifications, ...remainingNotfications];
    }

    updateCartItemsAfterNotfications(newItems: any[], validateCartData)
    {
        let canUpdateCart = false;
        let oosData = [];
        let itemsList = newItems;
        if (validateCartData) {
            itemsList = newItems.map((item) =>
            {
                const PRODUCT_ID = item['productId'];
                if (!validateCartData[PRODUCT_ID]) return item;
                const UPDATES = validateCartData[PRODUCT_ID]['updates'];
                if (UPDATES['outOfStockFlag']) {
                    item['oos'] = true;
                    oosData.push({ msnid: item['productId'] });
                }
                else if (UPDATES['priceWithoutTax'] || UPDATES['shipping']) {
                    canUpdateCart = true;
                    if (item['oos']) { delete item['oos']; }
                    return this.updateCartItem(item, validateCartData[PRODUCT_ID]['productDetails']);
                } else if (UPDATES['shipping'] || UPDATES['coupon']) {
                    canUpdateCart = true;
                    if (item['oos']) { delete item['oos']; }
                }
                return item;
            });
            if (oosData.length || canUpdateCart) {
                const user = this._localStorageService.retrieve('user');
                const newCartSession = Object.assign({}, this.getGenericCartSession);
                newCartSession['itemsList'] = itemsList;
                const setValidation$ = this.setValidateCartMessageApi({ userId: user['userId'], data: this.cartNotications });
                if (canUpdateCart) {
                    this.updateCartAfterNotifcations(newCartSession, setValidation$);
                    return;
                }
                this.setGenericCartSession(newCartSession);
                this.modifyCartItemsForPriceNotfication();
                setValidation$.subscribe((response) => console.log("Cycle completed successfully"));
                return;
            }
        }
        this.modifyCartItemsForPriceNotfication();
    }

    updateCartAfterNotifcations(cartSession, setValidation$)
    {
        let totalOffer = null;
        const cartUpdate$ = this.updateCartSession(cartSession).pipe(
            switchMap((newCartSession) =>
            {
                return this.verifyAndApplyPromocode(newCartSession, this.appliedPromoCode, true);
            }),
            switchMap((response) =>
            {
                totalOffer = response.cartSession['cart']['totalOffer'] || null;
                return this.verifyShippingCharges(response.cartSession)
            }));
        forkJoin([setValidation$, cartUpdate$]).subscribe(
            (responses) =>
            {
                const cartSession = this.generateGenericCartSession(responses[1]);
                cartSession['cart']['totalOffer'] = totalOffer;
                cartSession['extraOffer'] = null;
                this.setGenericCartSession(cartSession);
                this.modifyCartItemsForPriceNotfication();
                this.orderSummary.next(cartSession);
                this.cart.next({ count: (cartSession.itemsList ? cartSession.itemsList.length : 0) });
            }
        )
    }

    modifyCartItemsForPriceNotfication()
    {
        let msn_data = {}
        this.cartNotications.forEach((notification) =>
        {
            if (notification["type"] === "price") {
                msn_data[notification["msnid"]] = notification;
            }
        });
        if (Object.keys(msn_data).length) {
            const newCartSession = Object.assign({}, this.getGenericCartSession);
            let itemsListNew = JSON.parse(JSON.stringify(newCartSession['itemsList']));
            itemsListNew = itemsListNew.map((item) =>
            {
                const PRODUCT_ID = item['productId'];
                item.text1 = null; item.text2 = null; item.oPrice = null; item.nPrice = null;
                if (msn_data[PRODUCT_ID]) {
                    const data = msn_data[PRODUCT_ID]['data'];
                    item.text1 = data['text1'];
                    item.text2 = data['text2'];
                    item.oPrice = data['oPrice'];
                    item.nPrice = data['nPrice'];
                }
                return item;
            });
            newCartSession['itemsList'] = itemsListNew;
            this.setGenericCartSession(newCartSession);
        }
    }

    removeNotificationsByMsns(msns: any[], isCartUpdate?)
    {
        if (!this.localAuthService.isUserLoggedIn()) return of([]);
        const userSession = this.localAuthService.getUserSession();
        const cNotifications: any[] = JSON.parse(JSON.stringify(this.notifications));
        if (!(isCartUpdate)) {
            this.notifications = cNotifications.filter((notification) => { return !(msns.includes(notification['msnid'])) });
        } else {
            this.notifications = cNotifications.filter((notification) =>
            {
                if (!(msns.includes(notification['msnid']))) {
                    return true;
                }
                if ((msns.includes(notification['msnid']) && (notification['type'] === "oos" || notification['type'] === "unserviceable"))) {
                    return true;
                }
                return false;
            });
        }
        const saveNotfications = this.notifications.filter((notification) => notification['type'] == "unserviceable");
        return this.setValidateCartMessageApi({ userId: userSession['userId'], data: saveNotfications });
    }

    getCartNotificationsSubject(): Observable<any> { return this.notificationsSubject.asObservable(); }

    getCartNotifications() { return this.notifications; }

    clearNotifications()
    {
        this.cartNotications = [];
        this.notifications = [];
        (this.getGenericCartSession['itemsList'] as any[]).forEach((item) =>
        {
            delete item['text1'];
            delete item['text2'];
            delete item['nPrice'];
            delete item['oPrice'];
        })
    }

    clearCartNotfications()
    {
        this.clearNotifications()
        const user = this._localStorageService.retrieve('user');
        this.setValidateCartMessageApi({ userId: user['userId'], data: this.cartNotications }).subscribe(() => { console.log("cleared all notfication"); })
    }

    findInvalidItem()
    {
        const items = (this.getGenericCartSession['itemsList'] as any[]);
        const index = items.findIndex((item) => item['productQuantity'] === 0 || item['productQuantity'] === "");
        if (index > -1) {
            const item = this.getGenericCartSession.itemsList[index]
            const errorTxt = `${item.productName} cannot have invalid quantity.`;
            this._toastService.show({ type: 'error', text: errorTxt });
        }
        return index;
    }

    getBusinessDetail(data)
    {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this._dataService.callRestful("GET", url, { params: data }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    validateCartBeforePayment(obj)
    {
        let userSession = this._localStorageService.retrieve("user");
        return this.getBusinessDetail({ customerId: userSession.userId }).pipe(
            map((res: any) => res),
            mergeMap((d) =>
            {
                let bd: any = null;
                if (d && d.status && d.statusCode == 200) {
                    bd = {
                        company: d["data"]["companyName"],
                        gstin: d["data"]["gstin"],
                        is_gstin: d["data"]["isGstInvoice"],
                    };
                }
                obj["shoppingCartDto"]["businessDetails"] = bd;
                return this._dataService
                    .callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_BD, { body: obj })
                    .pipe(
                        catchError((res: HttpErrorResponse) => { return of({ status: false, statusCode: res.status }); }),
                        map((res: any) => { return res; })
                    );
            })
        );
    }

    getCartItemsCount() {
        let count = 0;
        if (this.cartSession['itemsList']) { count = (this.cartSession['itemsList'] as any[]).length; }
        return count;
    }

    getTotalPayableAmount(cart)
    {
        const totalAmount = cart['totalAmount'] || 0;
        const shippingCharges = cart['shippingCharges'] || 0;
        const totalOffer = cart['totalOffer'] || 0
        return (totalAmount + shippingCharges) - (totalOffer);
    }

    updateNonDeliverableItems(cartItems: any[], nonCashonDeliverableMsns: any[])
    {
        this.codNotAvailableObj['itemsArray'] = cartItems.filter((item) => nonCashonDeliverableMsns.includes(item.productId));
        this.cashOnDeliveryStatus.isEnable = (nonCashonDeliverableMsns.length === 0);
    }
    
    getPaymentDetailsByOrderId(orderId)
    {
        orderId = 3985262;
        const result = { status: false, data: null }
        const url = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_PAYMENT_DETAILS}${orderId}`;
        return this._dataService.callRestful("GET", url).pipe(
            map((res) => { return { status: res['status'], data: res['data'] } }),
            catchError((res: HttpErrorResponse) => { return of(result); }));
    }

    //Analytics
    sendAdobeOnCheckoutOnVisit(checkoutPageTye)
    {
        let subsection = (checkoutPageTye === 'address') ? `product summary & address details` : `payment methods`;
        subsection = `moglix:order checkout:${subsection}`;
        const digitalData = {};
        const cartSession = this.getGenericCartSession;
        const itemsList = cartSession['itemsList'] ? (cartSession['itemsList'] as []) :[];
        const user = this.localAuthService.getUserSession();
        let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', 
        shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
        for (let p = 0; p < itemsList.length; p++) {
            let price = itemsList[p]['productUnitPrice'];
            if (itemsList[p]['bulkPrice'] != '' && itemsList[p]['bulkPrice'] != null) {
                price = itemsList[p]['bulkPrice'];
            }
            taxo1 = itemsList[p]['taxonomyCode'].split("/")[0] + '|' + taxo1;
            taxo2 = itemsList[p]['taxonomyCode'].split("/")[1] + '|' + taxo2;
            taxo3 = itemsList[p]['taxonomyCode'].split("/")[2] + '|' + taxo3;
            productList = itemsList[p]['productId'] + '|' + productList;
            brandList = itemsList[p]['brandName'] ? itemsList[p]['brandName'] + '|' + brandList : '';
            productPriceList = price + '|' + productPriceList;
            shippingList = itemsList[p]['shippingCharges'] + '|' + shippingList;
            couponDiscountList = itemsList[p]['offer'] ? itemsList[p]['offer'] + '|' + couponDiscountList : '';
            quantityList = itemsList[p]['productQuantity'] + '|' + quantityList;
            totalDiscount = itemsList[p]['offer'] + totalDiscount;
            totalQuantity = itemsList[p]['productQuantity'] + totalQuantity;
            totalPrice = (price * itemsList[p]['productQuantity']) + totalPrice;
            totalShipping = itemsList[p]['shippingCharges'] + totalShipping;
        }
        let page = {
            'channel': "checkout",
            'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest",
            'pageName': subsection,
            'subSection': subsection,
            'order' : this.invoiceType
        }
        let custData = {
            'customerID': (user['userId'] && user['userId']) ? btoa(user['userId']) : '',
            'emailID': (user && user['email']) ? btoa(user['email']) : '',
            'mobile': (user && user['phone']) ? btoa(user['phone']) : '',
            'type': (user && user['userType']) ? user['userType'] : '',
            'customerCategory': user && user["customerCategory"]
        }
        let order = {
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'productID': productList,
            'brand': brandList,
            'productPrice': productPriceList,
            'shipping': shippingList,
            'couponDiscount': couponDiscountList,
            'quantity': quantityList,
            'totalDiscount': totalDiscount,
            'totalQuantity': totalQuantity,
            'totalPrice': totalPrice,
            'shippingCharges': totalShipping
        }
        digitalData["page"] = page;
        digitalData["custData"] = custData;
        digitalData["order"] = order;
        this._globalAnalyticsService.sendAdobeCall(digitalData);
    }

    pushPromocodesDataLayer()
    {
        setTimeout(() =>
        {
            const dlp = [];
            for (let p = 0; p < this.allPromoCodes.length; p++) {
                const promo = {
                    id: this.allPromoCodes[p]['promoId'],
                    name: this.allPromoCodes[p]['promoCode'],
                    'creative': 'banner1',
                    'position': 'slot1'
                };
                dlp.push(promo);
            }
            const data = {
                'event': 'promo- impressions',
                'ecommerce': {
                    'promoView': {
                        'promotions': dlp
                    }
                }
            }
            if(dlp && dlp.length) {
                this._globalAnalyticsService.sendGTMCall(data);
            }
        }, 3000);
    }

    sendCritieoDataonView(cartSession)
    {
        if (this._router.url !== '/quickorder') { return }
        let eventData = { 'prodId': '', 'prodPrice': 0, 'prodQuantity': 0, 'prodImage': '', 'prodName': '', 'prodURL': '' };
        let criteoItem = [];
        let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
        for (let p = 0; p < cartSession["itemsList"].length; p++) {
            let price = cartSession["itemsList"][p]['productUnitPrice'];
            if (cartSession["itemsList"][p]['bulkPrice'] != '' && cartSession["itemsList"][p]['bulkPrice'] != null) {
                price = cartSession["itemsList"][p]['bulkPrice'];
            }
            criteoItem.push({ name: cartSession["itemsList"][p]['productName'], id: cartSession["itemsList"][p]['productId'], price: cartSession["itemsList"][p]['productUnitPrice'], quantity: cartSession["itemsList"][p]['productQuantity'], image: cartSession["itemsList"][p]['productImg'], url: CONSTANTS.PROD + '/' + cartSession["itemsList"][p]['productUrl'] });
            eventData['prodId'] = cartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
            eventData['prodPrice'] = cartSession["itemsList"][p]['productUnitPrice'] * cartSession["itemsList"][p]['productQuantity'] + eventData['prodPrice'];
            eventData['prodQuantity'] = cartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
            eventData['prodImage'] = cartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
            eventData['prodName'] = cartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
            eventData['prodURL'] = cartSession["itemsList"][p]['productUrl'] + ', ' + eventData['prodURL'];
            taxo1 = cartSession["itemsList"][p]['taxonomyCode'].split("/")[0] + '|' + taxo1;
            taxo2 = cartSession["itemsList"][p]['taxonomyCode'].split("/")[1] + '|' + taxo2;
            taxo3 = cartSession["itemsList"][p]['taxonomyCode'].split("/")[2] + '|' + taxo3;
            productList = cartSession["itemsList"][p]['productId'] + '|' + productList;
            brandList = cartSession["itemsList"][p]['brandName'] ? cartSession["itemsList"][p]['brandName'] + '|' + brandList : '';
            productPriceList = price + '|' + productPriceList;
            shippingList = cartSession["itemsList"][p]['shippingCharges'] + '|' + shippingList;
            couponDiscountList = cartSession["itemsList"][p]['offer'] ? cartSession["itemsList"][p]['offer'] + '|' + couponDiscountList : '';
            quantityList = cartSession["itemsList"][p]['productQuantity'] + '|' + quantityList;
            totalDiscount = cartSession["itemsList"][p]['offer'] + totalDiscount;
            totalQuantity = cartSession["itemsList"][p]['productQuantity'] + totalQuantity;
            totalPrice = (price * cartSession["itemsList"][p]['productQuantity']) + totalPrice;
            totalShipping = cartSession["itemsList"][p]['shippingCharges'] + totalShipping;
        }
        let user = this._localStorageService.retrieve('user');
        let data = {
            'event': 'viewBasket',
            'email': (user && user.email) ? user.email : '',
            'currency': 'INR',
            'productBasketProducts': criteoItem,
            'eventData': eventData
        }
        if(criteoItem && criteoItem.length) {
            this._globalAnalyticsService.sendGTMCall(data);
        }
    }

    sendAdobeAnalyticsData(trackingname)
    {
        if (this._router.url !== '/quickorder') { return };
        let data = {};
        let user = this._localStorageService.retrieve('user');
        let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
        /*Start Adobe Analytics Tags */
        let page = {
            'linkPageName': "moglix:cart summary",
            'linkName': "Remove from cart",
        }
        let custData = {
            'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
            'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
            'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
            'customerType': (user && user["userType"]) ? user["userType"] : '',
            'customerCategory': user && user["customerCategory"]
        }
        let order = {
            'productCategoryL1': taxo1,
            'productCategoryL2': taxo2,
            'productCategoryL3': taxo3,
            'productID': productList,
            'brand': brandList,
            'productPrice': productPriceList,
            'shipping': shippingList,
            'couponDiscount': couponDiscountList,
            'quantity': quantityList,
            'totalDiscount': totalDiscount,
            'totalQuantity': totalQuantity,
            'totalPrice': totalPrice,
            'shippingCharges': totalShipping
        }
        data["page"] = page;
        data["custData"] = custData;
        data["order"] = order;
        this._globalAnalyticsService.sendAdobeCall(data, trackingname);
        /*End Adobe Analytics Tags */
    }

    AddSimilarProductOncartItem(productName,categoryId,BrandName,productId) {

        let URL =
        CONSTANTS.NEW_MOGLIX_API+ ENDPOINTS.GET_ADD_SIMILAR_PRODUCT_ON_CART +
        "?str=" + productName +
        "&category=" + categoryId +
        "&productId=" + productId +
        "&brand=" + BrandName ;
        
        return this._dataService.callRestful("GET", URL).pipe(
            map(res => {
                return res;
            })
        );
    }

    removePurchaseList(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RM_PCR_LIST;
        return this._dataService.callRestful("POST", url, { body: data });
    }
    
}