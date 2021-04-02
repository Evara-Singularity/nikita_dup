import { Injectable, EventEmitter, Optional } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { cartSession } from "../models/cart.initial";
import { DataService } from './data.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import CONSTANTS from '../../config/constants';


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
    
    constructor(private _dataService: DataService,@Optional() config?: CartServiceConfig) {
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
        // debugger;
        this._buyNow = buyNow;
    }

    get buyNow() {
        return this._buyNow;
    }

    test() {
        return Observable.create(observer => {
            observer.next(90);
            observer.complete();
        })
    }
    getProduct(product) {
        let params = { productId: product.productId };
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/product/getProductGroup", { params: params });
    }

    updateCart(cartSession) {
        // console.log('cartSession updateCart 33', Object.assign({},cartSession));
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
               item['tpawot'] = this.getTwoDecimalValue(item['priceWithoutTax']*item['productQuantity']);
                //item['tpawot'] = this.getTwoDecimalValue(item['productUnitPrice']*item['productQuantity']);

               item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] -  item["tpawot"]);
                //item['tax'] = this.getTwoDecimalValue(item['productQuantity'] *(item["productUnitPrice"] -  item["priceWithoutTax"]));

            }
            else {
                item["totalPayableAmount"] = this.getTwoDecimalValue(item["bulkPrice"] * item["productQuantity"]);
                item['tpawot'] = this.getTwoDecimalValue(item['bulkPriceWithoutTax']*item['productQuantity']);
                //item['tpawot'] = this.getTwoDecimalValue(item['bulkPrice']*item['productQuantity']);

                item['tax'] = this.getTwoDecimalValue(item["totalPayableAmount"] -  item["tpawot"]);
               // item['tax'] = this.getTwoDecimalValue(item['productQuantity'] * (item["bulkPrice"] -  item["bulkPriceWithoutTax"]));

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
    /**
     * @param sessionCart
     * Update cart on server session and then in local service varialbe: `cartSession` also
     */
    updateCartSession(sessionCart): any {
        sessionCart['itemsList'].map((item) => {
                delete item['tax'];
                delete item['tpawot'];
        });
        delete sessionCart['cart']['tawot'];
        delete sessionCart['cart']['tpt'];
        // console.log(sessionCart, 'sessionCartsessionCartsessionCart');

        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + '/cart/updateCart', { body: sessionCart })
        .pipe(
            map((d) => {
                if (d['status']) {
                    // console.log('updateCartSession d', d);
                    let totalAmount: number = 0;
                    let tawot: number = 0;
                    let tpt: number = 0;
                    // sessionCart['itemsList'] = Object.assign({}, d['itemsList']);
                    sessionCart['itemsList'].map((item) => {
                        if (item['bulkPrice'] == null) {
                            item['totalPayableAmount'] = this.getTwoDecimalValue(item['productUnitPrice'] * item['productQuantity']);
                            item['tpawot'] = this.getTwoDecimalValue(item['priceWithoutTax'] * item['productQuantity']);
                            //item['tpawot'] = this.getTwoDecimalValue(item['productUnitPrice']*item['productQuantity']);

                            item['tax'] = this.getTwoDecimalValue((item['productUnitPrice'] - item['priceWithoutTax']) * item['productQuantity']);
                            //item['tax'] = this.getTwoDecimalValue((item['productUnitPrice'] - item['priceWithoutTax']) * item['productQuantity']);

                        } else {
                            item['totalPayableAmount'] = this.getTwoDecimalValue(item['bulkPrice'] * item['productQuantity']);
                           item['tpawot'] = this.getTwoDecimalValue(item['bulkPriceWithoutTax'] * item['productQuantity']);
                           //item['tpawot'] = this.getTwoDecimalValue(item['bulkPrice']*item['productQuantity']);

                            item['tax'] = this.getTwoDecimalValue(item['totalPayableAmount'] - item['tpawot']);
                            //item['tax'] = this.getTwoDecimalValue(item['productQuantity']*(item["bulkPrice"] -  item["bulkPriceWithoutTax"]));

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

    getValidateCartMessageApi(params){
        // return of({statusCode: 200, data: [{"msnid":"MSNO5WNXD26L51","data":{"productName":"Honeywell SHST00201 S1 Grey & Blue Light Weight Sporty Safety Shoes, Size: 4","text1":" price has been updated from ","text2":"to","oPrice":2848,"nPrice":4500},"type":"price"},{"msnid":"MSNE5N8EJGXGKL","data":{"productName":"Honeywell Powercoat 950-20 Neo Fit Safety Gloves, 2095020-11","text1":" price has been updated from ","text2":"to","oPrice":151,"nPrice":1200},"type":"price"}]});
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/cart/getCartValidationMessages", { params: params });

    }
    
    setValidateCartMessageApi(data){
        // return of(null);
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/cart/setCartValidationMessages", { body: data });
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
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/cart/validateCart", { body: this.buyNow ? cartN : cart });
    }

    getSessionByUserId(cart) {
        /*let url = CONSTANTS.NEW_MOGLIX_API + "/cart/getCartByUser";
         return this._dataService.callRestful("POST", url, { body: cart });*/

        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/cart/getCartByUser", { body: cart });
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
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/cart/getCartBySession", { params: params })
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
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API + "/shipping/getShippingValue", { body: cartSession }).pipe(
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
}