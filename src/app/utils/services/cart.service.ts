import { Injectable, EventEmitter, Optional } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AddToCartProductSchema, cartSession } from "../models/cart.initial";
import { DataService } from './data.service';
import { concat, Observable, Observer, of, pipe, Subject, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { LocalStorageService } from 'ngx-webstorage';


export class CartServiceConfig {
    userName = '';
}

@Injectable({ providedIn: 'root' })
export class CartService {

    public cart: Subject<any> = new Subject();
    public cartUpdated: Subject<any> = new Subject();

    public extra: Subject<{errorMessage: string}> = new Subject();

    public orderSummary: Subject<any> = new Subject();

    public homePageFlyOut: Subject<any> = new Subject();

    public validateCartSession: Subject<any> = new Subject();

    // public selectedBusinessAddressObservable: Rx.Subject<any> = new Rx.Subject();

    private cartSession: {};

    public validAttributes: Subject<any> = new Subject();

    public payBusinessDetails: any;

    public businessDetailSubject: Subject<any> = new Subject<any>();

    public selectedBusinessAddressObservable: Subject<any> = new Subject();

    public productShippingChargesListObservable: Subject<any> = new Subject();

    public slectedAddress: number = -1;
    updateProduct$ = new EventEmitter();
    //updateCart$ = new EventEmitter();
    updateCart$: Subject<any> = new Subject<any>();

    public isCartEditButtonClick: boolean = false;

    public prepaidDiscountSubject: Subject<any> = new Subject<any>();
   
    public codNotAvailableObj ={}; 
    
    private _buyNow;

    private _buyNowSessionDetails;
    
    constructor(
        private _dataService: DataService,
        private _localStorageService: LocalStorageService,
        @Optional() config?: CartServiceConfig) {
        this.cartSession = cartSession;
        this.updateCart$.subscribe(() => {
            alert(this.test());
        });
    }
    

    ngOnInit() {
        this._dataService.dataServiceCart.subscribe(data => {
            //  alert('ok');
            this.cart.next(data);
        })
        let itemsArray = [];
        
    }

    set buyNowSessionDetails(sessionDetails) {
        this._buyNowSessionDetails = sessionDetails;
    }

    get buyNowSessionDetails() {
        return this._buyNowSessionDetails;
    }

    set buyNow(buyNow) {
        //  ;
        this._buyNow = buyNow;
    }

    get buyNow() {
        return this._buyNow;
    }

    test() {
        return new Observable((observer: Observer<any>) => {
            observer.next(90);
            observer.complete();
        })
    }
    getProduct(product) {
        let params = { productId: product.productId };
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/product/getProductGroup", { params: params });
    }

    updateCart(cartSession) {
        let totalAmount: number = 0;
        let tawot: number = 0;
        let tpt: number = 0; //totalPayableTax
        // let tpawot: number = 0;
        let cart = cartSession["cart"];
        let itemsList = cartSession["itemsList"] ? cartSession["itemsList"] : [];
        // let totalOffer = 0;
        for (let item of itemsList) {
            if (item["bulkPrice"] == null) {
                item["totalPayableAmount"] = this.getTwoDecimalValue(item["productUnitPrice"] * item["productQuantity"]);
                item['tpawot'] = this.getTwoDecimalValue(item['priceWithoutTax'] * item['productQuantity']);
                item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            else {
                item["totalPayableAmount"] = this.getTwoDecimalValue(item["bulkPrice"] * item["productQuantity"]);
                item['tpawot'] = this.getTwoDecimalValue(item['bulkPriceWithoutTax'] * item['productQuantity']);
                item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            totalAmount = this.getTwoDecimalValue(totalAmount + item.totalPayableAmount);
            tawot = this.getTwoDecimalValue(tawot + item.tpawot);
            tpt = tpt + item['tax'];
        };

        cart.totalAmount = totalAmount;
        cart.totalPayableAmount = totalAmount + cart['shippingCharges'] - cart['totalOffer'];
        cart.tawot = tawot;
        cart.tpt = tpt;
        cartSession["cart"] = cart;
        cartSession["itemsList"] = itemsList;

        // this.cartSession = cartSession;
        //console.log('cartSession 33', Object.assign({},cartSession));
        return cartSession;
    }

    getTwoDecimalValue(a){
        return Math.floor(a * 100) / 100;
    }

    getValidateCartMessageApi(params){
        // return of({statusCode: 200, data: [{"msnid":"MSNO5WNXD26L51","data":{"productName":"Honeywell SHST00201 S1 Grey & Blue Light Weight Sporty Safety Shoes, Size: 4","text1":" price has been updated from ","text2":"to","oPrice":2848,"nPrice":4500},"type":"price"},{"msnid":"MSNE5N8EJGXGKL","data":{"productName":"Honeywell Powercoat 950-20 Neo Fit Safety Gloves, 2095020-11","text1":" price has been updated from ","text2":"to","oPrice":151,"nPrice":1200},"type":"price"}]});
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_GetCartValidationMessages, { params: params });

    }
    
    setValidateCartMessageApi(data){
        // return of(null);
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SET_SetCartValidationMessages, { body: data });
    }

    getBuyNowItem(itemsList){
        let items = [...itemsList]
        items = items.filter(item => item['buyNow']);
        return items;    
    }
    
    validateCartApi(cart) {
        // return of({
        //     "data": {
        //         // "MSN2KM1GJWNN9V": {
        //         //     "updates": {
        //         //         // "shipping": 909,
        //         //         "priceWithoutTax": 1914,
        //         //         "outOfStockFlag": true
        //         //     },
        //         //     "productDetails": {
        //         //         "mrp": 2573,
        //         //         "sellingPrice": 2259,
        //         //         "oos": false,
        //         //         "quantityAvailable": 100,
        //         //         "incrementUnit": 1,
        //         //         "moq": 1,
        //         //         "productName": "Akari 40x250 mm DNC Series ISO Certified Magnetic Cylinder",
        //         //         "taxPercentage": 18,
        //         //         "priceWithoutTax": 4500,
        //         //         "status": true,
        //         //         "bulkPrices": null
        //         //     }
        //         // },
        //         "MSN2QGPCO2KA09": {
        //             "updates": {
        //                 // "shipping": 909,
        //                 "priceWithoutTax": 1914,
        //                 // "outOfStockFlag": true
        //             },
        //             "productDetails": {
        //                 "mrp": 2573,
        //                 "sellingPrice": 2259,
        //                 "oos": false,
        //                 "quantityAvailable": 100,
        //                 "incrementUnit": 1,
        //                 "moq": 1,
        //                 "productName": "Akari 40x250 mm DNC Series ISO Certified Magnetic Cylinder",
        //                 "taxPercentage": 18,
        //                 "priceWithoutTax": 2500,
        //                 "status": true,
        //                 "bulkPrices": null
        //             }
        //         },
        //         "MSN2QGPCO1D8NV": {
        //             "updates": {
        //                 // "shipping": 909,
        //                 // "priceWithoutTax": 1914,
        //                 "outOfStockFlag": true
        //             },
        //             "productDetails": {
        //                 "mrp": 2573,
        //                 "sellingPrice": 2259,
        //                 "oos": false,
        //                 "quantityAvailable": 100,
        //                 "incrementUnit": 1,
        //                 "moq": 1,
        //                 "productName": "Akari 40x250 mm DNC Series ISO Certified Magnetic Cylinder",
        //                 "taxPercentage": 18,
        //                 "priceWithoutTax": 12000,
        //                 "status": true,
        //                 "bulkPrices": null
        //             }
        //         },
        //         "MSN2QGYA84O7IR": {
        //             "updates": {
        //                 // "shipping": 909,
        //                 "priceWithoutTax": 1914,
        //                 // "outOfStockFlag": true
        //             },
        //             "productDetails": {
        //                 "mrp": 2573,
        //                 "sellingPrice": 2259,
        //                 "oos": false,
        //                 "quantityAvailable": 100,
        //                 "incrementUnit": 1,
        //                 "moq": 1,
        //                 "productName": "Akari 40x250 mm DNC Series ISO Certified Magnetic Cylinder",
        //                 "taxPercentage": 18,
        //                 "priceWithoutTax": 1200,
        //                 "status": true,
        //                 "bulkPrices": null
        //             }
        //         }
        //     },
        //     "status": 200
        // });
        const cartN = JSON.parse(JSON.stringify(cart));
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.VALIDATE_CART, { body: this.buyNow ? cartN : cart });
    }

    getSessionByUserId(cart) {
        /*let url = CONSTANTS.NEW_MOGLIX_API + "/cart/getCartByUser";
         return this._dataService.callRestful("POST", url, { body: cart });*/

        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CartByUser, { body: cart });
        /*.map((cbsd)=> cbsd
            .mergeMap((cartSession:any)=>{
                Object.assign(this.cartSession, cartSession);
                // console.log(cartSession, "loginuserloginuserloginuserloginuserloginuserloginuserloginuser");
                return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/shipping/getShippingValue", {body:cartSession})
                    .map((sv: any) => {

                        if(sv && sv['status'] && sv['statusCode'] == 200){
                            cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];

                            // Below condition is added to resolve : someitmes error is occurring itemsList.length is undefined.
                            if(sv['data']['totalShippingAmount'] != undefined && sv['data']['totalShippingAmount'] != null){
                                let itemsList = cartSession['itemsList'];
                                for(let i=0; i<itemsList.length; i++){
                                    cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                                }
                            }
                            Object.assign(this.cartSession, cartSession);
                            // console.log(this.cartSession, cartSession);
                        }
                        return cartSession;
                    });
            })*/
    }
    //  * Return cart from local service variable: `cartSession` itself
    //  *
    //  */
    getCartSession() {
        return JSON.parse(JSON.stringify(this.cartSession));
    }

    setCartSession(cart) {
        this.cartSession = cart;
    }

    /**
     *  Return cart from server session.
     *  Save returned to local variable: `cartSession`
     */
    getCartBySession(params) {
        // console.log(params, "params");
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CartBySession, { params: params })
        .pipe(
            map((d) => {

                if (d['status']) {
                    let totalAmount: number = 0;
                    // let totalPayableAmount: number = 0;
                    let tawot: number = 0;
                    let tpt: number = 0; //totalPayableTax
                    if(d['itemsList'] && d['itemsList'].length){
                        d['itemsList'].map((item)=>{
                            if (item["bulkPrice"] == null) {
                                item["totalPayableAmount"] = Number(item["productUnitPrice"]) * Number(item["productQuantity"]);
                               item['tpawot'] = this.getTwoDecimalValue(item['priceWithoutTax']*item['productQuantity']);
                                item['tax'] = this.getTwoDecimalValue((item['productUnitPrice'] - item['priceWithoutTax'])*item['productQuantity']);
                                //item['tpawot'] = this.getTwoDecimalValue(item['productUnitPrice']*item['productQuantity']);

                                //item['tax'] = this.getTwoDecimalValue((item['productUnitPrice'] - item['priceWithoutTax'])*item['productQuantity']);

                            }
                            else {
                                item["totalPayableAmount"] = this.getTwoDecimalValue(item["bulkPrice"] * item["productQuantity"]);
                                item['tpawot'] = this.getTwoDecimalValue(item['bulkPriceWithoutTax']*item['productQuantity']);
                                //item['tax'] = this.getTwoDecimalValue( item["productQuantity"] *( item["bulkPrice"] -  item["bulkPriceWithoutTax"]));
                                //item['tpawot'] = this.getTwoDecimalValue(item['bulkPrice']*item['productQuantity']);


                                item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
                                // console.log(item['tpawot'], 'itempawotitempawotitempawotitempawotitempawot');
                            }
                            totalAmount = this.getTwoDecimalValue(totalAmount + item.totalPayableAmount);
                            tawot = this.getTwoDecimalValue(tawot + item.tpawot);
                            tpt = tpt + item['tax'];
                            // item['tpawot'] = item['priceWithoutTax']*item['productQuantity'];
                            // item['tax'] = (item['productUnitPrice'] - item['priceWithoutTax'])*item['productQuantity'];
                        });
                    }
                    if(!d['cart']){
                        d['cart'] = {};
                    }
                    d['cart']['totalAmount'] = totalAmount;
                    d['cart']['totalPayableAmount'] = totalAmount;
                    d['cart']['tawot'] = tawot;
                    d['cart']['tpt'] = tpt;
    
                }
                
               return d;
            })
        );
    }

    getShippingValue(cartSession) {
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ShippingValue, { body: cartSession }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }

    setPayBusinessDetails(data) {
        Object.assign(this.payBusinessDetails, data);
    }

    getPayBusinessDetails() {
        return this.payBusinessDetails;
    }
    getShippingObj(cartSessions){
        let sro = {itemsList: [], totalPayableAmount: 0};
        if(cartSessions && cartSessions['itemsList'] && cartSessions['itemsList'].length > 0) {
            let itemsList: Array<{}> = cartSessions['itemsList'];
            itemsList.map((item)=>{
                sro.itemsList.push({"productId": item["productId"], "categoryId": item["categoryCode"], "taxonomy": item["taxonomyCode"]});                    
            });
        }

        if(cartSessions && cartSessions['cart']) {
            sro['totalPayableAmount'] = cartSessions['cart']['totalPayableAmount'];
        }

        return sro;
    }

    updateCartSessions(routerLink, sessionDetails, buyNow?) {
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
    }): Observable<any> {
        return this._checkForUserAndCartSession().pipe((
            // Action : Check whether product already exist in cart itemList if exist exit
            map(cartSession => {
                // incase of buynow do not exlude 
                if (args.buyNow) {
                    return cartSession;
                }
                const itemsList = (cartSession && cartSession['itemsList']) ? [...cartSession['itemsList']] : [];
                const filteredArr = itemsList.filter(items => items['productId'] == args.productDetails.productId);
                return (filteredArr.length > 0) ? null : cartSession;
            })
        )).pipe(
            // Action : update sessionId & cartId in productDetails
            map((cartSession) => {
                console.log('step 1 ==>', cartSession);
                if (!cartSession) {
                    return cartSession;
                } else {
                    args.productDetails.cartId = cartSession['cart']['cartId'];
                    args.productDetails.buyNow = args.buyNow;
                    cartSession['cart']['buyNow'] = args.buyNow;
                    // Action : While adding check whether it is buynow flow, 
                    // if yes then a add a single product and maintain buynow flow
                    const items = (cartSession['itemsList']) ? [...cartSession['itemsList']] : [];
                    // update buynow flag items
                    cartSession['itemsList'] = (args.buyNow) ? [args.productDetails] : [...items, args.productDetails];
                    // remove promocodes incase of buynow
                    cartSession = (args.buyNow) ? this._removePromoCode(cartSession) : Object.assign({}, cartSession);
                    // calculate total price and cart value.
                    cartSession = this.updateCart(cartSession)
                    //if not buynow flow then update global cart session in service
                    if(!args.buyNow){
                        this.setCartSession(cartSession);
                    }
                    return cartSession;
                }
            }), 
            mergeMap(cartSession => {
                console.log('step 2 ==>', cartSession);
                return this._getUserSession().pipe(
                    map(userSession => {
                        if (args.buyNow && (!userSession || userSession['authenticated'] != "true")) {
                            // add temp session for buynow
                            // as per current flow, update cart api should not be called for buynow if user is not logged in 
                            console.log('step 3 ==>', cartSession);
                            this.buyNowSessionDetails = cartSession;
                            return null;
                        } else {
                            return cartSession;
                        }
                    }),
                )
            }),
            mergeMap(request => {
                if(request){
                    return this.updateCartSession(request).pipe(
                        map((cartSession: any) => {
                            return cartSession;
                        })
                    );
                }else{
                    return of(null)
                }
            })
        )
    }

    /**
     * @param sessionCart
     * Update cart on server session and then in local service varialbe: `cartSession` also
     */
    updateCartSession(sessionCart): Observable<any> {
        // delete extra props
        sessionCart['itemsList'].map((item) => {
            delete item['tax'];
            delete item['tpawot'];
        });
        delete sessionCart['cart']['tawot'];
        delete sessionCart['cart']['tpt'];
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.UPD_CART, { body: sessionCart })
            .pipe(
                map((d) => {
                    if (d['status']) {
                        let totalAmount: number = 0;
                        let tawot: number = 0;
                        let tpt: number = 0;
                        sessionCart['itemsList'].map((item) => {
                            if (item['bulkPrice'] == null) {
                                item['totalPayableAmount'] = this.getTwoDecimalValue(item['productUnitPrice'] * item['productQuantity']);
                                item['tpawot'] = this.getTwoDecimalValue(item['priceWithoutTax'] * item['productQuantity']);
                                item['tax'] = this.getTwoDecimalValue((item['productUnitPrice'] - item['priceWithoutTax']) * item['productQuantity']);
                            } else {
                                item['totalPayableAmount'] = this.getTwoDecimalValue(item['bulkPrice'] * item['productQuantity']);
                                item['tpawot'] = this.getTwoDecimalValue(item['bulkPriceWithoutTax'] * item['productQuantity']);
                                item['tax'] = this.getTwoDecimalValue(item['totalPayableAmount'] - item['tpawot']);
                            }

                            totalAmount = this.getTwoDecimalValue(totalAmount + item.totalPayableAmount);
                            tawot = this.getTwoDecimalValue(tawot + item.tpawot);
                            tpt = tpt + item['tax'];
                        });
                        sessionCart.cart.totalAmount = totalAmount;
                        sessionCart.cart.totalPayableAmount = d["cart"]["totalPayableAmount"];
                        sessionCart.cart.tawot = tawot;
                        sessionCart.cart.tpt = tpt;
                        sessionCart['noOfItems'] = d['noOfItems'];
                        sessionCart['statusDescription'] = d['statusDescription'];
                        sessionCart['statusCode'] = d['statusCode'];
                        sessionCart['status'] = d['status'];
                        // return local cart because, some properties are not comming back from api like shipping charges.
                        return sessionCart;
                    }
                    // api returns false, then return actual object returned from server
                    return d;
                })
            );
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
                    return of(cartSessionDetails);
                } else {
                    return this._getUserSession().pipe(
                        map(userSessionDetails => {
                            return Object.assign({}, { "sessionid": userSessionDetails['sessionId'] })
                        }),
                        mergeMap(request => {
                            return this.getCartBySession(request).pipe(
                                map((res: any) => {
                                    return res;
                                })
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
            map(res => res)
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

}