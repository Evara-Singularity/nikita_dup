import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ENDPOINTS } from '@app/config/endpoints';
import { ModalService } from '@app/modules/modal/modal.service';
import { SharedCheckoutUnavailableItemsComponent } from '@app/modules/shared-checkout-unavailable-items/shared-checkout-unavailable-items.component';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalStorageService } from 'ngx-webstorage';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
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
    public homePageFlyOut: Subject<any> = new Subject();
    public validateCartSession: Subject<any> = new Subject();
    public validAttributes: Subject<any> = new Subject();
    public payBusinessDetails: any;
    public businessDetailSubject: Subject<any> = new Subject<any>();
    public selectedBusinessAddressObservable: Subject<any> = new Subject();
    public productShippingChargesListObservable: Subject<any> = new Subject();
    private notificationsSubject: Subject<any[]> = new Subject<any[]>();
    //public slectedAddress: number = -1;
    public isCartEditButtonClick: boolean = false;
    public prepaidDiscountSubject: Subject<any> = new Subject<any>(); // promo & payments
    public codNotAvailableObj = {}; // cart.component
    itemsValidationMessage = [];
    notifications = [];
    appliedPromoCode;

    // checkout related global vars
    private _billingAddress: Address;
    private _shippingAddress: Address;
    private _invoiceType: 'retail' | 'tax' = this.INVOICE_TYPE_RETAIL;

    // vars used in revamped cart login 
    private _buyNow;
    private _buyNowSessionDetails;
    private cartSession: any = {
        "noOfItems": 0,
        "cart": {},
        "itemsList": [],
    };
    public cart: Subject<{ count: number, currentlyAdded?: any }> = new Subject();
    private _cartUpdatesChanges: BehaviorSubject<any> = new BehaviorSubject(this.cartSession);

    private previousUrl: string = null;
    private currentUrl: string = null;

    constructor(
        private _dataService: DataService, private _localStorageService: LocalStorageService, private localAuthService: LocalAuthService,
        private _modalService: ModalService, private _loaderService: GlobalLoaderService, private _toastService: ToastMessageService,
        private _router: Router, private _globalLoader: GlobalLoaderService, private _location: Location,
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
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ShippingValue, { body: cartSession }).
            pipe(catchError((res: HttpErrorResponse) => { return of({ status: false, statusCode: res.status }); }));
    }

    setPayBusinessDetails(data) { Object.assign(this.payBusinessDetails, data); }

    getPayBusinessDetails() { return this.payBusinessDetails; }

    // get generic cart session object
    generateGenericCartSession(cartSessionFromAPI)
    {
        const modifiedCartSessionObject = {
            cart: Object.assign({}, cartSessionFromAPI['cart']),
            itemsList: (cartSessionFromAPI["itemsList"] ? [...cartSessionFromAPI["itemsList"]] : []),
            addressList: (cartSessionFromAPI["addressList"] ? [...cartSessionFromAPI["addressList"]] : []),
            payment: cartSessionFromAPI["payment"],
            offersList: cartSessionFromAPI["offersList"],
            extraOffer: cartSessionFromAPI["extraOffer"]
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
        modifiedCartSessionObject.cart.totalPayableAmount = totalAmount + modifiedCartSessionObject.cart['shippingCharges'] - modifiedCartSessionObject.cart['totalOffer'];
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
        if (cart && cart.offersList && cart.offersList.length > 0) {
            this.appliedPromoCode = cart.offersList[0]['id'];
        }
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
        let sro = { itemsList: [], totalPayableAmount: 0 };
        if (cartSessions && cartSessions['itemsList'] && cartSessions['itemsList'].length > 0) {
            let itemsList: Array<{}> = cartSessions['itemsList'];
            itemsList.map((item) =>
            {
                sro.itemsList.push({ "productId": item["productId"], "categoryId": item["categoryCode"], "taxonomy": item["taxonomyCode"] });
            });
        }
        if (cartSessions && cartSessions['cart']) {
            sro['totalPayableAmount'] = cartSessions['cart']['totalPayableAmount'];
        }
        return sro;
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
        return this.getSessionByUserId(cartSession)
            .pipe(
                mergeMap((cartSession) =>
                {
                    if (this.buyNow) {
                        return this.updateCartSessions(null, this._updateCartSessionForBuyNow(cartSession, userSession))
                    } else {
                        return of(cartSession);
                    }
                }),
                mergeMap((cartSession: any) =>
                {
                    // only run shipping API when specified, eg. not required in Auth Module
                    // shipping API should be called after updatecart API always
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

    private _getShipping(cartSession): Observable<any>
    {
        let sro = this.getShippingObj(cartSession);
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
                    return cartSession;
                })
            );
    }

    public getShippingAndUpdateCartSession(cartSession): Observable<any>
    {
        return this._getShipping(cartSession);
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
                    totalPayableAmount: cart["totalAmount"] == null ? 0 : cart["totalAmount"],
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
                    emiFlag: extra.emitenure,
                    gateway: extra.gateway,
                },
                deliveryMethod: {
                    deliveryMethodId: 77,
                    type: "kjhlh",
                },
                offersList: offersList != undefined && offersList.length > 0 ? offersList : null,
                extraOffer: this.cartSession["extraOffer"] ? this.cartSession["extraOffer"] : null,
                device: CONSTANTS.DEVICE.device,
            },
        };
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
        return obj;
    }

    private getItemsList(cartItems)
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

    private _getPrepaidDiscount(body)
    {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_PrepaidDiscount, { body: body }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    validatePaymentsDiscount(paymentMode, paymentId): Observable<any>
    {
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
                if (request) { return this.updateCartSession(request); }
                return of(null)
            }),
            mergeMap((cartSession: any) =>
            {
                // only run shipping API when specified, eg. not required in Auth Module
                // shipping API should be called after updatecart API always
                if (cartSession) {
                    return this._getShipping(cartSession).pipe(
                        map((cartSession: any) => { console.trace(); return cartSession; }),
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
        return this._cartUpdatesChanges.asObservable()
    }

    // refresh and chnages to communicated 
    public refreshCartSesion()
    {
        // we do not want to refresh cart by pages component in case buynow event
        // conditional are hacks used because localtion.goback() refrsh page and call getcartsession API from pages component (root module)
        if (
            !this._buyNow &&
            !this.buyNowSessionDetails &&
            (this._router.url.indexOf('checkout/payment') === -1) &&
            !(this._router.url.indexOf('checkout/address') > 0 && this.previousUrl.indexOf('checkout/payment') > 0)
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

    // resetBuyNow()
    // {
    //     this._buyNow = false;
    //     this.buyNowSessionDetails = null;
    // }

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

    checkForUserAndCartSessionAndNotify(): Observable<boolean>
    {
        return this._getUserSession().pipe(
            map(userSessionDetails =>
            {
                return Object.assign({}, { "sessionid": userSessionDetails['sessionId'] })
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
            mergeMap(request =>
            {
                return this.getShippingAndUpdateCartSession(request).pipe(
                    map((res: any) =>
                    {
                        return this.generateGenericCartSession(res);
                    })
                );
            }),
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

    getAddToCartProductItemRequest(args: { productGroupData, buyNow, selectPriceMap?, quantity?, isFbt?}): AddToCartProductSchema
    {
        const partNumber = args.productGroupData['partNumber'] || args.productGroupData['defaultPartNumber'];
        const isProductPriceValid = args.productGroupData['productPartDetails'][partNumber]['productPriceQuantity'] != null;
        const priceQuantityCountry = (isProductPriceValid) ? Object.assign({}, args.productGroupData['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
        const productPartDetails = args.productGroupData['productPartDetails'][partNumber];
        const productMrp = (isProductPriceValid && priceQuantityCountry) ? priceQuantityCountry['mrp'] : null;
        const productTax = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice']) && !isNaN(priceQuantityCountry['sellingPrice'])) ?
            (Number(priceQuantityCountry['sellingPrice']) - Number(priceQuantityCountry['sellingPrice'])) : 0;
        const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
        const priceWithoutTax = (priceQuantityCountry) ? priceQuantityCountry['priceWithoutTax'] : null;
        const productBrandDetails = args.productGroupData['brandDetails'];
        const productCategoryDetails = args.productGroupData['categoryDetails'][0];
        const productMinimmumQuantity = (priceQuantityCountry && priceQuantityCountry['moq']) ? priceQuantityCountry['moq'] : 1;
        const productLinks = productPartDetails['productLinks'];
        const product = {
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
            productName: args.productGroupData['productName'],
            brandName: productBrandDetails['brandName'],
            priceWithoutTax: priceWithoutTax,
            taxPercentage: priceQuantityCountry['taxRule']['taxPercentage'],
            productImg: (productPartDetails['images']) ? `${this.imageCdnPath}${productPartDetails['images'][0]['links']['thumbnail']}` : '',
            isPersistant: true,
            productQuantity: (args.quantity && !isNaN(args.quantity) && +args.quantity > productMinimmumQuantity) ? args.quantity : productMinimmumQuantity,
            productUnitPrice: productPrice,
            expireAt: null,
            productUrl: productPartDetails['canonicalUrl'] || productLinks['canonical'] || productLinks['default'],
            bulkPriceMap: priceQuantityCountry['bulkPrices'],
            bulkPrice: null,
            bulkPriceWithoutTax: null,
            categoryCode: productCategoryDetails['categoryCode'],
            taxonomyCode: productCategoryDetails['taxonomyCode'],
            buyNow: args.buyNow,
            filterAttributesList: args.productGroupData['filterAttributesList'] || null,
            discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(0),
            category: productCategoryDetails['taxonomy'],
            isOutOfStock: this._setOutOfStockFlag(priceQuantityCountry),
            quantityAvailable: priceQuantityCountry['quantityAvailable'] || 0,
            productMRP: productMrp,
            productSmallImage: CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productPartDetails[partNumber].images[0].links.small,
            productImage: CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productPartDetails[partNumber].images[0].links.medium,
            url: productPartDetails.canonicalUrl,
            isProductUpdate: 0,
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
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_CART, { body: this.buyNow ? cartN : cart });
    }

    getSessionByUserId(cart)
    {
        // used in Shared Auth modules components
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
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
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

    //TODO:Remove after new notification revampe
    /**
     * 
     * @param itemsValidationMessage : new updates in item: price, shipping, coupon
     * This function add new items validation or update the older one for oos, and price.
     */
    setValidationMessageLocalstorage(itemsValidationMessageNew, itemsValidationMessageOld)
    {
        if (itemsValidationMessageOld && itemsValidationMessageOld.length > 0) {
            itemsValidationMessageNew.forEach((itemValidationMessageNew) =>
            {
                let isExist = false;
                for (let i = 0; i < itemsValidationMessageOld.length; i++) {
                    let itemValidationMessageOld = itemsValidationMessageOld[i];
                    if (itemValidationMessageOld['msnid'] == itemValidationMessageNew['msnid']) {
                        isExist = true;
                        if (itemValidationMessageNew['type'] == 'price' || itemValidationMessageNew['type'] == 'oos') {
                            itemsValidationMessageOld[i] = Object.assign({}, itemValidationMessageNew);
                        }
                        break;
                    }
                }
                if (!isExist) {
                    itemsValidationMessageOld.push(itemValidationMessageNew);
                }
                else {
                    itemsValidationMessageOld = itemsValidationMessageNew;
                }
            })
        } else {
            itemsValidationMessageOld = itemsValidationMessageNew;
        }
        // Remove oos validation message, if it is instock after sometime
        itemsValidationMessageOld = itemsValidationMessageOld.filter((itemValidationMessageOld) =>
        {
            if (itemValidationMessageOld['type'] == 'oos') {
                return itemsValidationMessageNew.some(itemValidationMessageNew => itemValidationMessageOld['msnid'] == itemValidationMessageNew['msnid']);
            }
            return true;

        })
        return itemsValidationMessageOld;
    }

    //TODO:Remove after new notification revampe
    deleteValidationMessageLocalstorage(item, type?)
    {
        const user = this._localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            //remove cart item message from local storage
            let itemsValidationMessage: Array<{}> = this.itemsValidationMessage;
            if (!itemsValidationMessage.length) { return itemsValidationMessage; }
            let itemsUnServicableMessage = [];
            if (!type || type != "delete") {
                itemsUnServicableMessage = itemsValidationMessage.filter(ivm => ivm['type'] == "unservicable");
            }
            itemsValidationMessage = itemsValidationMessage.filter(ivm => ivm['msnid'] != item['productId']);
            if (type && type == "delete") {
                itemsUnServicableMessage = itemsValidationMessage.filter(ivm => ivm['type'] == "unservicable");
            }
            itemsValidationMessage = itemsValidationMessage.filter(ivm => ivm['type'] != "unservicable");
            itemsValidationMessage = itemsValidationMessage.filter(ivm => ivm['type'] != "coupon");
            itemsValidationMessage = itemsValidationMessage.filter(ivm => ivm['type'] != "shipping");
            itemsValidationMessage = itemsValidationMessage.filter(ivm => ivm['type'] != "shippingcoupon");
            this.setValidateCartMessageApi({ userId: user['userId'], data: itemsValidationMessage }).subscribe(() => { });
            return [...itemsValidationMessage, ...itemsUnServicableMessage];
        } else {
            return null;
        }
    }

    //TODO:Remove after new notification revampe
    getValidationMessageLocalstorage()
    {
        // return itemValidationMessage;
        // const user = this.localStorageService.retrieve('user');
        // return user["itemsValidationMessage"] ? user["itemsValidationMessage"] : [];
        return this.itemsValidationMessage;
    }

    //TODO:Remove after new notification revampe
    addPriceUpdateToCart(itemsList, itemsValidationMessage)
    {
        let itemsListNew = JSON.parse(JSON.stringify(itemsList));
        let itemsValidationMessageT = {}; //Transformed Items validation messages;
        for (let ivm in itemsValidationMessage) {
            itemsValidationMessageT[itemsValidationMessage[ivm]['msnid']] = itemsValidationMessage[ivm];
        }
        itemsListNew = itemsListNew.map((item) =>
        {
            item.text1 = null;
            item.text2 = null;
            item.oPrice = null;
            item.nPrice = null;
            if (itemsValidationMessageT[item['productId']] && itemsValidationMessageT[item['productId']]['type'] == 'price') {
                const data = itemsValidationMessageT[item['productId']]['data'];
                item.text1 = data['text1'];
                item.text2 = data['text2'];
                item.oPrice = data['oPrice'];
                item.nPrice = data['nPrice'];
            }
            return item;
        })
        return itemsListNew;
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

    getAllPromoCodes()
    {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes;
        return this._dataService.callRestful('GET', url);
    }

    getAllPromoCodesByUserId(userID)
    {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes + '?userId=' + userID;
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

    genericApplyPromoCode()
    {
        this._loaderService.setLoaderState(true);
        const user = this.localAuthService.getUserSession();
        if (user.authenticated !== 'true') {
            this._toastService.show({ type: 'error', text: "To Avail Offer Please Login" });
        } else {
            this.getPromoCodeDetailByName(this.appliedPromoCode).subscribe(({ status, data, statusDescription: message }: any) =>
            {
                if (status) {
                    let obj = [{
                        offerId: data['promoAttributes']['promoId'],
                        type: '15'
                    }];
                    const cartSession = this.getGenericCartSession;
                    cartSession['offersList'] = obj;
                    const cartObject = {
                        'shoppingCartDto': cartSession
                    };
                    this.applyPromoCode(cartObject).subscribe(({ status, data, statusDescription: message }: any) =>
                    {
                        this._loaderService.setLoaderState(false);
                        if (status) {
                            console.log(data);
                            if (data['discount'] <= cartSession['cart']['totalAmount']) {
                                cartSession['cart']['totalOffer'] = data['discount'];
                                cartSession['extraOffer'] = null;
                                const productDiscount = data['productDis'];
                                const productIds = Object.keys(data['productDis'] ? data['productDis'] : {});

                                cartSession.itemsList.map((item) =>
                                {
                                    if (productIds.indexOf(item['productId']) !== -1) {
                                        return item['offer'] = productDiscount[item['productId']];
                                    } else {
                                        return item['offer'] = null;
                                    }
                                });
                                this.setGenericCartSession(cartSession);
                                this._loaderService.setLoaderState(false);
                                this._toastService.show({ type: 'success', text: 'Promo Code Applied' });
                            } else {
                                cartSession['cart']['totalOffer'] = 0;
                                cartSession['offersList'] = [];
                                cartSession.itemLists.map((item) => item['offer'] = null);
                                this.setGenericCartSession(cartSession);
                                this._loaderService.setLoaderState(false);
                                this._toastService.show({ type: 'error', text: 'Your cart amount is less than ' + data['discount'] });
                            }
                        } else {
                            this.appliedPromoCode = '';
                            this._toastService.show({ type: 'error', text: message });
                        }
                    });
                } else {
                    this.appliedPromoCode = '';
                    this._loaderService.setLoaderState(false);
                    this._toastService.show({ type: 'error', text: message });
                }
            });
        }
    }

    genericRemovePromoCode()
    {
        if (!this.appliedPromoCode) return;
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
                this.setGenericCartSession(data);
                this.updateCartSession(data).subscribe(res =>
                {
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

    //cart removal logic
    deleteValidationMessages(removableItems: any[])
    {
        const DELETE = "delete";
        let NEW_VALIDATION_MSGS = [];
        removableItems.forEach((item) => { NEW_VALIDATION_MSGS = this.deleteValidationMessageLocalstorage(item, DELETE); });
        this.itemsValidationMessage = NEW_VALIDATION_MSGS;
    }

    updateOfferList(cartSession, data)
    {
        const DISCOUNT = data['discount'];
        const TOTAL_AMOUNT = this.cartSession['cart']['totalAmount'];
        if (DISCOUNT < TOTAL_AMOUNT) {
            cartSession['cart']['totalOffer'] = DISCOUNT;
            const ITEMS: any[] = cartSession['itemsList'];
            const DISCOUNT_WISE_PRODUCTS = data['productDis'] ? Object.keys(data['productDis']) : [];
            ITEMS.forEach((item) =>
            {
                item['offer'] = null;
                if (DISCOUNT_WISE_PRODUCTS.includes(item['productId'])) {
                    item['offer'] = data["productDis"][item["productId"]];
                }
            });
            cartSession["itemsList"] = ITEMS;
            return cartSession;
        }
        cartSession['cart']['totalOffer'] = 0;
        cartSession['offersList'] = [];
        cartSession.itemsList.forEach((item) => item["offer"] = null);
        return cartSession;
    }

    /**@description display unavailable items in pop-up */
    viewUnavailableItems(types: string[])
    {
        const itemsList: any[] = JSON.parse(JSON.stringify(this.getGenericCartSession['itemsList']));
        const unserviceableMsns = JSON.parse(JSON.stringify(this.notifications))
            .filter(item => types.includes(item['type'])).reduce((acc, cv) => { return [...acc, ...[cv['msnid']]] }, []);
        const LIST: any[] = itemsList.filter(item => item['oos'] || unserviceableMsns.indexOf(item['productId']) != -1);
        if (LIST.length === 0) return;
        this._modalService.show({
            component: SharedCheckoutUnavailableItemsComponent,
            inputs: { data: { page: 'all', items: LIST, removeUnavailableItems: this.removeUnavailableItems.bind(this) } },
            outputs: {},
            mConfig: { className: 'ex' }
        });
    }

    removeUnavailableItems(items: any[])
    {
        const MSNS = items.map(item => item['productId']);
        this.removeCartItemsByMsns(MSNS)//postprocessing
    }

    //Post processing
    removeCartItemsByMsns(msns: string[])
    {
        const CART_SESSION = JSON.parse(JSON.stringify(this.cartSession));
        const EXISTING_ITEMS = (CART_SESSION['itemsList'] as any[]);
        const REMOVABLE_ITEMS = []; const NON_REMOVABLE_ITEMS = [];
        EXISTING_ITEMS.forEach((item) =>
        {
            if (msns.includes(item['productId'])) { REMOVABLE_ITEMS.push(item); return; }
            NON_REMOVABLE_ITEMS.push(item);
        });
        this.deleteValidationMessages(REMOVABLE_ITEMS);
        this.removeNotifications(msns)
        this.updateCartAfterItemsDelete(CART_SESSION, NON_REMOVABLE_ITEMS);
    }

    verifyPromocode(cartSession)
    {
        const USER_SESSION = this._localStorageService.retrieve('user');
        if (USER_SESSION && USER_SESSION['authenticated'] === "true") {
            if (cartSession['offersList'] && cartSession['offersList'].length) {
                const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CART.validatePromoCode}`;
                let reqobj = { "shoppingCartDto": this.cartSession };
                return this._dataService.callRestful('POST', URL, { body: reqobj })
                    .pipe(
                        map((response) =>
                        {
                            const SUCCESS = response['status'];
                            if (SUCCESS) {
                                cartSession = this.updateOfferList(cartSession, response['data']);
                                return cartSession;
                            }
                            this._toastService.show(({ type: "error", text: response["statusDescription"] || "Unable to update the offer list." }))
                            return cartSession;
                        }),
                        catchError((error: HttpErrorResponse) => cartSession)
                    );
            }
        }
        return of(cartSession);
    }

    verifyShippingCharges(cartSession)
    {
        const SHIPPING_DATA = this.getShippingObj(cartSession);
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.CART.getShippingValue}`;
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

    updateCartAfterItemsDelete(CART_SESSION, items: any[])
    {
        CART_SESSION['itemsList'] = items;
        this._globalLoader.setLoaderState(true);
        let newCartSessionFromSwitchMap;
        this.updateCartSession(CART_SESSION).pipe(
            switchMap((newCartSession) =>
            {
                console.log('verifyPromocode', newCartSession);
                return this.verifyPromocode(newCartSession)
            }),
            switchMap((newCartSession) =>
            {
                newCartSessionFromSwitchMap = newCartSession;
                return this.verifyShippingCharges(newCartSession)
            }),
            switchMap((newCartSession) =>
            {
                newCartSessionFromSwitchMap = newCartSession;
                return this.validateCartApi(newCartSession)
            })).
            subscribe((newCartSession) =>
            {
                this._globalLoader.setLoaderState(false);
                this._toastService.show({ type: 'error', text: 'Product successfully removed from Cart' });
                const ITEM_LIST = newCartSessionFromSwitchMap['itemsList'];
                if (ITEM_LIST && ITEM_LIST.length == 0 && this._router.url.indexOf('/checkout') != -1) {
                    this.clearBuyNowFlow();
                    // clears browser history so they can't navigate with back button
                    this._location.replaceState('/');
                    this._router.navigateByUrl('/quickorder');
                }
                if (newCartSessionFromSwitchMap.hasOwnProperty('itemsList')) {
                    this._notifyCartChanges(newCartSessionFromSwitchMap, null);
                }
            })
    }

    clearBuyNowFlow()
    {
        if (this._buyNow || this._buyNowSessionDetails) {
            this.buyNow = false;
            this.buyNowSessionDetails = null;
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

    setUnserviceables(unserviceables: any[])
    {
        this.notifications = this.notifications.filter((notifcation) => notifcation.type !== 'unserviceable');
        this.notifications = [...this.notifications, ...unserviceables];
        this.notificationsSubject.next(this.notifications);
    }

    verifyAndUpdateNotfications()
    {
        if (this.localAuthService.isUserLoggedIn()) {
            const USER_SESSION = this.localAuthService.getUserSession();
            const CART_SESSION = this.getGenericCartSession;
            const VALIDATE_CART_REQUEST = { "shoppingCartDto": CART_SESSION };
            const VALIDATE_CART_MESSAGE_REQUEST = { userId: USER_SESSION['userId'] };
            const buyNow = this.buyNow;
            if (buyNow) { VALIDATE_CART_MESSAGE_REQUEST['buyNow'] = buyNow; }
            forkJoin([this.validateCartApi(VALIDATE_CART_REQUEST), this.getValidateCartMessageApi(VALIDATE_CART_MESSAGE_REQUEST)]).subscribe((responses) =>
            {
                const validateCartResponse = responses[0];
                const validateCartMessageResponse = responses[1];
                let validateCartData = null, validateCartMessageData = null;
                if (validateCartResponse['status']) { validateCartData = validateCartResponse['data'] }
                if (validateCartMessageResponse['statusCode']) { validateCartMessageData = validateCartMessageResponse['data'] }
                this.processNotifications(USER_SESSION['userId'], CART_SESSION['itemsList'], validateCartData, validateCartMessageData);
            });
        }
    }

    /**
     * @description
     * @param userId :logged in user id
     * @param items : current cart items
     * @param validateCartData : data of any updated cart related item changes
     * @param validateCartMessageData : provides current existing notifications
     */
    processNotifications(userId, items: any[], validateCartData, validateCartMessageData)
    {
        const VALIDATE_CART_NOTIFICATION_MSNS: string[] = validateCartData ? Object.keys(validateCartData) : [];
        const FILTERED_CART_ITEMS: any[] = items.filter((item) => VALIDATE_CART_NOTIFICATION_MSNS.includes(item['productId']));
        if (VALIDATE_CART_NOTIFICATION_MSNS.length === 0 || items.length === 0) { return }
        const OLD_NOTIFICATIONS: any[] = validateCartMessageData || [];
        const NEW_NOTIFICATIONS: any[] = this.buildNotifications(FILTERED_CART_ITEMS, validateCartData);
        console.log(NEW_NOTIFICATIONS);
        if (NEW_NOTIFICATIONS.length > 0) {
            this.notifications = this.updateNotifications(OLD_NOTIFICATIONS, NEW_NOTIFICATIONS);
            this.notificationsSubject.next(this.notifications);
        }
        this.setValidateCartMessageApi({ userId: userId, data: this.notifications }).subscribe(() =>
        {
            console.log("Successfully updated notifications")
        });
        this.modifyCartAItemsAfterNotifications(items, validateCartData);
    }

    buildNotifications(FILTERED_ITEMS: any[], validateCartData): any[]
    {
        let messageList = [];
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
            }
            else if (UPDATES['priceWithoutTax'] && (validateCartData[CART_PRODUCT_MSN]['productDetails']['priceWithoutTax'] < CART_PRODUCT_PRICE)) {
                msg['type'] = "price";
                msg['data'] = { productName: CART_PRODUCT_NAME, text1: ' price has been updated from ', text2: 'to', oPrice: CART_PRODUCT_PRICE, nPrice: validateCartData[CART_PRODUCT_MSN]['productDetails']['priceWithoutTax'] };
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
                else if (SHIPPING_INDEX === -1 && COUPON_INDEX === -1 && SHIPPING_COUPON_INDEX === -1) {
                    messageList.push(msg);
                }
            }
        });
        return messageList;
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
            finalNotfications = newNotfications;
            if (oldNotfications.length > newNotfications.length) {
                finalNotfications = this.updateOldWithNewNotifications(oldNotfications, newNotfications)
            } else {
                finalNotfications = this.updateNewWithOldNotifications(newNotfications, oldNotfications)
            }
            finalNotfications = this.updateOldWithNewNotifications(oldNotfications, newNotfications)
        }
        return finalNotfications;
    }

    updateOldWithNewNotifications(oldNotfications: any[], newNotfications: any[])
    {
        let finalNotifications: any[] = []
        const COMMON_MSNS = [];
        const NEW_OOS_MSNS = newNotfications.filter((notification) => notification['type'] === 'oos').map((notification) => notification['msnid']);
        for (let oIndex = 0; oIndex < oldNotfications.length; oIndex++) {
            for (let iIndex = 0; iIndex < newNotfications.length; iIndex++) {
                if (oldNotfications[oIndex]['msnid'] === newNotfications[iIndex]['msnid']) {
                    oldNotfications[oIndex] = newNotfications[iIndex];
                    COMMON_MSNS.push(oldNotfications[oIndex]['msnid']);
                }
            }
        }
        oldNotfications = oldNotfications.filter((notification) => NEW_OOS_MSNS.includes(notification['msnid']));
        finalNotifications = newNotfications.filter((notification) => !COMMON_MSNS.includes(notification['msnid']));
        oldNotfications = [...oldNotfications, ...finalNotifications]
        return oldNotfications;
    }

    updateNewWithOldNotifications(newNotfications: any[], oldNotfications: any[])
    {
        let finalNotifications: any[] = [];
        const COMMON_MSNS = [];
        const NEW_OOS_MSNS = newNotfications.filter((notification) => notification['type'] === 'oos').map((notification) => notification['msnid']);
        for (let oIndex = 0; oIndex < newNotfications.length; oIndex++) {
            for (let iIndex = 0; iIndex < oldNotfications.length; iIndex++) {
                if (oldNotfications[oIndex]['msnid'] === newNotfications[iIndex]['msnid']) {
                    oldNotfications[oIndex] = newNotfications[iIndex];
                    COMMON_MSNS.push(oldNotfications[oIndex]['msnid']);
                }
            }
        }
        oldNotfications = oldNotfications.filter((notification) => NEW_OOS_MSNS.includes(notification['msnid']));
        finalNotifications = newNotfications.filter((notification) => !COMMON_MSNS.includes(notification['msnid']));
        oldNotfications = [...oldNotfications, ...finalNotifications]
        return oldNotfications;
    }

    updateNotifications(oldNotfications: any[], newNotfications: any[]): any[]
    {
        if (oldNotfications.length === 0) { return newNotfications; }
        let finalNotifications: any[] = null;
        for (let newNotification of newNotfications) {
            for (let oldNotfication of oldNotfications) {
                if (oldNotfication['msnid'] === newNotification['msnid']) {
                    if (newNotification['type'] == 'price' || newNotification['type'] == 'oos') {
                        finalNotifications.push(newNotification);
                        continue;
                    }
                    finalNotifications.push(oldNotfication);
                    finalNotifications.push(newNotification);
                }
            }
        }
        return finalNotifications;
    }

    removeNotifications(msn: any[])
    {
        if (!this.localAuthService.isUserLoggedIn()) return;
        const userSession = this.localAuthService.getUserSession();
        this.notifications = this.notifications.filter((notification) => { notification['msnid'] === msn; })
        this.notificationsSubject.next(this.notifications);
        this.setValidateCartMessageApi({ userId: userSession['userId'], data: this.notifications }).subscribe(() =>
        {
            console.log("Successfully updated notifications")
        });
    }

    modifyCartAItemsAfterNotifications(items: any[], validateCartData)
    {
        let msn_data = {}
        this.notifications.forEach((notification) =>
        {
            if (notification["type"] === "price") {
                msn_data[notification["msnid"]] = notification;
            }
        });
        let itemsListNew = JSON.parse(JSON.stringify(items));
        itemsListNew = itemsListNew.map((item) =>
        {
            const PRODUCT_ID = item['productId'];
            item.text1 = null; item.text2 = null; item.oPrice = null; item.nPrice = null;
            if (msn_data.hasOwnProperty(PRODUCT_ID)) {
                const data = msn_data[PRODUCT_ID]['data'];
                item.text1 = data['text1'];
                item.text2 = data['text2'];
                item.oPrice = data['oPrice'];
                item.nPrice = data['nPrice'];
            }
            return item;
        })
        this.updateCartItemsAfterNotfications(itemsListNew, validateCartData)
    }

    updateCartItemsAfterNotfications(newItems: any[], validateCartData)
    {
        let canUpdateCart = false;
        let oosData = [];
        let itemsList = newItems.map((item) =>
        {
            const PRODUCT_ID = item['productId'];
            if (!validateCartData.hasOwnProperty(PRODUCT_ID)) return item;
            const UPDATES = validateCartData[PRODUCT_ID]['updates'];
            if (UPDATES['outOfStockFlag']) {
                item['oos'] = true;
                oosData.push({ msnid: item['productId'] });
            }
            else if (UPDATES['priceWithoutTax'] || UPDATES['shipping']) {
                canUpdateCart = true;
                //delete oos from frontend because item is again instock
                if (item['oos']) { delete item['oos']; }
                return this.updateCartItem(item, validateCartData[PRODUCT_ID]['productDetails']);
            } else if (UPDATES['shipping'] || UPDATES['coupon']) {
                canUpdateCart = true;
                if (item['oos']) { delete item['oos']; }
            }
            return item;
        });
        if (oosData.length > 0 || canUpdateCart) {
            const CART_SESSION = this.getGenericCartSession;
            CART_SESSION.shoppingCartDto['itemsList'] = itemsList;
            const NEW_SESSSION_DETAILS = this.updateCart(CART_SESSION.shoppingCartDto);
            this.setGenericCartSession(NEW_SESSSION_DETAILS);
            if (canUpdateCart) { this.updateCartSession(NEW_SESSSION_DETAILS); }
        }
    }

    updateCart(cartSessionResponse)
    {
        const cartSessionObj = {
            cart: Object.assign({}, cartSessionResponse['cart']),
            itemsList: (cartSessionResponse["itemsList"] ? [...cartSessionResponse["itemsList"]] : []),
            addressList: (cartSessionResponse["addressList"] ? [...cartSessionResponse["addressList"]] : []),
            payment: cartSessionResponse["payment"],
            offersList: cartSessionResponse["offersList"],
            extraOffer: cartSessionResponse["extraOffer"]
        }
        let totalAmount: number = 0;
        let tawot: number = 0; // totalAmountWithOutTax
        let tpt: number = 0; //totalPayableTax
        let itemsList = cartSessionObj.itemsList ? cartSessionObj.itemsList : [];
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
        cartSessionObj.cart.totalAmount = totalAmount;
        cartSessionObj.cart.totalPayableAmount = totalAmount + cartSessionObj.cart['shippingCharges'] - cartSessionObj.cart['totalOffer'];
        cartSessionObj.cart.tawot = tawot;
        cartSessionObj.cart.tpt = tpt;
        cartSessionObj.itemsList = itemsList;
        return cartSessionObj;
    }
    
    getCartNotificationsSubject() { return this.notificationsSubject; }

    getCartNotifications() { return this.notifications; }

    clearAllNotfications()
    {
        this.notifications = [];
        this.setValidateCartMessageApi([]).subscribe(() => { console.log("cleared all notfication"); })
    }

}