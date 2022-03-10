import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { CONSTANTS } from '@app/config/constants';
import { map, catchError } from 'rxjs/operators';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TransferState } from '@angular/platform-browser';
import { ViewChild, Renderer2, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Component, Input, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastMessageService } from '@modules/toastMessage/toast-message.service';
import { ProductService } from '@utils/services/product.service';
import { CartService } from '@utils/services/cart.service';
import { LocalAuthService } from '@utils/services/auth.service';
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
    constructor(
        private _location: Location,
        public _state: GlobalState,
        public meta: Meta,
        public pageTitle: Title,
        @Inject(DOCUMENT) private _document,
        private _renderer2: Renderer2,
        private _injector: Injector,
        public objectToArray: ObjectToArray,
        private _tState: TransferState,
        public footerService: FooterService,
        private _cfr: ComponentFactoryResolver,
        public activatedRoute: ActivatedRoute,
        private _loader: GlobalLoaderService,
        public dataService: DataService,
        public commonService: CommonService,
        public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService,
        public _router: Router,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _tms: ToastMessageService,
        private _productService: ProductService,
    ) {
    }

    ngOnInit() {
        this.cartSession = this._cartService.getCartSession();
    }

    updateCartItemQuantity(quantityTarget, index, action, buyNow = false) {
        if (quantityTarget < 1) return;

        let updatedCartItemCount = this.cartSession.itemsList[index].productQuantity;
        let incrementOrDecrementBy = 0;
        
        if (action === 'increment') {
            incrementOrDecrementBy = 1;
            updatedCartItemCount = this.cartSession.itemsList[index].productQuantity + 1;
        } else if (action === 'decrement') {
            if (quantityTarget < 2) return;
            incrementOrDecrementBy = -1;
            updatedCartItemCount = this.cartSession.itemsList[index].productQuantity - 1;
        }
        this._loader.setLoaderState(true);

        const productMsnId = this.cartSession.itemsList[index].productId;
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
                    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
                        if (!result && this._cartService.buyNowSessionDetails) {
                            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                        } else {
                            if (result) {
                                if (!buyNow) {
                                    this._cartService.setCartSession(result);
                                    this._cartService.cart.next({
                                        count: result['noOfItems'] || (result['itemsList'] ? result['itemsList'].length : 0),
                                        currentlyAdded: productDetails
                                    });
                                    this.cartSession.itemsList[index].productQuantity = updatedCartItemCount;
                                    this.cartSession.itemsList[index]['message'] = "Cart quantity updated successfully";
                                    this._tms.show({ type: 'success', text: this.cartSession.itemsList[index]['message'] });
                                } else {
                                    this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                                }
                            } else {
                                this._tms.show(('Product already added'));
                            }
                        }
                    });
                } else {
                    this._tms.show({ type: 'error', text: productDetails.quantityAvailable + ' is the maximum quantity available.' });
                }
            } else {
                this._tms.show('Product does not exist');
            }
            this._loader.setLoaderState(false);
        }, error => {}, () => {
            this._loader.setLoaderState(false);
        });        
    }

    isQuantityAvailable(updatedQuantity, productPriceQuantity, index) {
        if (updatedQuantity > productPriceQuantity.quantityAvailable) {
            this._loader.setLoaderState(false);
            this.cartSession.itemsList[index]['message'] = productPriceQuantity.quantityAvailable + ' is the maximum quantity available.';
            this._tms.show({ type: 'success', text: this.cartSession.itemsList[index]['message'] });
            return { status: false, message: "Quantity not available" };

        }
        else if (updatedQuantity < productPriceQuantity.moq) {

            this._loader.setLoaderState(false);
            this.cartSession.itemsList[index]['message'] = "Minimum quantity is " + productPriceQuantity.moq;
            // this.showPopup(index);
            if (this.removePopup == false) {
                this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });
            }
            return { status: false, message: "Minimum quantity is " + productPriceQuantity.moq };
        }
        else {
            let remainder = (updatedQuantity - productPriceQuantity.moq) % productPriceQuantity.incrementUnit;
            if (remainder > 0) {
                this._loader.setLoaderState(false);
                this.cartSession.itemsList[index]['message'] = "Incremental Count not matched";
                this._tms.show({ type: 'success', text: this.cartSession.itemsList[index]['message'] });
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

                this.cartSession.itemsList[index]['bulkPrice'] = bulkPrice;
                this.cartSession.itemsList[index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;
                this.cartSession.itemsList[index]['message'] = "Cart quantity updated successfully";
                // 
                const cartSession = this._cartService.getCartSession();
                cartSession['itemsList'][index]['bulkPrice'] = bulkPrice;
                cartSession['itemsList'][index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;

                this._cartService.setCartSession(cartSession);
                return { status: true, message: "Cart quantity updated successfully", items: this.cartSession.itemsList };

            }
        }
    }

    removePopup: boolean = false;
    cartSession;
    deleteProduct(index) {
        this._loader.setLoaderState(true);

        this.cartSession = this._cartService.getCartSession();

        // Push data to data layer
        this.pushDataToDatalayer(index);

        this.removePopup = false;

        this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });

        this.sendCritioData();

        this.updateAfterDelete(index);
    }

    updateAfterDelete(index) {
        let cartSessions = this._cartService.getCartSession();
        let itemsList = cartSessions["itemsList"];
        const removedItem = itemsList.splice(index, 1);
        this.removePopup = false;
        this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });
        cartSessions["itemsList"] = itemsList;
        cartSessions = this._cartService.updateCart(cartSessions);


        this._cartService.setCartSession(cartSessions);

        if (this.cartSession['itemsList'] !== null && this.cartSession['itemsList']) {
            var totQuantity = 0;
            var trackData = {
                event_type: "click",
                page_type: this._router.url == "/quickorder" ? "Cart" : "Checkout",
                label: "cart_updated",
                channel: this._router.url == "/quickorder" ? "Cart" : "Checkout",
                price: this.cartSession["cart"]["totalPayableAmount"] ? this.cartSession["cart"]["totalPayableAmount"].toString() : "0",
                quantity: this.cartSession["itemsList"].map(item => {
                    return totQuantity = totQuantity + item.productQuantity;
                })[this.cartSession["itemsList"].length - 1],
                shipping: parseFloat(this.cartSession["shippingCharges"]),
                itemList: this.cartSession["itemsList"].map(item => {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    }
                })
            }
            this.dataService.sendMessage(trackData);
        }
        if (!this.commonService.isServer) {
            if (this.localStorageService.retrieve('user')) {
                let userData = this.localStorageService.retrieve('user');
                if (userData.authenticated == "true") {
                    if (cartSessions['offersList'] && cartSessions['offersList'].length > 0) {
                        let reqobj = {
                            "shoppingCartDto": cartSessions
                        }
                    }
                    else {
                        this._loader.setLoaderState(false);
                        this._cartService.extra.next({ errorMessage: null });
                        this.updateDeleteCart(cartSessions);
                    }
                }
                if (userData.authenticated == "false") {
                    this._loader.setLoaderState(false);
                    this.updateDeleteCart(cartSessions);
                }
            }
            else {
                this._loader.setLoaderState(false);
                this.updateDeleteCart(cartSessions);
            }
        }
    }

    updateDeleteCart(cartSessions, extraData?) {
        if (!this.commonService.isServer) {
            if (!this._loader.getLoaderState()) {
                this._loader.setLoaderState(true);
            }

            let sro = this._cartService.getShippingObj(cartSessions);
            this.getShippingCharges(sro).subscribe(
                res => {
                    if (res['statusCode'] == 200) {
                        cartSessions['cart']['shippingCharges'] = res['data']['totalShippingAmount'];
                        let productShippingCharge = res['data']['itemShippingAmount'];

                        for (let i = 0; i < cartSessions['itemsList'].length; i++) {
                            cartSessions['itemsList'][i]['shippingCharges'] = res['data']['itemShippingAmount'][cartSessions['itemsList'][i]['productId']];
                        }

                        this._cartService.updateCartSession(cartSessions).subscribe((data) => {
                            this._loader.setLoaderState(false);
                            if (extraData && extraData['showMessage']) {
                                this._tms.show(extraData['showMessage']);
                            }
                            let res = data;
                            if (res && res['cart'] && res['itemsList'] && Array.isArray(res['itemsList'])) {
                                let itemsList = res['itemsList'];
                                // console.log('trigger6');
                                itemsList.forEach((element, index) => {
                                    for (let key in productShippingCharge) {
                                        if (key == element['productId']) {
                                            itemsList[index]['shippingCharges'] = productShippingCharge[key];
                                        }
                                    }
                                })
                                this.cartSession = res;
                                this._cartService.cart.next({ count: (res.noOfItems || this.cartSession.itemsList.length), currentlyAdded: null });
                                res["itemsList"] = itemsList;
                                this._cartService.setCartSession(res);
                                this._cartService.orderSummary.next(this.cartSession);

                                /* navigate to quick order page, if no item is present in itemlist */
                                if (itemsList.length == 0 && this._router.url.indexOf('/checkout') != -1) {
                                    this._location.replaceState('/'); // clears browser history so they can't navigate with back button
                                    this._router.navigateByUrl('/quickorder');
                                }
                            }
                            else {
                            }

                        }, err => {
                        });
                    }
                }

            );
        }
    }

    getShippingCharges(obj) {
        // console.trace('getShippingCharges cart comp');
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
        return this.dataService.callRestful("POST", url, { body: obj }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    redirectToProductURL(url) {
        this.commonService.setSectionClickInformation('cart', 'pdp');
        this._router.navigateByUrl('/' + url);
        return false;
    }

    pushDataToDatalayer(index) {
        var taxonomy = this.cartSession["itemsList"][index]['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "remove_from_cart",
            product_name: this.cartSession["itemsList"][index]['productName'],
            msn: this.cartSession["itemsList"][index]['productId'],
            brand: this.cartSession["itemsList"][index]['brandName'],
            price: this.cartSession["itemsList"][index]['totalPayableAmount'],
            quantity: this.cartSession["itemsList"][index]['productQuantity'],
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
                        'name': this.cartSession["itemsList"][index]['productName'],
                        'id': this.cartSession["itemsList"][index]['productId'],
                        'price': this.cartSession["itemsList"][index]['totalPayableAmount'],
                        'variant': '',
                        'quantity': this.cartSession["itemsList"][index]['productQuantity'],
                        'prodImg': this.cartSession["itemsList"][index]['productImg']
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
            for (let p = 0; p < this.cartSession["itemsList"].length; p++) {

                let price = this.cartSession["itemsList"][p]['productUnitPrice'];
                if (this.cartSession["itemsList"][p]['bulkPrice'] != '' && this.cartSession["itemsList"][p]['bulkPrice'] != null) {
                    price = this.cartSession["itemsList"][p]['bulkPrice'];
                }

                criteoItem.push({ name: this.cartSession["itemsList"][p]['productName'], id: this.cartSession["itemsList"][p]['productId'], price: this.cartSession["itemsList"][p]['productUnitPrice'], quantity: this.cartSession["itemsList"][p]['productQuantity'], image: this.cartSession["itemsList"][p]['productImg'], url: CONSTANTS.PROD + '/' + this.cartSession["itemsList"][p]['productUrl'] });
                eventData['prodId'] = this.cartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
                eventData['prodPrice'] = this.cartSession["itemsList"][p]['productUnitPrice'] * this.cartSession["itemsList"][p]['productQuantity'] + eventData['prodPrice'];
                eventData['prodQuantity'] = this.cartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
                eventData['prodImage'] = this.cartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
                eventData['prodName'] = this.cartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
                eventData['prodURL'] = this.cartSession["itemsList"][p]['productUrl'] + ', ' + eventData['prodURL'];
                taxo1 = this.cartSession["itemsList"][p]['taxonomyCode'].split("/")[0] + '|' + taxo1;
                taxo2 = this.cartSession["itemsList"][p]['taxonomyCode'].split("/")[1] + '|' + taxo2;
                taxo3 = this.cartSession["itemsList"][p]['taxonomyCode'].split("/")[2] + '|' + taxo3;
                productList = this.cartSession["itemsList"][p]['productId'] + '|' + productList;
                brandList = this.cartSession["itemsList"][p]['brandName'] ? this.cartSession["itemsList"][p]['brandName'] + '|' + brandList : '';
                productPriceList = price + '|' + productPriceList;
                shippingList = this.cartSession["itemsList"][p]['shippingCharges'] + '|' + shippingList;
                couponDiscountList = this.cartSession["itemsList"][p]['offer'] ? this.cartSession["itemsList"][p]['offer'] + '|' + couponDiscountList : '';
                quantityList = this.cartSession["itemsList"][p]['productQuantity'] + '|' + quantityList;
                totalDiscount = this.cartSession["itemsList"][p]['offer'] + totalDiscount;
                totalQuantity = this.cartSession["itemsList"][p]['productQuantity'] + totalQuantity;
                totalPrice = (price * this.cartSession["itemsList"][p]['productQuantity']) + totalPrice;
                totalShipping = this.cartSession["itemsList"][p]['shippingCharges'] + totalShipping;
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
