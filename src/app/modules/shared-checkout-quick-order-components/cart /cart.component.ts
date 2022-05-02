import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ToastMessageService } from '@modules/toastMessage/toast-message.service';
import { GlobalState } from '@utils/global.state';
import { ObjectToArray } from '@utils/pipes/object-to-array.pipe';
import { CartService } from '@utils/services/cart.service';
import { CheckoutService } from '@utils/services/checkout.service';
import { CommonService } from '@utils/services/common.service';
import { DataService } from '@utils/services/data.service';
import { FooterService } from '@utils/services/footer.service';
import { GlobalLoaderService } from '@utils/services/global-loader.service';
import { ProductService } from '@utils/services/product.service';
import { LocalStorageService } from 'ngx-webstorage';
import { of, Subscription, forkJoin } from 'rxjs';
import { catchError, concatMap, map, mergeMap, switchMap } from 'rxjs/operators';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

declare let dataLayer;
//declare var digitalData: {};
//declare let _satellite;


@Component({
    selector: 'cart',
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss'],
})

export class CartComponent
{
    removePopup: boolean = false;
    removeIndex = 0;
    @Input() moduleName: 'CHECKOUT' | 'QUICKORDER' = 'QUICKORDER';
    cartSubscription: Subscription;
    pageEvent = "genericPageLoad";
    traceProductDetails = {};//trace for any product changes'

    constructor(
        public _state: GlobalState, public meta: Meta, public pageTitle: Title,
        public objectToArray: ObjectToArray, public footerService: FooterService, public activatedRoute: ActivatedRoute,
        public dataService: DataService, public _commonService: CommonService, public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService, public _router: Router, public _cartService: CartService,
        private _tms: ToastMessageService, private _productService: ProductService, private _globalLoaderService: GlobalLoaderService,
        private _globalAnalyticsService: GlobalAnalyticsService
    ) { }

    ngOnInit()
    {
        // Get latest cart from API
        this._commonService.updateUserSession();
        this.loadCartDataFromAPI();
    }

    // Function to get and set the latest cart
    loadCartDataFromAPI()
    {
        this._globalLoaderService.setLoaderState(true);
        this.cartSubscription = this._cartService.getCartUpdatesChanges().pipe(
            map((cart: any) =>
            {
                const delay = this._router.url.includes("quickorder") ? 0 : 500;
                this._cartService.verifyAndUpdateNotfications(delay);
                this.sendCritieoDataonView(this._cartService.getGenericCartSession);
                this.sendAdobeAnalyticsData(this.pageEvent);
                this.pageEvent = "genericClick";
                return cart;
            }),
            concatMap((res) => this._cartService.getShippingAndUpdateCartSession(res))).subscribe(
                (result) =>
                {
                    this._globalLoaderService.setLoaderState(false);
                });
    }

    // Get shipping value of each product items in cart
    // getShippingValue(cartSession)
    // {
    //     let sro = this._cartService.getShippingObj(cartSession);
    //     return this._cartService.getShippingValue(sro)
    //         .pipe(
    //             map((sv: any) =>
    //             {
    //                 if (sv && sv['status'] && sv['statusCode'] == 200) {
    //                     cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
    //                     if (sv['data']['totalShippingAmount'] != undefined && sv['data']['totalShippingAmount'] != null) {
    //                         let itemsList = cartSession['itemsList'];
    //                         for (let i = 0; i < itemsList.length; i++) {
    //                             cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
    //                         }
    //                     }
    //                 }
    //                 return cartSession;
    //             })
    //         );
    // }

    // To increment decrement and manually update of cart item quantity
    // updateCartItemQuantity(quantityTarget, index, action, buyNow = false, showToastMsg?: boolean)
    // {
    //     console.log(this._cartService.getGenericCartSession.itemsList[index])
    //     const MOQ = this._cartService.getGenericCartSession.itemsList[index].moq || 1;
    //     let updatedCartItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity;
    //     let incrementOrDecrementBy = 0;
    //     if (action === 'increment') {
    //         incrementOrDecrementBy = 1;
    //         updatedCartItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity + 1;
    //         this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updatedCartItemCount, index, "increment_quantity");
    //     } else if (action === 'decrement') {
    //         const DECREMENTED_QTY = quantityTarget ? parseInt(quantityTarget) - 1 : 1;
    //         if (DECREMENTED_QTY < MOQ) {
    //             this.removePopup = true;
    //             this.removeIndex = index;
    //             return;
    //         }
    //         if (quantityTarget < 2) {
    //             this.removeIndex = index;
    //             this.removePopup = true;
    //             return;
    //         };
    //         incrementOrDecrementBy = -1;
    //         updatedCartItemCount = this._cartService.getGenericCartSession.itemsList[index].productQuantity - 1;
    //         this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updatedCartItemCount, index, "decrement_quantity");
    //     }
    //     if (updatedCartItemCount < 0 || quantityTarget < 0 || isNaN(parseInt(quantityTarget))) {
    //         this.removeIndex = index;
    //         this.removePopup = true;
    //         this.updateCartItemQuantity(this._cartService.getGenericCartSession.itemsList[index].moq, index, 'update', buyNow, true);
    //         return;
    //     };
    //     if (action === 'update') {
    //         this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updatedCartItemCount, index, "quantity_updated");
    //         if (quantityTarget < this._cartService.getGenericCartSession.itemsList[index].moq) {
    //             this._cartService.getGenericCartSession.itemsList[index].productQuantity = this._cartService.getGenericCartSession.itemsList[index].moq;
    //             this.removeIndex = index;
    //             this.removePopup = true;
    //             this._tms.show({
    //                 type: 'error',
    //                 text: 'Minimum qty can be ordered is: ' + this._cartService.getGenericCartSession.itemsList[index].moq
    //             });
    //             this.updateCartItemQuantity(this._cartService.getGenericCartSession.itemsList[index].moq, index, 'update', buyNow, true);
    //             return;
    //         }
    //     }
    //     this._globalLoaderService.setLoaderState(true);
    //     const productMsnId = this._cartService.getGenericCartSession.itemsList[index].productId;
    //     this._productService.getProductGroupDetails(productMsnId).pipe(
    //         map(productRawData =>
    //         {
    //             if (productRawData['productBO']) {
    //                 let productData = this._cartService.getAddToCartProductItemRequest({ productGroupData: productRawData['productBO'], buyNow });
    //                 if (action === 'update') {
    //                     updatedCartItemCount = +quantityTarget;
    //                     productData.isProductUpdate = quantityTarget;
    //                 }
    //                 return productData;
    //             } else {
    //                 return null;
    //             }
    //         })).subscribe((productDetails: AddToCartProductSchema) =>
    //         {
    //             if (productDetails) {
    //                 if (productDetails['productQuantity'] && (productDetails['quantityAvailable'] < productDetails['productQuantity'])) {
    //                     this._tms.show({ type: 'error', text: "Quantity not available" });
    //                     return;
    //                 }
    //                 productDetails.productQuantity = incrementOrDecrementBy;
    //                 let isQua = this.isQuantityAvailable(updatedCartItemCount, productDetails, index);
    //                 if (isQua["status"]) {
    //                     this.updateCartAndRemoveNotfication(productMsnId, buyNow, productDetails, index, updatedCartItemCount, showToastMsg);
    //                 } else {
    //                     this.updateCartItemQuantity(productDetails.quantityAvailable, index, 'update', buyNow, true);
    //                     this._tms.show({ type: 'error', text: productDetails.quantityAvailable + ' is the maximum quantity available.' });
    //                 }
    //             } else {
    //                 this._tms.show('Product does not exist');
    //             }
    //             this._globalLoaderService.setLoaderState(false);
    //         }, error => { }, () =>
    //         {
    //             this._globalLoaderService.setLoaderState(false);
    //         });
    // }

    removeItemFromCart(itemIndex)
    {
        this.removePopup = true;
        this.removeIndex = itemIndex;
    }

    // updateCartAndRemoveNotfication(msn, buyNow, productDetails, index, updatedCartItemCount, showToastMsg?: boolean)
    // {
    //     const setValidationMessages$ = this._cartService.removeNotificationsByMsns([msn], true);
    //     const addToCart$ = this._cartService.addToCart({ buyNow, productDetails }).pipe(
    //         mergeMap((data: any) =>
    //         {
    //             if (this._commonService.isServer) {
    //                 return of(null);
    //             }
    //             /**
    //              * return cartSession, if sessionId mis match
    //              */
    //             if (data['statusCode'] !== undefined && data['statusCode'] === 202) {
    //                 return of(data);
    //             }
    //             return of(data);
    //         }),
    //     );
    //     forkJoin([setValidationMessages$, addToCart$]).subscribe(responses =>
    //     {
    //         const addToCartResponse = responses[1];
    //         if (!addToCartResponse && this._cartService.buyNowSessionDetails) {
    //             this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
    //         } else {
    //             if (addToCartResponse) {
    //                 if (!buyNow) {
    //                     this._cartService.setGenericCartSession(addToCartResponse);
    //                     this._cartService.publishCartUpdateChange(this._cartService.getGenericCartSession);
    //                     const count = { count: (addToCartResponse['itemsList'] ? addToCartResponse['itemsList'].length : 0), currentlyAdded: productDetails }
    //                     this._cartService.cart.next(count);
    //                     this._cartService.getGenericCartSession.itemsList[index].productQuantity = updatedCartItemCount;
    //                     if (!showToastMsg) {
    //                         this._tms.show({ type: 'success', text: "Cart quantity updated successfully" });
    //                     }
    //                     this.sendMessageAfterCartAction(addToCartResponse);
    //                 } else {
    //                     this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
    //                 }
    //             } else {
    //                 this._tms.show(('Product already added'));
    //             }
    //         }
    //     });
    // }

    // check if the product quantity is available
    // isQuantityAvailable(updatedQuantity, productPriceQuantity, index)
    // {
    //     if (updatedQuantity > productPriceQuantity.quantityAvailable) {
    //         this._globalLoaderService.setLoaderState(false);
    //         this._cartService.getGenericCartSession.itemsList[index]['message'] = productPriceQuantity.quantityAvailable + ' is the maximum quantity available.';
    //         this._tms.show({ type: 'success', text: this._cartService.getGenericCartSession.itemsList[index]['message'] });
    //         return { status: false, message: "Quantity not available" };

    //     }
    //     else if (updatedQuantity < productPriceQuantity.moq) {

    //         this._globalLoaderService.setLoaderState(false);
    //         this._cartService.getGenericCartSession.itemsList[index]['message'] = "Minimum quantity is " + productPriceQuantity.moq;
    //         // this.showPopup(index);
    //         if (this.removePopup == false) {
    //             this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });
    //         }
    //         return { status: false, message: "Minimum quantity is " + productPriceQuantity.moq };
    //     }
    //     else {
    //         let remainder = (updatedQuantity - productPriceQuantity.moq) % productPriceQuantity.incrementUnit;
    //         if (remainder > 0) {
    //             this._globalLoaderService.setLoaderState(false);
    //             this._cartService.getGenericCartSession.itemsList[index]['message'] = "Incremental Count not matched";
    //             this._tms.show({ type: 'success', text: this._cartService.getGenericCartSession.itemsList[index]['message'] });
    //             // alert("Incremental Count not matched");
    //             return { status: false, message: "Incremental Count not matched" };
    //         } else {
    //             let bulkPrice = null;
    //             let bulkPriceWithoutTax = null;
    //             let bulkPricesWithInida: Array<any> = [];
    //             if (productPriceQuantity['bulkPrices'] && productPriceQuantity['bulkPrices']['india'])
    //                 bulkPricesWithInida = productPriceQuantity['bulkPrices']['india'];
    //             if (bulkPricesWithInida && bulkPricesWithInida !== null && bulkPricesWithInida !== undefined && bulkPricesWithInida.length > 0) {
    //                 let isvalid: boolean = true;

    //                 let bulkPrices: Array<any> = productPriceQuantity['bulkPrices']['india'];
    //                 bulkPrices.forEach((element, index) =>
    //                 {
    //                     if (!element.active) {
    //                         bulkPrices.splice(index, 1);
    //                     }
    //                 })
    //                 let minQty = 0;
    //                 if (bulkPrices.length > 0) {
    //                     minQty = bulkPrices[0].minQty
    //                 }
    //                 bulkPrices.forEach((element, bindex) =>
    //                 {
    //                     if (productPriceQuantity['moq'] == minQty || !isvalid) {
    //                         isvalid = false;
    //                         element.minQty = element.minQty + 1;
    //                         element.maxQty = element.maxQty + 1;
    //                     }
    //                     if (isvalid && productPriceQuantity['moq'] > minQty && productPriceQuantity['moq'] > 1) {
    //                         element.minQty = element.minQty + productPriceQuantity['moq'];
    //                         element.maxQty = element.maxQty + productPriceQuantity['moq'];
    //                     }
    //                 });
    //                 bulkPrices.forEach((element, indexBulk) =>
    //                 {
    //                     if (element.minQty <= updatedQuantity && updatedQuantity <= element.maxQty) {
    //                         bulkPrice = element.bulkSellingPrice;
    //                         bulkPriceWithoutTax = element.bulkSPWithoutTax;
    //                     }
    //                     if (bulkPrices.length - 1 === indexBulk && updatedQuantity >= element.maxQty) {
    //                         bulkPrice = element.bulkSellingPrice;
    //                         bulkPriceWithoutTax = element.bulkSPWithoutTax;
    //                     }
    //                 });
    //             }
    //             this._cartService.getGenericCartSession.itemsList[index]['bulkPrice'] = bulkPrice;
    //             this._cartService.getGenericCartSession.itemsList[index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;
    //             this._cartService.getGenericCartSession.itemsList[index]['message'] = "Cart quantity updated successfully";
    //             // 
    //             const cartSession = this._cartService.getGenericCartSession;
    //             cartSession['itemsList'][index]['bulkPrice'] = bulkPrice;
    //             cartSession['itemsList'][index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;
    //             this._cartService.setGenericCartSession(cartSession);
    //             return { status: true, message: "Cart quantity updated successfully", items: this._cartService.getGenericCartSession.itemsList };
    //         }
    //     }
    // }

    // make cosmetic changes after deleting an item from cart
    deleteProduct(e)
    {
        e.preventDefault();
        e.stopPropagation();
        this._globalLoaderService.setLoaderState(true);
        this.pushDataToDatalayerOnRemove(this.removeIndex);
        this._cartService.removeUnavailableItems([this._cartService.getGenericCartSession.itemsList[this.removeIndex]]);
        this.removePopup = false;
    }

    // get shipping charges of each item in cart
    // getShippingCharges(obj)
    // {
    //     let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
    //     return this.dataService.callRestful("POST", url, { body: obj }).pipe(
    //         catchError((res: HttpErrorResponse) =>
    //         {
    //             return of({ status: false, statusCode: res.status });
    //         })
    //     );
    // }

    // redirect to product page 
    redirectToProductURL(url)
    {
        if (this.moduleName == 'QUICKORDER') {
            this._commonService.setSectionClickInformation('cart', 'pdp');
            this._router.navigateByUrl('/' + url);
        }
        return false;
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
        let user = this.localStorageService.retrieve('user');
        let data = {
            'event': 'viewBasket',
            'email': (user && user.email) ? user.email : '',
            'currency': 'INR',
            'productBasketProducts': criteoItem,
            'eventData': eventData
        }
        this._globalAnalyticsService.sendGTMCall(data);
        /*End Criteo DataLayer Tags */
    }

    sendAdobeAnalyticsData(trackingname)
    {
        if (this._router.url !== '/quickorder') { return };
        let data = {};
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
        data["page"] = page;
        data["custData"] = custData;
        data["order"] = order;
        this._globalAnalyticsService.sendAdobeCall(data, trackingname);
        /*End Adobe Analytics Tags */
    }

    pushDataToDatalayerOnRemove(index)
    {
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
        this._globalAnalyticsService.sendToClicstreamViaSocket(trackingData);
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

    sendMessageOnQuantityChanges(cartSession, quantityTarget, index, label)
    {
        var taxonomy = cartSession["itemsList"][index]['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "quantity_updated",//quantity_updated, increment_quantity, decrement_quantity
            product_name: cartSession["itemsList"][index]['productName'],
            msn: cartSession["itemsList"][index]['productId'],
            brand: cartSession["itemsList"][index]['brandName'],
            price: cartSession["itemsList"][index]['totalPayableAmount'],
            quantity: parseInt(quantityTarget),
            channel: "Cart",
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            page_type: "Cart"
        }
        this._globalAnalyticsService.sendToClicstreamViaSocket(trackingData);
    }

    sendMessageAfterCartAction(cartSession)
    {
        if (cartSession['itemsList'] !== null && cartSession['itemsList']) {
            var totQuantity = 0;
            var trackData = {
                event_type: "click",
                page_type: this._router.url == "/quickorder" ? "Cart" : "Checkout",
                label: "cart_updated",
                channel: this._router.url == "/quickorder" ? "Cart" : "Checkout",
                price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "0",
                quantity: cartSession["itemsList"].map(item =>
                {
                    return totQuantity = totQuantity + item.productQuantity;
                })[cartSession["itemsList"].length - 1],
                shipping: parseFloat(cartSession["shippingCharges"]),
                itemList: cartSession["itemsList"].map(item =>
                {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    }
                })
            }
            this._globalAnalyticsService.sendToClicstreamViaSocket(trackData);
        }
    }

    //new implmentation
    handleItemQuantityChanges(itemIndex: number, action: string, value?)
    {
        const item = this._cartService.getGenericCartSession.itemsList[itemIndex];
        const currentQty = item.productQuantity;
        if (currentQty === "") { action = 'update';}
        const msn = item['productId'];
        const incrementUnit = item['incrementUnit'] || 1;
        let updateQtyTo = null;
        switch (action) {
            case 'increment': {
                updateQtyTo = currentQty + incrementUnit;
                this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updateQtyTo, itemIndex, "increment_quantity");
                break;
            }
            case 'decrement': {
                updateQtyTo = currentQty - incrementUnit;
                this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updateQtyTo, itemIndex, "increment_quantity");
                break;
            }
            case 'update': {
                updateQtyTo = value ? parseInt(value) : "";
                this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updateQtyTo, itemIndex, "quantity_updated");
                break;
            }
        }
        if (updateQtyTo < 1 || updateQtyTo === "") {
            const errorTxt = `${item.productName} cannot have invalid quantity.`;
            this._cartService.getGenericCartSession.itemsList[itemIndex]['productQuantity'] = updateQtyTo;
            this._tms.show({ type: 'error', text: errorTxt });
            return
        }
        if (this.traceProductDetails[msn])
        {
            this.verifyInUpdatedProductDetails(itemIndex, msn, parseInt(updateQtyTo));
            return;
        }
        this.verifyQuantityChangesByAPI(itemIndex, msn, parseInt(updateQtyTo));
    }

    verifyQuantityChangesByAPI(itemIndex, msn, newQty)
    {
        const buyNow = this._cartService.buyNow;
        this._productService.getProductGroupDetails(msn).pipe(
            map((response) =>
            {
                if (!response['productBO']) return null;
                let productData = this._cartService.getAddToCartProductItemRequest({ productGroupData: response['productBO'], buyNow });
                return productData;
            }),
            catchError((error) => { return null })
        ).subscribe((product) =>
        {
            if(!product){
                this._tms.show({ type: 'error', text: "Product does not exist" });
                return;
            }
            if (product['productQuantity'] && (product['quantityAvailable'] < newQty)) {
                this._tms.show({ type: 'error', text: "Quantity not available" });
                return;
            }
            this.traceProductDetails[msn] = product;
            this.verifyInUpdatedProductDetails(itemIndex, msn, newQty);
        })
    }

    verifyInUpdatedProductDetails(itemIndex, msn, newQty)
    {
        let productToUpdate = null;
        let bulkPriceMap = []
        productToUpdate = this.traceProductDetails[msn];
        const moq = productToUpdate['moq'];
        const available = productToUpdate['quantityAvailable'];
        if (newQty < moq) {
            this._globalLoaderService.setLoaderState(false);
            this._tms.show({ type: 'error', text: `Minimum qty can be ordered is: ${moq}` });
            return;
        }
        if (newQty > available) {
            this._globalLoaderService.setLoaderState(false);
            this._tms.show({ type: 'error', text: `Maximum qty can be ordered is: ${available}` });
            return;
        }
        if (productToUpdate['bulkPriceMap'] && productToUpdate['bulkPriceMap']['india'] && (productToUpdate['bulkPriceMap']['india'] as any[]).length) {
            bulkPriceMap = (productToUpdate['bulkPriceMap']['india'] as any[]).filter((bulk) =>
            {
                return bulk['active'] && newQty >= bulk['minQty'] && newQty <= bulk['maxQty']
            });
            if (bulkPriceMap.length) {
                this._cartService.getGenericCartSession.itemsList[itemIndex]['bulkPrice'] = bulkPriceMap[0]['bulkSellingPrice'];;
                this._cartService.getGenericCartSession.itemsList[itemIndex]['bulkPriceWithoutTax'] = bulkPriceMap[0]['bulkSPWithoutTax'];
            }
        }
        this.updateCart(itemIndex, msn , newQty)
    }

    updateCart(itemIndex, msn, newQty)
    {
        this._globalLoaderService.setLoaderState(true);
        const oldQty = this._cartService.getGenericCartSession.itemsList[itemIndex]['productQuantity'];
        this._cartService.getGenericCartSession.itemsList[itemIndex]['productQuantity'] = newQty;
        const setValidationMessages$ = this._cartService.removeNotificationsByMsns([msn], true);
        const newCartSession = JSON.parse(JSON.stringify(this._cartService.getGenericCartSession));
        const updateCart$ = this._cartService.updateCartSession(newCartSession).pipe(
            switchMap((newCartSession) =>
            {
                return this._cartService.verifyPromocode(newCartSession)
            }),
            switchMap((newCartSession) =>
            {
                return this._cartService.verifyShippingCharges(newCartSession)
            }));
        forkJoin([setValidationMessages$, updateCart$]).subscribe((responses)=>{
            this._globalLoaderService.setLoaderState(false);
            const cartSession = responses[1];
            if (cartSession){
                this._cartService.setGenericCartSession(cartSession);
                this._cartService.publishCartUpdateChange(this._cartService.getGenericCartSession);
                this._cartService.orderSummary.next(cartSession);
                this._tms.show({ type: 'success', text: "Cart quantity updated successfully" });
                this.sendMessageAfterCartAction(cartSession);
                return;
            }
            this._cartService.getGenericCartSession.itemsList[itemIndex]['productQuantity'] = oldQty;
            this._tms.show({ type: 'error', text: cartSession["message"] || "Cart quanity is not updated." });
        })
    }

    ngOnDestroy() { if (this.cartSubscription) this.cartSubscription.unsubscribe(); }
}
