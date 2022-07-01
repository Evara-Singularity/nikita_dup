import { Component, Input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
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
import { forkJoin, Subscription } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';

declare let dataLayer;
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
    noOfCartItems = 0;

    constructor(
        public _state: GlobalState, public meta: Meta, public pageTitle: Title,
        public objectToArray: ObjectToArray, public footerService: FooterService, public activatedRoute: ActivatedRoute,
        public dataService: DataService, public _commonService: CommonService, public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService, public _router: Router, public _cartService: CartService,
        private _tms: ToastMessageService, private _productService: ProductService, private _globalLoaderService: GlobalLoaderService,
        private _globalAnalyticsService: GlobalAnalyticsService,
        public _localAuthService: LocalAuthService
    ) { }

    ngOnInit()
    {
        // Get latest cart from API
        this._commonService.updateUserSession();
        if(this._commonService.isBrowser)
        {
            this.sendCriteoPageLoad();
            this.sendEmailGTMCall();
        }
        this.loadCartDataFromAPI();
        const cartSession = this._cartService.getCartSession();
        this.noOfCartItems = (cartSession['itemsList'] as any[]).length || 0;
    }

    // Function to get and set the latest cart
    loadCartDataFromAPI()
    {
        this._globalLoaderService.setLoaderState(true);
        this.cartSubscription = this._cartService.getCartUpdatesChanges().pipe(
            map((cartSession: any) =>
            {
                const delay = this._router.url.includes("quickorder") ? 0 : 400;
                this._cartService.verifyAndUpdateNotfications(delay);
                this.sendCritieoDataonView(cartSession);
                this.sendAdobeAnalyticsData(this.pageEvent);
                this.pageEvent = "genericClick";
                return cartSession;
            }),
            concatMap((res) => this._cartService.getShippingAndUpdateCartSession(res))).subscribe(
                (result) =>
                {
                    this.noOfCartItems = this._cartService.getCartItemsCount();
                    this._globalLoaderService.setLoaderState(false);
                });
    }

    removeItemFromCart(itemIndex)
    {
        this.removePopup = true;
        this.removeIndex = itemIndex;
    }

    resetRemoveItemCart()
    {
        this.removePopup = false;
        this.removeIndex = -1;
    }

    // make cosmetic changes after deleting an item from cart
    deleteProduct(e)
    {
        e.preventDefault();
        e.stopPropagation();
        this._globalLoaderService.setLoaderState(true);
        this.pushDataToDatalayerOnRemove(this.removeIndex);
        this._cartService.removeCartItemsByMsns([this._cartService.getGenericCartSession.itemsList[this.removeIndex]['productId']]);
        this.removePopup = false;
    }

    // redirect to product page 
    redirectToProductURL(url)
    {
        if (this.moduleName == 'QUICKORDER') {
            this._commonService.setSectionClickInformation('cart', 'pdp');
            this._router.navigateByUrl('/' + url);
        }
        return false;
    }

    //new implmentation
    handleItemQuantityChanges(itemIndex: number, action: string, typedValue?)
    {
        const item = this._cartService.getGenericCartSession.itemsList[itemIndex];
        const currentQty = item.productQuantity;
        if (typedValue && parseInt(typedValue) === currentQty) { return; }
        this.getProductDetails(action, itemIndex, item['productId'], typedValue || null);
    }

    getProductDetails(action, itemIndex, msn, typedValue)
    {
        this._globalLoaderService.setLoaderState(true);
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
            if (!product) {
                this._globalLoaderService.setLoaderState(false);
                const msg = "Product does not exist";
                this._tms.show({ type: 'error', text: msg });
                return;
            }
            this.validateProductWithQty(msn, action, product, itemIndex, typedValue)
        });
    }

    validateProductWithQty(msn, action, product, itemIndex, typedValue)
    {
        const minQty = product['moq'] || 1;
        const maxQty = product['quantityAvailable'];
        const incrementUnit = product['incrementUnit'] || 1;
        const item = this._cartService.getGenericCartSession.itemsList[itemIndex];
        const currentQty = item.productQuantity;
        let updateQtyTo = null;
        let errorMsg = null;
        let removeIndex = -1;
        switch (action) {
            case 'increment': {
                updateQtyTo = currentQty + incrementUnit;
                if (updateQtyTo > maxQty) {
                    updateQtyTo = maxQty;
                    errorMsg = `Maximum qty can be ordered is: ${maxQty}`;
                }
                this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updateQtyTo, itemIndex, "increment_quantity");
                break;
            }
            case 'decrement': {
                updateQtyTo = currentQty - incrementUnit;
                this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updateQtyTo, itemIndex, "decrement_quantity");
                if (updateQtyTo < minQty) {
                    removeIndex = itemIndex;
                }
                break;
            }
            case 'update': {
                updateQtyTo = Number(typedValue ? typedValue : null);
                if (updateQtyTo > maxQty) {
                    updateQtyTo = maxQty;
                    errorMsg = `Maximum qty can be ordered is: ${maxQty}`;
                }
                if (updateQtyTo < minQty) {
                    updateQtyTo = minQty;
                    errorMsg = `Minimum qty can be ordered is: ${minQty}`;
                }
                this.sendMessageOnQuantityChanges(this._cartService.getGenericCartSession, updateQtyTo, itemIndex, "quantity_updated");
                break;
            }
        }
        if (removeIndex > -1) {
            this._globalLoaderService.setLoaderState(false);
            this.removeItemFromCart(itemIndex);
            return
        }
        let bulkPriceMap = [];
        const newCartSession = JSON.parse(JSON.stringify(this._cartService.getGenericCartSession));
        newCartSession['itemsList'][itemIndex]['productQuantity'] = updateQtyTo;
        const productToUpdate = newCartSession['itemsList'][itemIndex];
        if (productToUpdate['bulkPriceMap'] && productToUpdate['bulkPriceMap']['india'] && (productToUpdate['bulkPriceMap']['india'] as any[]).length) {
            bulkPriceMap = (productToUpdate['bulkPriceMap']['india'] as any[]).filter((bulk) =>
            {
                return bulk['active'] && updateQtyTo >= bulk['minQty'] && updateQtyTo <= bulk['maxQty']
            });
            if (bulkPriceMap.length) {
                newCartSession['itemsList'][itemIndex]['bulkPrice'] = bulkPriceMap[0]['bulkSellingPrice'];
                newCartSession['itemsList'][itemIndex]['bulkPriceWithoutTax'] = bulkPriceMap[0]['bulkSPWithoutTax'];
            } else {
                newCartSession['itemsList'][itemIndex]['bulkPrice'] = null;
                newCartSession['itemsList'][itemIndex]['bulkPriceWithoutTax'] = null;
            }
        }
        this.updateCart(msn, newCartSession, errorMsg);
    }

    updateCart(msn, newCartSession, errorMsg)
    {
        let totalOffer = null;
        const updateCart$ = this._cartService.updateCartSession(newCartSession).pipe(
            switchMap((newCartSession) =>
            {
                return this._cartService.verifyAndApplyPromocode(newCartSession, this._cartService.appliedPromoCode, true)
            }),
            switchMap((response) =>
            {
                totalOffer = response.cartSession['cart']['totalOffer'] || null;
                return this._cartService.verifyShippingCharges(response.cartSession);
            }));
        const setValidationMessages$ = this._cartService.removeNotificationsByMsns([msn], true);
        forkJoin([updateCart$, setValidationMessages$]).subscribe((responses) =>
        {
            this._globalLoaderService.setLoaderState(false);
            let cartSession = responses[0];
            if (responses[0]) {
                const cartSession = this._cartService.generateGenericCartSession(responses[0]);
                cartSession['cart']['totalOffer'] = totalOffer;
                cartSession['extraOffer'] = null;
                this._cartService.setGenericCartSession(cartSession);
                this._cartService.publishCartUpdateChange(cartSession);
                this._cartService.orderSummary.next(cartSession);
                this._cartService.orderSummary.next(cartSession);
                this._tms.show({ type: 'success', text: errorMsg || "Cart quantity updated successfully" });
                this.sendMessageAfterCartAction(cartSession);
                return;
            }
            this._tms.show({ type: 'error', text: cartSession["message"] || "Cart quanity is not updated." });
        }, (error) => { this._globalLoaderService.setLoaderState(false); })
    }

    //checkouk-v1
    sendCriteoPageLoad()
    {
        const cartSession = this._cartService.getGenericCartSession;
        const itemsList = cartSession['itemsList'] ? (cartSession['itemsList'] as any[]) : [];
        if (itemsList.length === 0) { return; }
        const cart = cartSession['cart'];
        const channel = this._router.url.includes("/quickorder") ? "Cart" : "Checkout"
        var totQuantity = 0;
        var trackData = {
            event_type: "page_load",
            page_type: channel,
            label: "checkout_started",
            channel: channel,
            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : '0',
            quantity: itemsList.map(item => { return totQuantity = totQuantity + item.productQuantity; })[itemsList.length - 1],
            shipping: parseFloat(cartSession["shippingCharges"]),
            itemList: cartSession.itemsList.map(item =>
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

    sendEmailGTMCall()
    {
        const userSession = this._localAuthService.getUserSession() || null;
        dataLayer.push({
            'event': 'setEmail',
            'email': (userSession && userSession.email) ? userSession.email : '',
        });
    }
    //end of checkout v1

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

    get isQuickorder() { return this.moduleName === "QUICKORDER" }

    ngOnDestroy() { if (this.cartSubscription) this.cartSubscription.unsubscribe(); }
}
