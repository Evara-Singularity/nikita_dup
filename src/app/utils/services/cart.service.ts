import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AddToCartProductSchema, cartSession } from "../models/cart.initial";
import { DataService } from './data.service';
import { Observable, of, Subject } from 'rxjs';
import { first, share, debounceTime, distinctUntilChanged, catchError, map, mergeMap } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalAuthService } from './auth.service';
import { GlobalLoaderService } from './global-loader.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { Router } from '@angular/router';
import { CommonService } from './common.service';

@Injectable({ providedIn: 'root' })
export class CartService
{

    readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
    public cart: Subject<{ count: number, currentlyAdded?: any }> = new Subject();
    public cartUpdated: Subject<any> = new Subject();
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

    // vars used in revamped cart login 
    private _buyNow;
    private _buyNowSessionDetails;
    private cartSession: {};

    constructor(
        private _dataService: DataService,
        private _localStorageService: LocalStorageService,
        private localAuthService: LocalAuthService,
        private _loaderService: GlobalLoaderService,
        private _toastService: ToastMessageService,
        private _router: Router,
        private _commonService: CommonService,
    )
    {
        this.cartSession = cartSession;
    }

    ngOnInit()
    {
        // TODO: need to verify , how this is used
        this._dataService.dataServiceCart.subscribe(data =>
        {
            this.cart.next({ count: data });
        })
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

    // REVAMP CODE SECTION
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

    setCartSession(cart)
    {
        this.cartSession = cart;
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

    getCartSession()
    {
        return JSON.parse(JSON.stringify(this.cartSession));
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

    getCartBySession(params): Observable<any> {
        /**
         *  Return cart from server session.
         *  Save returned to service local variable: `cartSession`
         */
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CartBySession, { params: params })
            .pipe(
                map((cartSessionResponse) => {
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
                }),
            );
    }

    logOutAndClearCart(redirectURL = null) {
        this.logoutCall().pipe(
            map(logoutReponse => {
                this._localStorageService.clear("user");
                this.cart.next({ count: 0 });
                return logoutReponse;
            }),
            mergeMap(logoutReponse => this.checkForUserAndCartSessionAndNotify()),
        ).subscribe(status => {
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
        this._getShipping(this.getCartSession()).subscribe(cartSession =>
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
        const cartSession = Object.assign(this.getCartSession());
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
        const cartSession = this.updateCart(result);
        this.setCartSession(cartSession);
        this.orderSummary.next(result);
        this.localAuthService.login$.next(redirectUrl);
        let obj = { count: result.noOfItems || (result.itemsList ? result.itemsList.length : 0) };
        this.cart.next(obj);
        return of(cartSession);
    }

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
                    args.buyNow
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
                    cartSession = this.updateCart(cartSession)
                    //if not buynow flow then update global cart session in service
                    if (!args.buyNow) {
                        this.setCartSession(cartSession);
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
                        return this.updateCart(cartSessionReponse)
                    }
                    // api returns false, then return actual object returned from server
                    return cartSessionReponse;
                })
            );
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
                        return this.updateCart(res);
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
            discount: this._commonService.calculcateDiscount(priceQuantityCountry['discount'], productMrp, productPrice),
            category: productCategoryDetails['taxonomy'],
            isOutOfStock: this._setOutOfStockFlag(priceQuantityCountry),
            quantityAvailable: priceQuantityCountry['quantityAvailable'] || 0,
            productMRP: productMrp,
            productSmallImage: CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productPartDetails[partNumber].images[0].links.small,
            productImage: CONSTANTS.IMAGE_BASE_URL + args.productGroupData.productPartDetails[partNumber].images[0].links.medium,
            url: productPartDetails.canonicalUrl,
            sellingPrice: productPrice
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

    private _checkQuantityOfProductItemAndUpdate(product: AddToCartProductSchema, cartSession, quantity = 1, buyNow = false)
    {
        let itemsList = (cartSession && cartSession['itemsList']) ? [...cartSession['itemsList']] : [];
        itemsList.map((productItem: AddToCartProductSchema) =>
        {
            if (productItem.productId == product.productId) {
                // increment quantity by 1
                productItem['productQuantity'] = +productItem['productQuantity'] + (+quantity)
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
    private _checkForUserAndCartSession(): Observable<any> {
        return of(this.getCartSession()).pipe(
            mergeMap(cartSessionDetails => {
                if (cartSessionDetails && cartSessionDetails['cart']) {
                    return of(this.updateCart(cartSessionDetails));
                } else {
                    return this._getUserSession().pipe(
                        map(userSessionDetails => {
                            return Object.assign({}, { "sessionid": userSessionDetails['sessionId'] })
                        }),
                        mergeMap(request => {
                            return this.getCartBySession(request).pipe(
                                map((res: any) => this.updateCart(res))
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

    logoutCall() {
        return this._dataService.callRestful("GET",CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.LOGOUT);
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

}