import { AfterViewInit, Component, ComponentFactoryResolver, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CONSTANTS } from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { NavigationService } from '@app/utils/services/navigation.service';
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
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, concatMap, delay, first, map, mergeMap, switchMap } from 'rxjs/operators';

declare let dataLayer;
@Component({
    selector: 'cart',
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss'],
})

export class CartComponent implements OnInit, AfterViewInit
{
    removableItem = null;
    cartSubscription: Subscription;
    shippingSubscription: Subscription;
    pageEvent = "genericPageLoad";
    cartSession = null;
    noOfCartItems = 0;
    backButtonClickText=''
    private popStateListener;
    @Input() moduleName: 'CHECKOUT' | 'QUICKORDER' = 'QUICKORDER';
    @Output() openWishList$:EventEmitter<any> = new EventEmitter<any>();
    @Output() openSimillarList$:EventEmitter<any> = new EventEmitter<any>();
    @Output() continueFrombackPopup$:EventEmitter<any> = new EventEmitter<any>();

    
    //cartAddproduct var
    cartAddProductPopupInstance = null;
    @ViewChild('cartAddProductPopup', { read: ViewContainerRef }) cartAddProductPopupContainerRef: ViewContainerRef;
    cartUpdateCount: number = 0;

    totalPayableAmountAfterPrepaid: number=0;
    totalPayableAmountWithoutPrepaid:number=0;
    cartUpdatesSubscription: Subscription = null;

    backButtonClickQuickOrderSubscription: Subscription;
    isBackClicked: boolean=false; 
    private cancelIconClickedSubscription: Subscription;
    public isCancelIconClicked: boolean=true; 
    isBrowser = false;


    constructor(
        public _state: GlobalState, public meta: Meta, public pageTitle: Title,
        public objectToArray: ObjectToArray, public footerService: FooterService, public activatedRoute: ActivatedRoute,
        public dataService: DataService, public _commonService: CommonService, public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService, public _router: Router, public _cartService: CartService,
        private _tms: ToastMessageService, private _productService: ProductService, private _globalLoaderService: GlobalLoaderService,
        private _globalAnalyticsService: GlobalAnalyticsService,
        public _localAuthService: LocalAuthService,
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        private _navigationService: NavigationService

    ) {     this.isBrowser = _commonService.isBrowser
    }

    ngOnInit() {
        this._navigationService.setBackClickedQuickOrder(false)
        this._navigationService.setCancelIconQuickOrderClicked(true);

        this.backButtonClickQuickOrderSubscription = this._navigationService.isBackClickedQuickOrder$.subscribe(
          value => {
            this.isBackClicked = value;
          }
        );
        this.cancelIconClickedSubscription = this._navigationService.isCancelIconQuickOrderClicked$.subscribe(
            value => {
              this.isCancelIconClicked = value;
            }
          );
        this.backButtonClickText=this._cartService.getGenericCartSession["itemsList"].length==1?CONSTANTS.this_product_is:CONSTANTS.these_product_are
        if (this.isBrowser && this.moduleName=='QUICKORDER') {
            this.backUrlNavigationHandler();        
        }

      }

    closebackpopup(){
        this._navigationService.setBackClickedQuickOrder(false)
        this._navigationService.setCancelIconQuickOrderClicked(false);
    }
    ngAfterViewInit(): void {
        if (this._commonService.isBrowser) {
            this._commonService.updateUserSession();
            this.loadCartDataFromAPI();
            // this.sendCriteoPageLoad();
            this.sendEmailGTMCall();
        }
    }

    backUrlNavigationHandler() {
        this.popStateListener = (event) => {
          event.preventDefault();
          history.go(1);
          this.backButtonClickQuickOrderSubscription = this._navigationService.isBackClickedQuickOrder$.subscribe(
            value => {
              this.isBackClicked = true;
            }
          ); 
        };
        window.addEventListener('popstate', this.popStateListener, { once: true });
      }

    ngOnDestroy() {
        if (this.cartSubscription) this.cartSubscription.unsubscribe();
        if (this.shippingSubscription) this.shippingSubscription.unsubscribe();
        if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
        if (this.backButtonClickQuickOrderSubscription) this.backButtonClickQuickOrderSubscription.unsubscribe();
        if (this.cancelIconClickedSubscription) this.cancelIconClickedSubscription.unsubscribe();
        window.removeEventListener('popstate', this.popStateListener);
    }
    
    openWishList(){
        this.openWishList$.emit(true);
        this.sendAdobeAnalyticsData("add_to_cart_wishlist_cart ");
    }

    openSimillarList(productId, item){
        this.sendAdobeAnalyticsData("add_to_cart_simillarList_cart ");
        this.openSimillarList$.emit({productId: productId, item:item});
    }

    // Function to get and set the latest cart
    loadCartDataFromAPI() {
        this._globalLoaderService.setLoaderState(true);
        this.cartSubscription = this._cartService.getCartUpdatesChanges().pipe(
            map((cartSession: any) => {
                if (cartSession.proxy) { return cartSession }
                if (!this.cartSession || (this.cartSession && JSON.stringify(cartSession) != JSON.stringify(this.cartSession))) {
                    this.sendCritieoDataonView(cartSession);
                    // this.sendAdobeAnalyticsData(this.pageEvent);
                    this.pageEvent = "genericClick";
                    this.cartUpdateCount = this.cartUpdateCount + 1;
                }
                return cartSession;
            }),
        ).subscribe((cartSession) => {
            if (!this.cartSession || (this.cartSession && JSON.stringify(cartSession) != JSON.stringify(this.cartSession))) {
                // console.log("🚀 ~ file: cart.component.ts:105 ~ ).subscribe ~ cartSession:", cartSession)
                this.cartChangesUpdates(cartSession);
                const userSession = this._localAuthService.getUserSession();
                this._cartService.getPromoCodesByUserId(userSession['userId'], false);
            }else{
                console.log('duplicate cart call ignored');
            }
            
        });
    }

    cartChangesUpdates(cartSession) {
        
        this.cartSession = cartSession;
        this.noOfCartItems = (cartSession['itemsList'] as any[]).length;
        if (this.noOfCartItems) {
            this.cartUpdatesSubscription = this._cartService.verifyAndUpdateNotfications().subscribe(response => {
                if(response){
                    this._cartService.verifyAndUpdateNotficationsAfterCall(response);
                }
            });
        }
        this._globalLoaderService.setLoaderState(false);
    }

    removeItemFromCart(itemIndex, packageUnit)
    {
        this.removableItem = JSON.parse(JSON.stringify(this._cartService.getGenericCartSession?.itemsList[itemIndex]));
        this.removableItem['packageUnit'] = packageUnit;
    }

    resetRemoveItemCart() { this.removableItem = null; }

    // make cosmetic changes after deleting an item from cart
    deleteProduct(e)
    {
        e.preventDefault();
        e.stopPropagation();
        this._globalLoaderService.setLoaderState(true);
        this.pushDataToDatalayerOnRemove(this.removableItem);
        this._cartService.isAddedToCartSubject.next({});
        this._cartService.removeCartItemsByMsns([this.removableItem['productId']]);
        this.removableItem = null;
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
            this.removeItemFromCart(itemIndex, product['packageUnit']);
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
                if(this._cartService.appliedPromoCode) {
                    return this._cartService.verifyAndApplyPromocode(newCartSession, this._cartService.appliedPromoCode, true)
                } else {
                    return of({cartSession: newCartSession});
                }
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

    sendCritieoDataonView(cartSession) {
        if (this._router.url !== '/quickorder') { return }
        // console.log('cartUpdateCount ==>', this.cartUpdateCount)
        if (this.cartUpdateCount == 0) {
            // console.log('cartUpdateCount if ==>', this.cartUpdateCount)
            let eventData = { 'prodId': '', 'prodPrice': 0, 'prodQuantity': 0, 'prodImage': '', 'prodName': '', 'prodURL': '' };
            let criteoItem = [];
            let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
            for (let p = 0; p < cartSession["itemsList"].length; p++) {
                let price = cartSession["itemsList"][p]['productUnitPrice'];
                if (cartSession["itemsList"][p]['bulkPrice'] != '' && cartSession["itemsList"][p]['bulkPrice'] != null) {
                    price = cartSession["itemsList"][p]['bulkPrice'];
                }
                criteoItem.push({
                    name: cartSession["itemsList"][p]['productName'],
                    id: cartSession["itemsList"][p]['productId'],
                    price: cartSession["itemsList"][p]['productUnitPrice'],
                    quantity: cartSession["itemsList"][p]['productQuantity'],
                    image: cartSession["itemsList"][p]['productImg'],
                    url: CONSTANTS.PROD + '/' + cartSession["itemsList"][p]['productUrl']
                });
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
            // Gtm Validation
            if(criteoItem && criteoItem.length) {
                this._globalAnalyticsService.sendGTMCall(data);
            }
            /*End Criteo DataLayer Tags */
        }
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
        data["custData"] = this._commonService.custDataTracking;
        data["order"] = order;
        this._globalAnalyticsService.sendAdobeCall(data, trackingname);
        /*End Adobe Analytics Tags */
    }

    pushDataToDatalayerOnRemove(item)
    {
        if (!item) return;
        var taxonomy = item['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "remove_from_cart",
            product_name: item['productName'],
            msn: item['productId'],
            brand: item['brandName'],
            price: item['totalPayableAmount'],
            quantity: item['productQuantity'],
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
                        'name': item['productName'],
                        'id': item['productId'],
                        'price': item['totalPayableAmount'],
                        'variant': '',
                        'quantity': item['productQuantity'],
                        'prodImg': item['productImg']
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
        this.sendAdobeAnalyticsData(this.pageEvent);
    }

    similarProduct(productName, categoryId, BrandName, msn?) {
        if (productName && categoryId && BrandName) {
            this._globalLoaderService.setLoaderState(true);
            // TODO: check this final   
            this._cartService.AddSimilarProductOncartItem(productName, categoryId, BrandName,msn).subscribe(response => {
                this._globalLoaderService.setLoaderState(false)
                if (response && response['products'] && response['products'].length > 0) {
                    this.cartAddProductPopUp(response);
                }else{
                    const msg = "No similar product found for this brand Category";
                    this._tms.show({ type: 'error', text: msg });
                }
            })

        }
    }

    async cartAddProductPopUp(data) {
        const { CartAddProductComponent } = await import('../../../modules/cartAddProduct/cartAddProduct.component');
        const factory = this.cfr.resolveComponentFactory(CartAddProductComponent);
        this.cartAddProductPopupInstance = this.cartAddProductPopupContainerRef.createComponent(
            factory,
            null,
            this.injector
        );
        (
            this.cartAddProductPopupInstance.instance['similarProductData'] = data
        );
        (
            this.cartAddProductPopupInstance.instance['closePopup'] as EventEmitter<boolean>
          ).subscribe(data => {
            this.cartAddProductPopupContainerRef.remove();
            this._commonService.setBodyScroll(null, true);
          });

          (
            this.cartAddProductPopupInstance.instance['closePopupOnOutsideClick'] as EventEmitter<boolean>
          ).subscribe(data => {
            this.cartAddProductPopupContainerRef.remove();
            this._commonService.setBodyScroll(null, true);
          });
      
      
    }      

    get displayPage() { return this.noOfCartItems > 0 }

    get isQuickorder() { return this.moduleName === "QUICKORDER" }


    addToPurchaseList() {
        if (this._localAuthService.isUserLoggedIn()) {
          let userSession = this._localAuthService.getUserSession();
          let obj = {
            idUser: userSession.userId,
            userType: "business",
            idProduct:
              this.removableItem.productId || this.removableItem.defaultPartNumber,
            productName: this.removableItem.productName,
            description: this.removableItem.productDescripton,
            brand: this.removableItem.brandName,
            category: this.removableItem.categoryCode,
          };
          this._productService.addToPurchaseList(obj).subscribe((res) => {
            if (res["status"]) {
              this._cartService.removeCartItemsByMsns([this.removableItem['productId']], true, 'Product moved to wishlist');
              this.resetRemoveItemCart();
              this._cartService.isAddedToCartSubject.next({isAddedtowishList : true});
              this.sendAdobeAnalyticsData("move_to_wishlist");
            } else {
              this._cartService.removeCartItemsByMsns([this.removableItem['productId']], true, 'Product already exist in wishlist');
              this.resetRemoveItemCart();
            }
          });
        }else{
            const navigationExtras: NavigationExtras = {
                queryParams: { 'backurl': "quickorder" },
              };
            this._router.navigate(['/login'], navigationExtras);
        }
    }

    backFromBackPopup(){
        this.isBackClicked=false;  
        this._cartService.lastPaymentMode = null;
		this._cartService.lastParentOrderId = null;
		this._cartService.invoiceType = null;
		this._cartService.shippingAddress = null;
		this._cartService.billingAddress = null;
        this._navigationService.goBack();
    }   
    
}
