import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AddToCartProductSchema } from "../models/cart.initial";
import { DataService } from './data.service';
import { BehaviorSubject, Observable, of, pipe, Subject } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalAuthService } from './auth.service';
import { GlobalLoaderService } from './global-loader.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { Router } from '@angular/router';
import { Address } from '../models/address.modal';

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
    public slectedAddress: number = -1;
    public isCartEditButtonClick: boolean = false;
    public prepaidDiscountSubject: Subject<any> = new Subject<any>(); // promo & payments
    public codNotAvailableObj = {}; // cart.component
    itemsValidationMessage;
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

    constructor(
        private _dataService: DataService,
        private _localStorageService: LocalStorageService,
        private localAuthService: LocalAuthService,
        private _loaderService: GlobalLoaderService,
        private _toastService: ToastMessageService,
        private _router: Router,
    ) { 
    }

    set billingAddress(address: Address)
    {
        this._billingAddress = address
    }

    get billingAddress()
    {
        return this._billingAddress
    }

    set shippingAddress(address: Address)
    {
        this._shippingAddress = address
    }

    get shippingAddress()
    {
        return this._shippingAddress
    }

    /**
     * Use const INVOICE_TYPE_RETAIL && INVOICE_TYPE_TAX
     */
    set invoiceType(type: 'retail' | 'tax')
    {
        this._invoiceType = type
    }

    get invoiceType()
    {
        return this._invoiceType
    }

    getShippingValue(cartSession)
    {
        // console.trace('getShippingValue cartservice');
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ShippingValue, { body: cartSession }).pipe(
            catchError((res: HttpErrorResponse) =>
            {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    setPayBusinessDetails(data)
    {
        Object.assign(this.payBusinessDetails, data);
    }

    getPayBusinessDetails()
    {
        return this.payBusinessDetails;
    }

    // get generic cart session object
    generateGenericCartSession(cartSessionFromAPI) {
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
    get getGenericCartSession() {
        return this.cartSession;
    }

    // return the Cart Session Object
    setGenericCartSession(cart) {
        this.cartSession = JSON.parse(JSON.stringify(cart));
        if (cart.offersList.length > 0) {
            this.appliedPromoCode = cart.offersList[0]['id'];
        }
    }

    getCartSession()
    {
        return JSON.parse(JSON.stringify(this.cartSession));
    }

    getTwoDecimalValue(a)
    {
        return Math.floor(a * 100) / 100;
    }

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
            .pipe(
                map((cartSessionResponse) => this.handleCartResponse(cartSessionResponse)),
            );
    }

    private handleCartResponse(cartSessionResponse): any {
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
        this._localStorageService.clear("user");
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

    set buyNowSessionDetails(sessionDetails)
    {
        this._buyNowSessionDetails = sessionDetails;
    }

    get buyNowSessionDetails()
    {
        return this._buyNowSessionDetails;
    }

    set buyNow(buyNow)
    {
        this._buyNow = buyNow;
    }

    get buyNow()
    {
        return this._buyNow;
    }

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
                mergeMap((result) =>
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
        const cartSession = this.generateGenericCartSession(result);
        this.setGenericCartSession(cartSession);
        this._cartUpdatesChanges.next(cartSession);
        this.orderSummary.next(result);
        this.localAuthService.login$.next(redirectUrl);
        let obj = { count: result.noOfItems || (result.itemsList ? result.itemsList.length : 0) };
        this.cart.next(obj);
        return of(cartSession);
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
    }

    private _getPrepaidDiscount(body) {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_PrepaidDiscount, { body: body }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    validatePaymentsDiscount(paymentMode, paymentId): Observable<any> {
        return of({
            "mode": paymentMode,
            "paymentId": paymentId,
            addressList: this.shippingAddress
        }).pipe(
            map((args) => {
                const validatorRequest = this.createValidatorRequest(args);
                return validatorRequest.shoppingCartDto;
            }),
            mergeMap((payload) => {
                return this._getPrepaidDiscount(payload).pipe(map((cartSessionResponse) => {
                    if (cartSessionResponse) {
                        return this._notifyCartChanges(cartSessionResponse, null);
                    }
                    return null;
                }))
            }),
            map((cartSession) => {
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
                // console.log('step 1 ==>', cartSession);
                // incase of buynow do not exlude 
                // console.log('product info ==> cartSession origin', Object.assign({}, cartSession));

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

                // console.log('step 1 ==>', cartSession);
                //this._loaderService.setLoaderState(false);
                if (args.buyNow) {
                    return { cartSession: updatedCartSession, productItemExistInCart };
                }

                // console.log('product info ==> after update',  Object.assign({}, cartSession), Object.assign({}, updatedCartSession), productItemExistInCart);
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
                        // console.log('step 3 ==>', cartSession);
                        if (args.buyNow && (!userSession || userSession['authenticated'] != "true")) {
                            // add temp session for buynow
                            // as per current flow, update cart api should not be called for buynow if user is not logged in
                            // console.log('step 3.1 ==>', cartSession);
                            this.buyNow = true;
                            this.buyNowSessionDetails = cartSession;
                            return null;
                        } else {
                            // console.log('step 3.2 ==>', cartSession);
                            return cartSession;
                        }
                    }),
                )
            }),
            mergeMap(request =>
            {
                if (request) {
                    // console.log('step 4 ==>', request, args);
                    return this.updateCartSession(request).pipe(
                        map((cartSession: any) =>
                        {
                            return cartSession;
                        })
                    );
                } else {
                    return of(null)
                }
            })
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
                        return this.generateGenericCartSession(cartSessionReponse)
                    }
                    // api returns false, then return actual object returned from server
                    return cartSessionReponse;
                })
            );
    }

    public getCartUpdatesChanges(): Observable<any> {
        return this._cartUpdatesChanges.asObservable()
    }

    public refreshCartSesion() {
        this.checkForUserAndCartSessionAndNotify().subscribe(status => {
            if (status) {
                this._cartUpdatesChanges.next(this.cartSession);
            } else {
                console.trace('cart refresh failed');
            }
        })
    }

    private publishCartUpdateChange(cartSession) {
        this._cartUpdatesChanges.next(cartSession);
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
    private _getUserSession(): Observable<any> {
        let user = this._localStorageService.retrieve('user');
        if (user) {
            return of(user);
        }
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_SESSION).pipe(
            map(res => {
                this.localAuthService.setUserSession(res);
                return res;
            })
        );
    }

    private _removePromoCode(cartSession): any {
        cartSession['offersList'] = [];
        cartSession['extraOffer'] = null;
        cartSession['cart']['totalOffer'] = 0;
        let itemsList = cartSession["itemsList"];
        itemsList.forEach((element, index) => {
            cartSession["itemsList"][index]['offer'] = null;
        });
        return cartSession;
    }
    // COMMON CART LOGIC IMPLEMENTATION ENDS

    // HTTP Wrappers

    getValidateCartMessageApi(params) {
        // used in cart.components.ts
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_GetCartValidationMessages, { params: params });
    }

    setValidateCartMessageApi(data) {
        // used in cart.components.ts
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SET_SetCartValidationMessages, { body: data });
    }

    validateCartApi(cart) {
        // used in cart.components.ts
        const cartN = JSON.parse(JSON.stringify(cart));
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_CART, { body: this.buyNow ? cartN : cart });
    }

    getSessionByUserId(cart) {
        // used in Shared Auth modules components
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CartByUser, { body: cart });
    }

    // TOOD: only used on cart.component.ts if required can be removed
    getProduct(product) {
        let params = { productId: product.productId };
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/product/getProductGroup", { params: params });
    }

    logoutCall() {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGOUT);
    }

    getShippingChargesApi(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
        return this._dataService.callRestful("POST", url, { body: obj }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    getMessageList(data, items) {
        let messageList = [];
        const msns: Array<string> = data ? Object.keys(data) : null;
        if (msns && items && items.length > 0) {
            items.forEach((item) => {
                if (msns.indexOf(item['productId']) != -1) {
                    let msg = {};
                    msg['msnid'] = item['productId'];
                    if (data[item['productId']]['updates']['outOfStockFlag']) {
                        msg['data'] = { productName: item['productName'], text1: ' is currently Out of Stock. Please remove from cart', text2: '', oPrice: '', nPrice: '' };
                        msg['type'] = "oos";
                    }
                    else if (data[item['productId']]['updates']['priceWithoutTax'] && (data[item['productId']]['productDetails']['priceWithoutTax'] < item["priceWithoutTax"])) {
                        msg['data'] = { productName: item['productName'], text1: ' price has been updated from ', text2: 'to', oPrice: item["priceWithoutTax"], nPrice: data[item['productId']]['productDetails']['priceWithoutTax'] };
                        // msg['data'] = item['productName']+" has " + (item["priceWithoutTax"]>data[item['productId']]['productDetails']['priceWithoutTax'] ? 'decreased' : 'increased') + " from Rs." + item["priceWithoutTax"] + " to Rs." + data[item['productId']]['productDetails']['priceWithoutTax'];
                        msg['type'] = "price";
                    } else if (data[item['productId']]['updates']['shipping'] != undefined) {

                        //check if shipping msg is already present in message list.
                        // let addmsg: number = messageList.findIndex(ml=>ml.type == "shipping" || ml.type == "coupon");
                        let addmsg: number = messageList.findIndex(ml => ml.type == "shipping");
                        //if(addmsg == -1){
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
                        // let addmsg: number = messageList.findIndex(ml=>ml.type == "shipping" || ml.type == "coupon");
                        let addmsg: number = messageList.findIndex(ml => ml.type == "coupon");
                        // if(addmsg == -1){
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

                        // } 

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



                        //  messageList.push(msg);

                    }
                }
            });
        }
        return messageList;
    }

    /**
     * 
     * @param itemsValidationMessage : new updates in item: price, shipping, coupon
     * This function add new items validation or update the older one for oos, and price.
     */
    setValidationMessageLocalstorage(itemsValidationMessageNew, itemsValidationMessageOld) {
        // const user = this.localStorageService.retrieve('user');
        if (itemsValidationMessageOld && itemsValidationMessageOld.length > 0) {
            itemsValidationMessageNew.forEach((itemValidationMessageNew) => {
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
        itemsValidationMessageOld = itemsValidationMessageOld.filter((itemValidationMessageOld) => {
            if (itemValidationMessageOld['type'] == 'oos') {
                return itemsValidationMessageNew.some(itemValidationMessageNew => itemValidationMessageOld['msnid'] == itemValidationMessageNew['msnid']);
            }
            return true;

        })
        return itemsValidationMessageOld;
        // this.localStorageService.store("user", user);
    }

    deleteValidationMessageLocalstorage(item, type?) {
        const user = this._localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            /** 
             * remove cart item message from local storage
             * 
             * */
            // let itemsValidationMessage: Array<string> = this.getValidationMessageLocalstorage();
            let itemsValidationMessage: Array<{}> = this.itemsValidationMessage;

            if (!itemsValidationMessage.length) {
                return itemsValidationMessage;
            }

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

            // userData["itemsValidationMessage"] = itemsValidationMessage;
            // this.localStorageService.store("user", userData);
            this.setValidateCartMessageApi({ userId: user['userId'], data: itemsValidationMessage }).subscribe(() => { });
            return [...itemsValidationMessage, ...itemsUnServicableMessage];
        } else {
            return null;
        }
    }

    
    getValidationMessageLocalstorage() {
        // return itemValidationMessage;
        // const user = this.localStorageService.retrieve('user');
        // return user["itemsValidationMessage"] ? user["itemsValidationMessage"] : [];
        return this.itemsValidationMessage;
    }

    addPriceUpdateToCart(itemsList, itemsValidationMessage) {
        //  ;
        // console.log(itemsValidationMessage);
        let itemsListNew = JSON.parse(JSON.stringify(itemsList));
        let itemsValidationMessageT = {}; //Transformed Items validation messages;
        for (let ivm in itemsValidationMessage) {
            itemsValidationMessageT[itemsValidationMessage[ivm]['msnid']] = itemsValidationMessage[ivm];
        }
        itemsListNew = itemsListNew.map((item) => {
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
                // item.text1 = item.text1.toUpperCase();
            }
            return item;
        })

        return itemsListNew;
    }

    updateCartItem(item, productResult) {
        item["amount"] = Number(productResult['mrp']),
            item["totalPayableAmount"] = Number(productResult['sellingPrice']),
            item["productMRP"] = productResult['mrp'],
            item["priceWithoutTax"] = productResult['priceWithoutTax'],
            item["tpawot"] = Number(productResult['priceWithoutTax']),
            item["productSelling"] = productResult['sellingPrice'],
            item["productUnitPrice"] = Number(productResult['sellingPrice'])
        // item["bulkPriceMap"] = productResult['bulkPriceWithSameDiscount']
        // ;
        if (item['bulkPriceWithoutTax'] && productResult['bulkPrices']) {
            item['bulkPriceMap'] = productResult['bulkPrices'];
            productResult['bulkPrices']['india'].forEach((element, index) => {
                if (element.minQty <= item['productQuantity'] && item['productQuantity'] <= element.maxQty) {
                    // this.bulkPriceSelctedQuatity = element.minQty;
                    item['bulkPrice'] = element.bulkSellingPrice;
                    item['bulkPriceWithoutTax'] = element.bulkSPWithoutTax;
                    // this.bulkDiscount = element.discount;                                        
                }
                if (productResult['bulkPrices']['india'].length - 1 == index && item['productQuantity'] >= element.maxQty) {
                    item['bulkPrice'] = element.bulkSellingPrice;
                    item['bulkPriceWithoutTax'] = element.bulkSPWithoutTax;

                }
            });
        }
        return item;
    }

    getAllPromoCodes() {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes;
        return this._dataService.callRestful('GET', url);
    }

    getAllPromoCodesByUserId(userID) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes +'?userId=' + userID;
        return this._dataService.callRestful('GET', url);
    }

    getPromoCodeDetailById(offerId) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails +'?promoId=' + offerId;
        return this._dataService.callRestful('GET', url);
    }

    applyPromoCode(obj) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validatePromoCode;
        return this._dataService.callRestful('POST', url, { body: obj });
    }

    getPromoCodeDetailByName(promoCode) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoCode=' + promoCode;
        return this._dataService.callRestful('GET', url);
    }

    
    genericApplyPromoCode() {
        this._loaderService.setLoaderState(true);
        const user = this.localAuthService.getUserSession();
        if (user.authenticated !== 'true') {
            this._toastService.show({ type: 'error', text: "To Avail Offer Please Login" });
        } else {
            this.getPromoCodeDetailByName(this.appliedPromoCode).subscribe(({status, data, statusDescription: message}: any) => {
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
                    this.applyPromoCode(cartObject).subscribe(({status, data, statusDescription: message}:any) => {
                        this._loaderService.setLoaderState(false);
                        if(status) {
                            console.log(data);
                            if (data['discount'] <= cartSession['cart']['totalAmount']) {
                                cartSession['cart']['totalOffer'] = data['discount'];
                                cartSession['extraOffer'] = null;
                                const productDiscount = data['productDis'];
                                const productIds = Object.keys(data['productDis'] ? data['productDis'] : {});

                                cartSession.itemsList.map((item) => {
                                    if (productIds.indexOf(item['productId']) !== -1) {
                                        return item['offer'] = productDiscount[item['productId']];
                                    } else {
                                        return item['offer'] = null;
                                    }
                                });

                                this.getShippingAndUpdateCartSession(cartSession).pipe(
                                    mergeMap(cartSession => this.updateCartSession(cartSession))).subscribe(
                                    data => {
                                        this.setGenericCartSession(data);
                                        this._loaderService.setLoaderState(false);
                                        this._toastService.show({ type: 'success', text: 'Promo Code Applied' });
                                    }
                                );
                                
                            } else {
                                cartSession['cart']['totalOffer'] = 0;
                                cartSession['offersList'] = [];
                                cartSession.itemLists.map((item) => item['offer'] = null);
                                this.getShippingAndUpdateCartSession(cartSession).subscribe(
                                    data => {
                                        this.setGenericCartSession(data);
                                        this._loaderService.setLoaderState(false);
                                        this._toastService.show({ type: 'error', text: 'Your cart amount is less than ' + data['discount'] });
                                    }
                                );
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

    genericRemovePromoCode() {
        if (!this.appliedPromoCode) return;
        this._loaderService.setLoaderState(true);
        let cartSession = this.getGenericCartSession;
        cartSession['offersList'] = [];
        cartSession['extraOffer'] = null;
        cartSession['cart']['totalOffer'] = 0;

        cartSession.itemsList.map((element) => {
            element['offer'] = null;
        });

        this.getShippingAndUpdateCartSession(cartSession).subscribe(
            data => {
                this.appliedPromoCode = '';
                this.setGenericCartSession(data);
                this.updateCartSession(data).subscribe(res => {
                    this._loaderService.setLoaderState(false);
                    this._toastService.show({ type: 'success', text: "Promo Code Removed" });
                });
            }
        );
    }
    private _getUserBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this._dataService.callRestful("GET", url, { params: data }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    pay(pdata) {
        let userSession = this._localStorageService.retrieve("user");
        return this._getUserBusinessDetail({ customerId: userSession.userId }).pipe(
            map((res: any) => res),
            mergeMap((d) => {
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
                        catchError((res: HttpErrorResponse) => {
                            return of({ status: false, statusCode: res.status });
                        }),
                        map((res: any) => {
                            return res;
                        })
                    );
            })
        );
    }
}