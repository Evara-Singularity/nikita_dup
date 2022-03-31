import { mergeMap, takeUntil } from 'rxjs/operators';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { CONSTANTS } from '@app/config/constants';
import { map, catchError } from 'rxjs/operators';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastMessageService } from '@modules/toastMessage/toast-message.service';
import { ProductService } from '@utils/services/product.service';
import { CartService } from '@utils/services/cart.service';
import { CheckoutService } from '@utils/services/checkout.service';
import { CommonService } from '@utils/services/common.service';
import { DataService } from '@utils/services/data.service';
import { ObjectToArray } from '@utils/pipes/object-to-array.pipe';
import { FooterService } from '@utils/services/footer.service';
import { GlobalState } from '@utils/global.state';
import { GlobalLoaderService } from '@utils/services/global-loader.service';
import { of, forkJoin } from 'rxjs';

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;


@Component({
    selector: 'cart',
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss'],
})

export class CartComponent {
    removePopup: boolean = false;
    removeIndex = 0;
    @Input() moduleName: 'CHECKOUT' | 'QUICKORDER' = 'QUICKORDER';

    constructor(
        private _location: Location,
        public _state: GlobalState,
        public meta: Meta,
        public pageTitle: Title,
        public objectToArray: ObjectToArray,
        public footerService: FooterService,
        public activatedRoute: ActivatedRoute,
        public dataService: DataService,
        public _commonService: CommonService,
        public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService,
        public _router: Router,
        public _cartService: CartService,
        private _tms: ToastMessageService,
        private _productService: ProductService,
        private _globalLoaderService: GlobalLoaderService,
    ) {}

    ngOnInit() {
        // Get latest cart from API
        this._commonService.updateUserSession();
        this.loadCartDataFromAPI();
    }

    // Function to get and set the latest cart
    loadCartDataFromAPI() {
        this._globalLoaderService.setLoaderState(true);
        this._cartService.getCartUpdatesChanges().subscribe(result => {
            this._globalLoaderService.setLoaderState(false);
            
            this.validateCart();
        });
    }

    validateCart() {
        const USER_SESSION = this.localStorageService.retrieve("user");
        const IS_LOGGED_IN = (USER_SESSION && USER_SESSION['authenticated'] === "true");
        if (!IS_LOGGED_IN) return;
        const cartSession = { "shoppingCartDto": this._cartService.getGenericCartSession };
        forkJoin([
            this._cartService.validateCartApi(cartSession),
            this._cartService.getValidateCartMessageApi({ userId: this._commonService.userSession['userId'] })
        ]).subscribe(res => {
            let itemsValidationMessageOld = [];
                let itemsValidationMessage = [];
                if (res[1]['statusCode'] == 200) {
                    itemsValidationMessageOld = res[1]['data'];
                }
                if (res[0]['status'] == 200) {
                    itemsValidationMessage = this._cartService.getMessageList(res[0]['data'], cartSession.shoppingCartDto.itemsList);

                    //Only set validation message if any, if no validation message is found then dont override or remove previous validation messages;
                    if (itemsValidationMessage && itemsValidationMessage.length > 0) {
                        itemsValidationMessage = this._cartService.setValidationMessageLocalstorage(itemsValidationMessage, itemsValidationMessageOld);
                    } else {
                        //remove all oos product from message list
                        itemsValidationMessageOld = itemsValidationMessageOld.filter(item => {
                            const indexInValidationMesage = (this._cartService.getGenericCartSession.itemList && this._cartService.getGenericCartSession.itemList.length > 0) ? this._cartService.getGenericCartSession.itemList.findIndex(cartItem => item['msnid'] === cartItem['productId']) : -1;
                            if (indexInValidationMesage < 0) return false;
                            if (item['type'] == 'oos') {
                                return false;
                            } else {
                                return true;
                            }
                        })
                        itemsValidationMessage = itemsValidationMessageOld;
                    }
                    this._cartService.itemsValidationMessage = itemsValidationMessage;
                    this._cartService.setValidateCartMessageApi({ userId: this._commonService.userSession['userId'], data: itemsValidationMessage }).subscribe(res => {});

                    let items = cartSession.shoppingCartDto['itemsList'];
                    const msns: Array<string> = res[0]['data'] ? Object.keys(res[0]['data']) : [];
                    if (items && items.length > 0) {
                        // Below function is used to show price update at item level if any validation message is present corresponding to item.
                        items = this._cartService.addPriceUpdateToCart(items, itemsValidationMessage);
                        cartSession.shoppingCartDto.itemsList = items;
                        // ucs: updateCartSession
                        let ucs: boolean = false;
                        let oosData: Array<{}> = [];
                        let itemsList = items.map((item) => {
                            if (msns.indexOf(item['productId']) != -1) {
                                if (res[0]['data'][item['productId']]['updates']['outOfStockFlag']) {
                                    item['oos'] = true;
                                    oosData.push({ msnid: item['productId'] });
                                }
                                else if (res[0]['data'][item['productId']]['updates']['priceWithoutTax']) {
                                    ucs = true;
                                    //delete oos from frontend because item is again instock
                                    if (item['oos']) {
                                        delete item['oos'];
                                    }
                                    return this._cartService.updateCartItem(item, res[0]['data'][item['productId']]['productDetails']);
                                } else if (res[0]['data'][item['productId']]['updates']['shipping']) {
                                    if (item['oos']) {
                                        delete item['oos'];
                                    }
                                    ucs = true;
                                } else if (res[0]['data'][item['productId']]['updates']['coupon']) {
                                    if (item['oos']) {
                                        delete item['oos'];
                                    }
                                    ucs = true;
                                }
                                return item;
                            } else {
                                return item;
                            }
                        });
                        
                        if (oosData && oosData.length > 0) {
                            cartSession.shoppingCartDto['itemsList'] = itemsList;
                            this._cartService.setGenericCartSession(this._cartService.generateGenericCartSession(cartSession.shoppingCartDto));
                        }
                    }
                }
        });
    };

    // Get shipping value of each product items in cart
    getShippingValue(cartSession) {
        let sro = this._cartService.getShippingObj(cartSession);
        return this._cartService.getShippingValue(sro)
            .pipe(
                map((sv: any) => {
                    if (sv && sv['status'] && sv['statusCode'] == 200) {
                        cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                        if (sv['data']['totalShippingAmount'] != undefined && sv['data']['totalShippingAmount'] != null) {
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

    // To increment decrement and manually update of cart item quantity
    updateCartItemQuantity(quantityTarget, index, action, buyNow = false) {
        const currentItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity;
        let updatedCartItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity;
        let incrementOrDecrementBy = 0;
        
        if (action === 'increment') {
            incrementOrDecrementBy = 1;
            updatedCartItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity + 1;
        } else if (action === 'decrement') {
            if (quantityTarget < 2) {
                this.removeIndex = index;
                this.removePopup = true;
                return;
            };
            incrementOrDecrementBy = -1;
            updatedCartItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity - 1;
        }

        if (updatedCartItemCount < 0 || quantityTarget < 0) {
            this.removeIndex = index;
            this.removePopup = true;
            return;
        };

        if (action === 'update') {
            if (this._cartService.getGenericCartSession.itemsList[index].moq < quantityTarget) {
                this._tms.show({
                    type: 'error',
                    text: 'Minimum qty can be ordered is: ' + this._cartService.getGenericCartSession.itemsList[index].moq
                })
            }
            return;
        }
        
        this._globalLoaderService.setLoaderState(true);

        const productMsnId = this._cartService.getGenericCartSession.itemsList[index].productId;
        this._productService.getProductGroupDetails(productMsnId).pipe(
            map(productRawData => {
                if (productRawData['productBO']) {
                    let productData = this._cartService.getAddToCartProductItemRequest({ productGroupData: productRawData['productBO'], buyNow });
                    if (action === 'update'){
                        updatedCartItemCount = +quantityTarget;
                        productData.isProductUpdate = quantityTarget;
                    }
                    return productData;
                } else {
                    return null;
                }
        })).subscribe((productDetails: AddToCartProductSchema) => {
            if (productDetails) {
                if (productDetails['productQuantity'] && (productDetails['quantityAvailable'] < productDetails['productQuantity'])) {
                    this._tms.show({ type: 'error', text: "Quantity not available" });
                    return;
                }
                productDetails.productQuantity = incrementOrDecrementBy;
                let isQua = this.isQuantityAvailable(updatedCartItemCount, productDetails, index);
                if (isQua["status"]) {
                    this._cartService.addToCart({ buyNow, productDetails }).pipe(
                        mergeMap((data: any) => {
                            if (this._commonService.isServer) {
                                return of(null);
                            }
                            /**
                             * return cartSession, if sessionId mis match
                             */
                            if (data['statusCode'] !== undefined && data['statusCode'] === 202) {
                                return of(data);
                            }
                            return this.getShippingValue(data);
                        }),
                    ).subscribe(result => {
                        if (!result && this._cartService.buyNowSessionDetails) {
                            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                        } else {
                            if (result) {
                                if (!buyNow) {                                    
                                    this.validateCart();
                                    this._cartService.setGenericCartSession(result);
                                    this._cartService.cart.next({
                                        count: result['noOfItems'] || (result['itemsList'] ? result['itemsList'].length : 0),
                                        currentlyAdded: productDetails
                                    });
                                    this._cartService.getGenericCartSession.itemsList[index].productQuantity = updatedCartItemCount;
                                    this._cartService.getGenericCartSession.itemsList[index]['message'] = "Cart quantity updated successfully";
                                    this._tms.show({ type: 'success', text: this._cartService.getGenericCartSession.itemsList[index]['message'] });
                                } else {
                                    this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                                }
                            } else {
                                this._tms.show(('Product already added'));
                            }
                        }
                    });
                } else {
                    this._cartService.getGenericCartSession.itemsList[index].productQuantity = +currentItemCount;
                    this._tms.show({ type: 'error', text: productDetails.quantityAvailable + ' is the maximum quantity available.' });
                }
            } else {
                this._tms.show('Product does not exist');
            }
            this._globalLoaderService.setLoaderState(false);
        }, error => {}, () => {
            this._globalLoaderService.setLoaderState(false);
        });        
    }

    // check if the product quantity is available
    isQuantityAvailable(updatedQuantity, productPriceQuantity, index) {
        if (updatedQuantity > productPriceQuantity.quantityAvailable) {
            this._globalLoaderService.setLoaderState(false);
            this._cartService.getGenericCartSession.itemsList[index]['message'] = productPriceQuantity.quantityAvailable + ' is the maximum quantity available.';
            this._tms.show({ type: 'success', text: this._cartService.getGenericCartSession.itemsList[index]['message'] });
            return { status: false, message: "Quantity not available" };

        }
        else if (updatedQuantity < productPriceQuantity.moq) {

            this._globalLoaderService.setLoaderState(false);
            this._cartService.getGenericCartSession.itemsList[index]['message'] = "Minimum quantity is " + productPriceQuantity.moq;
            // this.showPopup(index);
            if (this.removePopup == false) {
                this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });
            }
            return { status: false, message: "Minimum quantity is " + productPriceQuantity.moq };
        }
        else {
            let remainder = (updatedQuantity - productPriceQuantity.moq) % productPriceQuantity.incrementUnit;
            if (remainder > 0) {
                this._globalLoaderService.setLoaderState(false);
                this._cartService.getGenericCartSession.itemsList[index]['message'] = "Incremental Count not matched";
                this._tms.show({ type: 'success', text: this._cartService.getGenericCartSession.itemsList[index]['message'] });
                // alert("Incremental Count not matched");
                return { status: false, message: "Incremental Count not matched" };
            } else {
                let bulkPrice = null;
                let bulkPriceWithoutTax = null;
                let bulkPricesWithInida: Array<any> = [];
                if (productPriceQuantity['bulkPrices'] && productPriceQuantity['bulkPrices']['india'])
                    bulkPricesWithInida = productPriceQuantity['bulkPrices']['india'];


                if (bulkPricesWithInida && bulkPricesWithInida !== null && bulkPricesWithInida !== undefined && bulkPricesWithInida.length > 0) {
                    let isvalid: boolean = true;

                    let bulkPrices: Array<any> = productPriceQuantity['bulkPrices']['india'];
                    bulkPrices.forEach((element, index) => {
                        if (!element.active) {
                            bulkPrices.splice(index, 1);
                        }
                    })
                    let minQty = 0;
                    if (bulkPrices.length > 0) {
                        minQty = bulkPrices[0].minQty
                    }
                    bulkPrices.forEach((element, bindex) => {
                        if (productPriceQuantity['moq'] == minQty || !isvalid) {
                            isvalid = false;
                            element.minQty = element.minQty + 1;

                            element.maxQty = element.maxQty + 1;
                        }
                        if (isvalid && productPriceQuantity['moq'] > minQty && productPriceQuantity['moq'] > 1) {

                            element.minQty = element.minQty + productPriceQuantity['moq'];

                            element.maxQty = element.maxQty + productPriceQuantity['moq'];

                        }


                    });

                    bulkPrices.forEach((element, indexBulk) => {
                        if (element.minQty <= updatedQuantity && updatedQuantity <= element.maxQty) {

                            bulkPrice = element.bulkSellingPrice;
                            bulkPriceWithoutTax = element.bulkSPWithoutTax;


                        }
                        if (bulkPrices.length - 1 === indexBulk && updatedQuantity >= element.maxQty) {

                            bulkPrice = element.bulkSellingPrice;
                            bulkPriceWithoutTax = element.bulkSPWithoutTax;

                        }


                    });
                }

                this._cartService.getGenericCartSession.itemsList[index]['bulkPrice'] = bulkPrice;
                this._cartService.getGenericCartSession.itemsList[index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;
                this._cartService.getGenericCartSession.itemsList[index]['message'] = "Cart quantity updated successfully";
                // 
                const cartSession = this._cartService.getGenericCartSession;
                cartSession['itemsList'][index]['bulkPrice'] = bulkPrice;
                cartSession['itemsList'][index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;

                this._cartService.setGenericCartSession(cartSession);
                return { status: true, message: "Cart quantity updated successfully", items: this._cartService.getGenericCartSession.itemsList };

            }
        }
    }

    // make cosmetic changes after deleting an item from cart
    deleteProduct(e) {
        e.preventDefault();
        e.stopPropagation();
        this._globalLoaderService.setLoaderState(true);
        this._cartService.updateCartAfterRemovingItem(this.removeIndex);
        this.removePopup = false;
        this.validateCart();
        // Push data to data layer
        this.pushDataToDatalayer(this.removeIndex);
        this.sendCritioData();
    }


    // get shipping charges of each item in cart
    getShippingCharges(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
        return this.dataService.callRestful("POST", url, { body: obj }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    // redirect to product page 
    redirectToProductURL(url) {
        if (this.moduleName == 'QUICKORDER') {
            this._commonService.setSectionClickInformation('cart', 'pdp');
            this._router.navigateByUrl('/' + url);
        }
        return false;
    }

    pushDataToDatalayer(index) {
        if (!this._cartService.getGenericCartSession["itemsList"][index]) return;
        var taxonomy = this._cartService.getGenericCartSession["itemsList"][index]['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "remove_from_cart",
            product_name: this._cartService.getGenericCartSession["itemsList"][index]['productName'],
            msn: this._cartService.getGenericCartSession["itemsList"][index]['productId'],
            brand: this._cartService.getGenericCartSession["itemsList"][index]['brandName'],
            price: this._cartService.getGenericCartSession["itemsList"][index]['totalPayableAmount'],
            quantity: this._cartService.getGenericCartSession["itemsList"][index]['productQuantity'],
            channel: "Cart",
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            page_type: "Cart"
        }
        this.dataService.sendMessage(trackingData);
        dataLayer.push({
            'event': 'removeFromCart',
            'ecommerce': {
                'remove': {
                    'products': [{
                        'name': this._cartService.getGenericCartSession["itemsList"][index]['productName'],
                        'id': this._cartService.getGenericCartSession["itemsList"][index]['productId'],
                        'price': this._cartService.getGenericCartSession["itemsList"][index]['totalPayableAmount'],
                        'variant': '',
                        'quantity': this._cartService.getGenericCartSession["itemsList"][index]['productQuantity'],
                        'prodImg': this._cartService.getGenericCartSession["itemsList"][index]['productImg']
                    }]
                }
            },
        });
    }

    sendCritioData() {

        let eventData = {
            'prodId': '',
            'prodPrice': 0,
            'prodQuantity': 0,
            'prodImage': '',
            'prodName': '',
            'prodURL': ''
        };
        
            // console.log('trigger3');
            let criteoItem = [];
            let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
            for (let p = 0; p < this._cartService.getGenericCartSession["itemsList"].length; p++) {

                let price = this._cartService.getGenericCartSession["itemsList"][p]['productUnitPrice'];
                if (this._cartService.getGenericCartSession["itemsList"][p]['bulkPrice'] != '' && this._cartService.getGenericCartSession["itemsList"][p]['bulkPrice'] != null) {
                    price = this._cartService.getGenericCartSession["itemsList"][p]['bulkPrice'];
                }

                criteoItem.push({ name: this._cartService.getGenericCartSession["itemsList"][p]['productName'], id: this._cartService.getGenericCartSession["itemsList"][p]['productId'], price: this._cartService.getGenericCartSession["itemsList"][p]['productUnitPrice'], quantity: this._cartService.getGenericCartSession["itemsList"][p]['productQuantity'], image: this._cartService.getGenericCartSession["itemsList"][p]['productImg'], url: CONSTANTS.PROD + '/' + this._cartService.getGenericCartSession["itemsList"][p]['productUrl'] });
                eventData['prodId'] = this._cartService.getGenericCartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
                eventData['prodPrice'] = this._cartService.getGenericCartSession["itemsList"][p]['productUnitPrice'] * this._cartService.getGenericCartSession["itemsList"][p]['productQuantity'] + eventData['prodPrice'];
                eventData['prodQuantity'] = this._cartService.getGenericCartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
                eventData['prodImage'] = this._cartService.getGenericCartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
                eventData['prodName'] = this._cartService.getGenericCartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
                eventData['prodURL'] = this._cartService.getGenericCartSession["itemsList"][p]['productUrl'] + ', ' + eventData['prodURL'];
                taxo1 = this._cartService.getGenericCartSession["itemsList"][p]['taxonomyCode'].split("/")[0] + '|' + taxo1;
                taxo2 = this._cartService.getGenericCartSession["itemsList"][p]['taxonomyCode'].split("/")[1] + '|' + taxo2;
                taxo3 = this._cartService.getGenericCartSession["itemsList"][p]['taxonomyCode'].split("/")[2] + '|' + taxo3;
                productList = this._cartService.getGenericCartSession["itemsList"][p]['productId'] + '|' + productList;
                brandList = this._cartService.getGenericCartSession["itemsList"][p]['brandName'] ? this._cartService.getGenericCartSession["itemsList"][p]['brandName'] + '|' + brandList : '';
                productPriceList = price + '|' + productPriceList;
                shippingList = this._cartService.getGenericCartSession["itemsList"][p]['shippingCharges'] + '|' + shippingList;
                couponDiscountList = this._cartService.getGenericCartSession["itemsList"][p]['offer'] ? this._cartService.getGenericCartSession["itemsList"][p]['offer'] + '|' + couponDiscountList : '';
                quantityList = this._cartService.getGenericCartSession["itemsList"][p]['productQuantity'] + '|' + quantityList;
                totalDiscount = this._cartService.getGenericCartSession["itemsList"][p]['offer'] + totalDiscount;
                totalQuantity = this._cartService.getGenericCartSession["itemsList"][p]['productQuantity'] + totalQuantity;
                totalPrice = (price * this._cartService.getGenericCartSession["itemsList"][p]['productQuantity']) + totalPrice;
                totalShipping = this._cartService.getGenericCartSession["itemsList"][p]['shippingCharges'] + totalShipping;
            }
            let user = this.localStorageService.retrieve('user');

            /*Start Criteo DataLayer Tags */
            dataLayer.push({
                'event': 'viewBasket',
                'email': (user && user.email) ? user.email : '',
                'currency': 'INR',
                'productBasketProducts': criteoItem,
                'eventData': eventData
            });
            /*End Criteo DataLayer Tags */
    }

    sendAdobeAnalyticsData() {
        let user = this.localStorageService.retrieve('user');
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
        if (_satellite) {
            _satellite.track("genericClick");
        }
        /*End Adobe Analytics Tags */
    }
}
