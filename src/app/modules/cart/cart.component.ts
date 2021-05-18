
import { isPlatformServer, isPlatformBrowser, DOCUMENT, Location } from '@angular/common';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ViewChild, Renderer2 } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Component, EventEmitter, Output, Input, ViewEncapsulation, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpErrorResponse } from '@angular/common/http';

import CONSTANTS from '../../config/constants';
import { SiemaCarouselComponent } from '../siemaCarousel/siemaCarousel.component';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { ProductService } from '../../utils/services/product.service';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CommonService } from '../../utils/services/common.service';
import { DataService } from '../../utils/services/data.service';
import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { FooterService } from '../../utils/services/footer.service';
import { GlobalState } from '../../utils/global.state';
import { ENDPOINTS } from '../../config/endpoints';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';


const PD = makeStateKey<{}>('pdata');//PD: ProductData
const SPD = makeStateKey<any>('SPD');
const RRD = makeStateKey<any>('RRD');//RRD: Review Rating Data
const QAD = makeStateKey<any>('QAD');//QAD: Question Answer Data

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: 'cart',
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss'],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CartComponent {
    @ViewChild(SiemaCarouselComponent) _siemaCarouselComponent: SiemaCarouselComponent;
    options = {
        duration: 500,
        // easing: 'ease-out',
        startIndex: 0,
        draggable: false,
        threshold: 20,
        loop: false,
        onInit: () => {
            setTimeout(() => {
                this._siemaCarouselComponent.scrollInitialize();
            }, 1000);
        }
    };
    sOptions = {
        selector: '.simi-prod',
        outerWrapperClass: ['simi_prod_cont'],
        innerWrapperClass: ['simi_prod'],
        similar: true,
        perPage: 5,
        ...this.options
    };

    pid: any;
    //recentProductList: Array<any> = [];
    questionAnswerList: any;
    reviews: any;
    selectedReviewType: string = "helpful";
    similarProducts: Array<any> = [];
    isMobile: Boolean;
    breadcrumpUpdated: Subject<any> = new Subject<any>();
    updateImg: {} = {};
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    isProductDescriptionLarge: boolean = false;
    isCommonProduct: boolean = true;
    isProductValid: boolean = true;
    productSizes: Array<any> = [];
    userSession: any;
    productId: string;
    productResult: any;
    isPurcahseListProduct: boolean = false;
    allCharges: Array<Boolean> = new Array();
    toggleDetails: Array<Boolean> = new Array();
    @Output() updateTabIndex: EventEmitter<number> = new EventEmitter<number>();
    @Output() itemsValidationMessage$: EventEmitter<Array<{}>> = new EventEmitter<Array<{}>>();
    @Input() isCheckOut: boolean = true;
    session: {};
    cartSession: any;
    uType: any;
    @Input() cartSessionUpdated$: Subject<any>;
    itemsList: Array<{}>;
    cart: {};
    starsCount = 4.5;
    tabIndex: number;
    @Input() isCheckoutPage: boolean = false;
    updateCartObservable: Subject<any> = new Subject<any>();
    messages: Array<any> = [];
    isPaymentValid: boolean = false;
    paymnetValidationMessage: string = '';
    isServer: boolean;
    isBrowser: boolean;
    api: any = {};
    invoiceType;
    private cDistryoyed = new Subject();
    itemsValidationMessage: Array<{}>;
    removePopup: boolean = false;
    currentRoute: string;

    sbm: { index?: number, type?: number, address?: {} }; // sbm: show bottom menu

    xyz: 'test';
    reviewlength = 3;
    gaGtmData: {} = {};
    validatationSub: any;
    valQty: boolean = false;
    user;
    checkoutAddressIndex: number;
    showLink;
    selectedBillingAddress: number;
    set isShowLoader(status: boolean) {
        this._loaderService.setLoaderState(status)
    }

    constructor(
        private _location: Location,
        public _state: GlobalState,
        public meta: Meta,
        public pageTitle: Title,
        @Inject(DOCUMENT) private _document,
        private _renderer2: Renderer2,
        public objectToArray: ObjectToArray,
        private _tState: TransferState,
        public footerService: FooterService,
        public activatedRoute: ActivatedRoute,
        @Inject(PLATFORM_ID) platformId,
        public dataService: DataService,
        public commonService: CommonService,
        public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService,
        public router: Router,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _productService: ProductService,
        private _loaderService: GlobalLoaderService,
        private _tms: ToastMessageService) {

        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.tabIndex = 4;
        this.itemsList = null;
        this.cart = {};
        this.sbm = { index: null }; // sbm: show bottom menu
        this.itemsValidationMessage = this.commonService.itemsValidationMessage;
        this.currentRoute = this.router.url;

        /**
         * Register a subscription to remove unavailable items in cart.
         * rui: remove unavailable items
         */
        this._state.subscribe('cart.rui', (items) => {
            debugger;
            this.removeUnavailableItems(items);
        });

    }

    ngOnInit() {
        this.api = CONSTANTS;
        this.gaGtmData = this.commonService.getGaGtmData();

        this.productResult = {};
        this.productResult['minimal_quantity'] = 1;
        this.getBusinessDetails();
        this.userSession = this._localAuthService.getUserSession();
        if (!this.validatationSub)
            this.validatationSub = this._state.subscribe("validationCheck", () => {
                this.checkPinCodeAddress(5, true);
            })
        if (this.userSession && this.isBrowser) {
            this.getPurchaseList();
        }

        this.activatedRoute.params.subscribe(
            data => {
                if (this.isBrowser) {
                    if (window.outerWidth >= 768) {
                        setTimeout(() => {
                            this.footerService.setFooterObj({ footerData: false });
                            this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
                        }, 1000)

                    }
                    else {
                        this.footerService.setMobileFoooters();
                    }
                }

                if (this.isServer) {
                    this.footerService.setFooterObj({ footerData: false });
                    this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
                }


                this.productSizes = [];
                this.productId = data['msnid'];
                // this.getGroupedProduct();
            }
        )

        // Set cart data 
        this.getCartFromSession();
        // Incase user login's on quickorder page then cart section should be updated
        this._cartService.orderSummary.subscribe((data: { cartSession?: {}, extra?: { errorMessage: string } }) => {
            this.getCartFromSession();
        });

        let userSession = this._localAuthService.getUserSession();
        this.user = userSession;
        this.invoiceType = this.checkOutService.getInvoiceType();
        let params = { customerId: userSession.userId, invoiceType: this.invoiceType }

        debugger;
        this.cartSessionUpdated$.subscribe((cs) => {
            debugger;
            this.cartSession = JSON.parse(JSON.stringify(cs));
            this.cart = cs['cart'];
            this.itemsList = (cs['itemsList'] !== undefined && cs['itemsList'] != null) ? cs['itemsList'] : [];

            /**
             * STARTS
             * Validate cart price, shipping or coupon.
             */

            if (this.isBrowser) {
                const user = this.localStorageService.retrieve('user');

                if (user && user.authenticated == "true") {
                    let cartobj = this._cartService.getCartSession();
                    let itemLists = cartobj["itemsList"];
                    itemLists.forEach((element) => {
                        element.shipping = element.shippingCharges;
                    });
                    let reqobj = {
                        "shoppingCartDto": cartobj
                    }
                    this.validateCartApi(reqobj);
                }
            }
        });

        this._cartService.validateCartSession.subscribe(
            (data) => {
                this.itemsList = (data['itemsList'] != undefined && data['itemsList'] != null) ? data['itemsList'] : [];
                for (let i = 0; i < this.itemsList.length; i++) {
                    this.itemsList[i]['message'] = '';
                    // this.messages.push({message:''})
                }
                // this.itemsValidationMessage = this.deleteValidationMessageLocalstorage(this.itemsList);
                this.commonService.itemsValidationMessage = this.deleteValidationMessageLocalstorage(this.itemsList);
                this.updateCartSessions();
            }
        )

        if (this.isBrowser) {
            if (this.router.url == '/quickorder') {
                let criteoItem = [];
                this.showLink = true;
                let eventData = {
                    'prodId': '',
                    'prodPrice': 0,
                    'prodQuantity': 0,
                    'prodImage': '',
                    'prodName': '',
                    'prodURL': ''
                };
                let taxo1 = '', taxo2 = '', taxo3 = '', productList = '', brandList = '', productPriceList = '', shippingList = '', couponDiscountList = '', quantityList = '', totalDiscount = 0, totalQuantity = 0, totalPrice = 0, totalShipping = 0;
                for (let p = 0; p < this.cartSession["itemsList"].length; p++) {
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
                    productPriceList = this.cartSession["itemsList"][p]['productUnitPrice'] + '|' + productPriceList;
                    shippingList = this.cartSession["itemsList"][p]['shippingCharges'] + '|' + shippingList;
                    couponDiscountList = this.cartSession["itemsList"][p]['offer'] ? this.cartSession["itemsList"][p]['offer'] + '|' + couponDiscountList : '';
                    quantityList = this.cartSession["itemsList"][p]['productQuantity'] + '|' + quantityList;
                    totalDiscount = this.cartSession["itemsList"][p]['offer'] + totalDiscount;
                    totalQuantity = this.cartSession["itemsList"][p]['productQuantity'] + totalQuantity;
                    totalPrice = this.cartSession["itemsList"][p]['productUnitPrice'] + totalPrice;
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

                /*Start Adobe Analytics Tags */

                let page = {
                    'pageName': "moglix:cart summary",
                    'channel': "cart",
                    'subSection': "moglix:cart summary",
                    'pincode': '',
                    'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
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
                _satellite.track("genericPageLoad");
                /*End Adobe Analytics Tags */

            }
        }
    }

    getCartFromSession() {
        this.cartSession = this._cartService.getCartSession();
        this.cart = this.cartSession['cart'];
        this.itemsList = (this.cartSession['itemsList'] != undefined && this.cartSession['itemsList'] != null) ? this.cartSession['itemsList'] : [];
    }

    validateCartApi(reqobj) {

        const user = this.localStorageService.retrieve('user');
        const vcmData = { userId: user['userId'] };
        const buyNow = this._cartService.buyNow;
        if (buyNow) {
            vcmData['buyNow'] = buyNow;
        }
        debugger;
        /* reqobj['shoppingCartDto']['itemsList'][3]['priceWithoutTax'] = 989;
        reqobj['shoppingCartDto']['itemsList'][3]['bulkPrice'] = 734;
        reqobj['shoppingCartDto']['itemsList'][3]['bulkPriceWithoutTax'] = 680; */
        forkJoin(
            this._cartService.validateCartApi(reqobj),
            this._cartService.getValidateCartMessageApi(vcmData)
        )
            .pipe(
                takeUntil(this.cDistryoyed),
                catchError((err) => {
                    return of({ status: 500 });
                })
            )
            .subscribe((res) => {
                let itemsValidationMessageOld = [];
                let itemsValidationMessage = [];
                if (res[1]['statusCode'] == 200) {
                    itemsValidationMessageOld = res[1]['data'];
                }
                const user = this.localStorageService.retrieve('user');
                if (res[0]['status'] == 200) {
                    itemsValidationMessage = this.getMessageList(res[0]['data'], reqobj.shoppingCartDto.itemsList);

                    //Only set validation message if any, if no validation message is found then dont override or remove previous validation messages;
                    if (itemsValidationMessage && itemsValidationMessage.length > 0) {
                        itemsValidationMessage = this.setValidationMessageLocalstorage(itemsValidationMessage, itemsValidationMessageOld);
                    } else {
                        //remove all oos product from message list
                        itemsValidationMessageOld = itemsValidationMessageOld.filter((itemValidationMessageOld) => {
                            if (itemValidationMessageOld['type'] == 'oos') {
                                return false;
                            } else {
                                return true;
                            }
                        })
                        itemsValidationMessage = itemsValidationMessageOld;
                        // this.localStorageService.store("user", user);
                    }
                    this.commonService.itemsValidationMessage = itemsValidationMessage;

                    // this.itemsValidationMessage = itemsValidationMessage;
                    // if(this.router.url.indexOf("/checkout")){
                    this.itemsValidationMessage$.emit();
                    // }
                    this._cartService.setValidateCartMessageApi({ userId: user['userId'], data: itemsValidationMessage })
                        .pipe(
                            catchError((err) => {
                                return of(null);
                            }),
                            takeUntil(this.cDistryoyed)
                        )
                        .subscribe(() => {

                        });
                    // this.itemsValidationMessageOld = itemsValidationMessageOld;
                    // this.itemsValidationMessage = this.getValidationMessageLocalstorage();

                    let items = reqobj.shoppingCartDto['itemsList'];
                    const msns: Array<string> = res[0]['data'] ? Object.keys(res[0]['data']) : [];
                    debugger;
                    if (items && items.length > 0) {
                        //Below function is used to show price update at item level if any validation message is present corresponding to item.
                        items = this.addPriceUpdateToCart(items, itemsValidationMessage);
                        this.itemsList = items;
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
                                    return this.updateCartItem(item, res[0]['data'][item['productId']]['productDetails']);
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

                        //debugger;
                        /**
                         * if product is out of stock, then add item to oos on frontend.
                         * if product price is instock after out of stock, then remove out of stock on frontend 
                         */
                        if (oosData && oosData.length > 0) {
                            reqobj.shoppingCartDto['itemsList'] = itemsList;
                            const sessionDetails = this._cartService.updateCart(reqobj.shoppingCartDto);
                            this._cartService.setCartSession(sessionDetails);
                            const cartSession = this._cartService.getCartSession();
                            this.itemsList = cartSession["itemsList"];
                        }
                        // update cart session, only when any price, shipping or coupon is updated 
                        if (ucs) {
                            reqobj.shoppingCartDto['itemsList'] = itemsList;
                            const sessionDetails = this._cartService.updateCart(reqobj.shoppingCartDto);
                            this._cartService.setCartSession(sessionDetails);

                            //if any offer exit on cart, call apply promocode else update cart session flow
                            if (sessionDetails['offersList'] && sessionDetails['offersList'].length > 0) {
                                this.applyPromoCode();
                            } else {
                                this.updateCartSessions();
                            }
                        } else {
                            const sessionDetails = this._cartService.getCartSession();
                            if (sessionDetails['offersList'] && sessionDetails['offersList'].length > 0) {
                                this.applyPromoCode();
                            } else {
                                this.isShowLoader = false;
                            }
                        }
                    }
                }
            })
    }

    addPriceUpdateToCart(itemsList, itemsValidationMessage) {
        debugger;
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
        
        const userData = this.localStorageService.retrieve('user');
        if (userData && userData.authenticated == "true") {
            /** 
             * remove cart item message from local storage
             * 
             * */
            // let itemsValidationMessage: Array<string> = this.getValidationMessageLocalstorage();
            let itemsValidationMessage: Array<{}> = this.commonService.itemsValidationMessage;

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
            this._cartService.setValidateCartMessageApi({ userId: userData['userId'], data: itemsValidationMessage }).subscribe(() => { });
            return [...itemsValidationMessage, ...itemsUnServicableMessage];
        }else{
            return null;
        }
    }

    getValidationMessageLocalstorage() {
        // return itemValidationMessage;
        // const user = this.localStorageService.retrieve('user');
        // return user["itemsValidationMessage"] ? user["itemsValidationMessage"] : [];
        return this.itemsValidationMessage;
    }

    /**
     * 
     * @param data : Msns list having price update.
     * @param items : current itemsList in cart.
     * returns new updates in items: price, shipping, coupon
     */


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
                    else if (data[item['productId']]['updates']['priceWithoutTax']) {
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

    // getMessageList(data, items) {
    //     let messageList = [];
    //     const msns: Array<string> = data ? Object.keys(data) : null;
    //     if (msns && items && items.length > 0) {
    //         items.forEach((item) => {
    //             if (msns.indexOf(item['productId']) != -1) {
    //                 let msg = {};
    //                 msg['msnid'] = item['productId'];
    //                 if (data[item['productId']]['updates']['outOfStockFlag']) {
    //                     msg['data'] = { productName: item['productName'], text1: ' is currently Out of Stock. Please remove from cart', text2: '', oPrice: '', nPrice: '' };
    //                     msg['type'] = "oos";
    //                 }
    //                 else if (data[item['productId']]['updates']['priceWithoutTax']) {
    //                     msg['data'] = { productName: item['productName'], text1: ' price has been updated from ', text2: 'to', oPrice: item["priceWithoutTax"], nPrice: data[item['productId']]['productDetails']['priceWithoutTax'] };
    //                     // msg['data'] = item['productName']+" has " + (item["priceWithoutTax"]>data[item['productId']]['productDetails']['priceWithoutTax'] ? 'decreased' : 'increased') + " from Rs." + item["priceWithoutTax"] + " to Rs." + data[item['productId']]['productDetails']['priceWithoutTax'];
    //                     msg['type'] = "price";
    //                 } else if (data[item['productId']]['updates']['shipping']) {
    //                     //check if shipping msg is already present in message list.
    //                     // let addmsg: number = messageList.findIndex(ml=>ml.type == "shipping" || ml.type == "coupon");
    //                     let addmsg: number = messageList.findIndex(ml => ml.type == "shipping");
    //                     if (addmsg == -1) {
    //                         if (data[item['productId']]['updates']['shipping']) {
    //                             msg['data'] = { text1: 'Shipping Charges have been updated' };
    //                             msg['type'] = "shipping";
    //                         }
    //                         /* if(data[item['productId']]['updates']['coupon']){
    //                             if(msg['data']){
    //                                 msg['data'] += " and coupon ";
    //                             }else{
    //                                 msg['data'] = "Your coupon ";    
    //                                 msg['type'] = "coupon";
    //                             }
    //                         }

    //                         if(msg['data']){
    //                             msg['data'] += " has been updated.";
    //                         }  */
    //                     }
    //                 } else if (data[item['productId']]['updates']['coupon']) {
    //                     //check if shipping msg is already present in message list.
    //                     // let addmsg: number = messageList.findIndex(ml=>ml.type == "shipping" || ml.type == "coupon");
    //                     let addmsg: number = messageList.findIndex(ml => ml.type == "coupon");
    //                     if (addmsg == -1) {
    //                         if (data[item['productId']]['updates']['coupon']) {
    //                             msg['data'] = { text1: 'Applied Promo Code has been updated.' };
    //                             msg['type'] = "coupon";
    //                         }
    //                         /* if(data[item['productId']]['updates']['coupon']){
    //                             if(msg['data']){
    //                                 msg['data'] += " and coupon ";
    //                             }else{
    //                                 msg['data'] = "Your coupon ";    
    //                                 msg['type'] = "coupon";
    //                             }
    //                         }

    //                         if(msg['data']){
    //                             msg['data'] += " has been updated.";
    //                         }  */
    //                     }
    //                 }
    //                 if (msg['data']) {
    //                     messageList.push(msg);
    //                 }
    //             }
    //         });
    //     }

    //     return messageList;

    // }

    updateCartItem(item, productResult) {
        item["amount"] = Number(productResult['mrp']),
            item["totalPayableAmount"] = Number(productResult['sellingPrice']),
            item["productMRP"] = productResult['mrp'],
            item["priceWithoutTax"] = productResult['priceWithoutTax'],
            item["tpawot"] = Number(productResult['priceWithoutTax']),
            item["productSelling"] = productResult['sellingPrice'],
            item["productUnitPrice"] = Number(productResult['sellingPrice'])
        // item["bulkPriceMap"] = productResult['bulkPriceWithSameDiscount']
        //debugger;
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
        // if (priceQuantityCountry.bulkPrices && priceQuantityCountry.bulkPrices['india'])
        // this.productResult['bulkPrice'] = priceQuantityCountry.bulkPrices['india'];
    }

    calCulateDiscount() {
        this.itemsList.forEach((element) => {

            element['discount'] = ((element['amount'] - element['productUnitPrice']) / element['amount']) * 100;
        })
    }

    ngAfterViewInit() {
    }




    obj = {};
    public reviewLength: number = 0;

    getBusinessDetail(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CBD;
        return this.dataService.callRestful("GET", url, { params: data });
    }

    getBusinessDetails() {
        if (this.localStorageService.retrieve('user')) {
            let user = this.localStorageService.retrieve('user');
            let data = { customerId: user.userId, userType: "business" }
            this.uType = user.userType;
            // let user = this.localStorageService.retrieve('user');
            if (user.authenticated == "true" && user.userType == "business") {
                this.getBusinessDetail(data).subscribe(businessDeatils => {

                    if (businessDeatils['statusCode'] == 200) {

                        this._cartService.payBusinessDetails = {
                            "company": businessDeatils['data']['companyName'],
                            "gstin": businessDeatils['data']['gstin'],
                            "is_gstin": businessDeatils['data']['isGstInvoice']
                        }
                    }
                })
            }
            else {

                this._cartService.payBusinessDetails = null;
            }
        }
    };

    addProduct() {

    }

    execGaGtmTag() {
        let dlp = [];
        let criteoItem = [];
        for (let p = 0; p < this.cartSession["itemsList"].length; p++) {
            let product = {
                id: this.cartSession["itemsList"][p]['productId'],
                name: this.cartSession["itemsList"][p]['productName'],
                price: this.cartSession["itemsList"][p]['totalPayableAmount'],
                variant: '',
                quantity: this.cartSession["itemsList"][p]['productQuantity']
            };
            dlp.push(product);
        }

        dataLayer.push({
            'event': 'checkout',
            'ecommerce': {
                'checkout': {
                    'actionField': { 'step': 1, 'option': 'Checkout' },
                    'products': dlp
                }
            },
        });
    }
    deleteProduct(index) {
        debugger;
        this.isShowLoader = true;
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

        if (this.uniqueRequestNo == 0) {
            this.uniqueRequestNo = 1;
            let cartSessions = this._cartService.getCartSession();
            let itemsList = cartSessions["itemsList"];
            const removedItem = itemsList.splice(index, 1);
            this.removePopup = false;
            // this.itemsValidationMessage = this.deleteValidationMessageLocalstorage(removedItem[0]);
            this.commonService.itemsValidationMessage = this.deleteValidationMessageLocalstorage(removedItem[0], "delete");
            this.itemsValidationMessage$.emit();
            this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });
            cartSessions["itemsList"] = itemsList;
            cartSessions = this._cartService.updateCart(cartSessions);

            let eventData = {
                'prodId': '',
                'prodPrice': 0,
                'prodQuantity': 0,
                'prodImage': '',
                'prodName': '',
                'prodURL': ''
            };
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
            _satellite.track("genericClick");
            /*End Adobe Analytics Tags */

            // Update cart in service
            this._cartService.setCartSession(cartSessions);
            if (this.cartSession['itemsList'] !== null && this.cartSession['itemsList']) {
                var totQuantity = 0;
                var trackData = {
                    event_type: "click",
                    page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                    label: "cart_updated",
                    channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
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
                // this.sessionCart = this.session;
            }
            // alert(JSON.stringify(cartSessions));
            // this.isShowLoader = true;
            if (!this.isServer) {
                if (this.localStorageService.retrieve('user')) {
                    let userData = this.localStorageService.retrieve('user');
                    if (userData.authenticated == "true") {
                        if (cartSessions['offersList'] && cartSessions['offersList'].length > 0) {


                            //alert(JSON.stringify(this.cartSession));
                            let reqobj = {
                                "shoppingCartDto": cartSessions
                            }

                            this.applyPromoCodeApi(reqobj).subscribe(
                                res => {
                                    // this.isShowLoader = false;
                                    // $("#page-loader").hide();
                                    if (res['status']) {
                                        if (res['data']['discount'] < cartSessions['cart']['totalAmount']) {
                                            cartSessions['cart']['totalOffer'] = res['data']['discount'];

                                            // this.itemsList = cartSessions["itemsList"];
                                            /* this.itemsList.forEach((element,index)=>
                                            {
                                                for(let key in productDiscount)
                                                {
                                                    if(key==element['productId'])
                                                    {
                                                        this.itemsList[index]['offer']=productDiscount[key];
                                                    }
                                                }
                                            }); */

                                            /**
                                             * Updating offer for each product STARTS.
                                             */
                                            let productDis: Array<string> = Object.keys(res["data"]["productDis"] ? res["data"]["productDis"] : {});
                                            // let itemLists: Array<{}> = sessionDetails["itemsList"]; 
                                            itemsList.map((item) =>
                                                productDis.indexOf(item["productId"]) != -1 ?
                                                    item["offer"] = res["data"]["productDis"][item["productId"]]
                                                    :
                                                    item["offer"] = null
                                            );
                                            cartSessions["itemsList"] = itemsList;
                                            // Updating offer for each product ENDS
                                            //console.log("cart Sesion+" + JSON.stringify(cartSessions));

                                        } else {
                                            cartSessions['cart']['totalOffer'] = 0;
                                            cartSessions['offersList'] = [];
                                            itemsList.map((item) =>
                                                item["offer"] = null
                                            );
                                            cartSessions["itemsList"] = itemsList;
                                            //console.log("cart Sesion2" + JSON.stringify(cartSessions));
                                        }
                                        //this.cartSession['cart']['totalOffer']=res.data.discount
                                        //alert(res.data.discount);
                                        // this.errorMeesage = res.statusDescription;
                                        this.updateDeleteCart(cartSessions);
                                    }
                                    else {
                                        cartSessions['cart']['totalOffer'] = 0;
                                        cartSessions['offersList'] = [];
                                        itemsList.map((item) =>
                                            item["offer"] = null
                                        );
                                        cartSessions["itemsList"] = itemsList;
                                        this._cartService.extra.next({ errorMessage: res["statusDescription"] });
                                        this.updateDeleteCart(cartSessions);
                                        // this.errorMeesage = res.statusDescription;
                                    }
                                }
                            );
                        }
                        else {
                            this.isShowLoader = false;
                            // $("#page-loader").hide();
                            this._cartService.extra.next({ errorMessage: null });
                            this.updateDeleteCart(cartSessions);

                            // this.errorMeesage = "Promo Code is invalid";

                            //alert("Promo Code is invalid");
                        }
                    }
                    if (userData.authenticated == "false") {
                        this.isShowLoader = false;
                        // $("#page-loader").hide();
                        this.updateDeleteCart(cartSessions);
                        //
                        //  this.errorMeesage = "To avail offer,";
                    }
                }
                else {
                    this.isShowLoader = false;
                    // $("#page-loader").hide();
                    this.updateDeleteCart(cartSessions);

                    //this.errorMeesage = "To avail offer,";
                }
            }
        }
        this.sbm.index = null;
    }

    updateDeleteCart(cartSessions, extraData?) {
        //  this.updateCartObservable.unsubscribe();
        if (!this.isServer) {
            // $("#page-loader").show();
            if (!this.isShowLoader)
                this.isShowLoader = true;

            let sro = this._cartService.getShippingObj(cartSessions);
            this.getShippingCharges(sro).subscribe(
                res => {
                    if (res['statusCode'] == 200) {
                        // this.cartSession = this._cartService.getCartSession();

                        cartSessions['cart']['shippingCharges'] = res['data']['totalShippingAmount'];
                        let productShippingCharge = res['data']['itemShippingAmount'];

                        for (let i = 0; i < cartSessions['itemsList'].length; i++) {
                            cartSessions['itemsList'][i]['shippingCharges'] = res['data']['itemShippingAmount'][cartSessions['itemsList'][i]['productId']];
                        }
                        //this.shippingCharges = this.calCulateTotalAmount(this.cartSession['cart'].totalPayableAmount, this.shippingCharges, this.cartSession['cart'].totalPayableAmount)


                        this._cartService.updateCartSession(cartSessions).subscribe((data) => {
                            this.isShowLoader = false;
                            if (extraData && extraData['showMessage']) {
                                this._tms.show(extraData['showMessage']);
                            }
                            let res = data;
                            if (res['statusCode'] == 200) {
                                this.uniqueRequestNo = 0;
                                let itemsList = res['itemsList'];
                                itemsList.forEach((element, index) => {
                                    for (let key in productShippingCharge) {
                                        if (key == element['productId']) {
                                            itemsList[index]['shippingCharges'] = productShippingCharge[key];
                                        }
                                    }
                                })
                                this.cartSession = res;
                                this.itemsList = itemsList;
                                this.cart = res.cart;
                                this._cartService.cart.next(this.itemsList == null ? 0 : this.itemsList.length);
                                res["itemsList"] = itemsList;
                                this._cartService.setCartSession(res);
                                // alert(this.itemsList.length);
                                this._cartService.orderSummary.next(this.cartSession);
                                /* navigate to quick order page, if no item is present in itemlist */
                                if (itemsList.length == 0 && this.router.url.indexOf('/checkout') != -1) {
                                    this._location.replaceState('/'); // clears browser history so they can't navigate with back button
                                    this.router.navigateByUrl('/quickorder');
                                }
                            }
                            else {
                                this.uniqueRequestNo = 0;
                            }

                        }, err => {
                            this.uniqueRequestNo = 0;
                        });
                    }
                }

            );
        }
    }

    updateTest() {
        this._cartService.updateProduct$.emit();
    }

    updateQuantity($event, i) {

        // alert(($event.target.value));
        if ($event.target.value == undefined || $event.target.value == null || $event.target.value == "" || $event.target.value == 0) {
            $event.target.value = this.itemsList[i]['productQuantity'];
            return;
        }

        let cartSession = this._cartService.getCartSession();
        let itemsList = cartSession["itemsList"];
        var taxonomy = this.cartSession["itemsList"][i]['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "quantity_updated",
            product_name: this.cartSession["itemsList"][i]['productName'],
            msn: this.cartSession["itemsList"][i]['productId'],
            brand: this.cartSession["itemsList"][i]['brandName'],
            price: this.cartSession["itemsList"][i]['totalPayableAmount'],
            quantity: parseInt($event.target.value),
            channel: "Cart",
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            page_type: "Cart"
        }
        this.dataService.sendMessage(trackingData);
        // $("#page-loader").show();
        if (this.checkNumber($event.target.value)) {
            let updatedQuantity = parseInt($event.target.value);
            let productBO = {};
            let item = this.itemsList[i];

            // console.log($event.target.value, this.itemsList[i]['productQuantity'], "$event.target.value == this.itemsList[i]['productQuantity']");
            //if quantity is not updated then abort api calls
            if (parseInt($event.target.value) == this.itemsList[i]['productQuantity'])
                return;

            this.isShowLoader = true;
            // this.itemsValidationMessage = this.deleteValidationMessageLocalstorage(item);
            this.commonService.itemsValidationMessage = this.deleteValidationMessageLocalstorage(item);
            this._cartService.getProduct(item).subscribe((response) => {
                productBO = response;
                let productPriceQuantity = productBO["productBO"]["productPartDetails"][item["productId"].toUpperCase()]["productPriceQuantity"]["india"];

                let tax = 0;
                if (productPriceQuantity.taxRule && productPriceQuantity.taxRule.taxPercentage) {
                    let taxPercentage = Number(productPriceQuantity.taxRule.taxPercentage);
                    tax = Number(productPriceQuantity.sellingPrice) - (Number(productPriceQuantity.sellingPrice) / (1 + taxPercentage / 100));
                }//console.log(productPriceQuantity);

                let isQua = this.isQuantityAvailable(updatedQuantity, productPriceQuantity, i);
                //Update cart object only when isQuantityAvailable returns true.
                if (isQua["status"]) {
                    cartSession["itemsList"][i]['productQuantity'] = updatedQuantity;
                    itemsList[i]['taxes'] = tax * updatedQuantity;
                    // this.itemsList[i]["amount"] = item["productUnitPrice"] * updatedQuantity;
                    cartSession = this._cartService.updateCart(cartSession);
                    //  this._cartService.orderSummary.next(this.cartSession);
                    if (cartSession['itemsList'] !== null && cartSession['itemsList']) {
                        var totalQuantity = 0;
                        var trackData = {
                            event_type: "focusout",
                            page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                            label: "quantity_updated",
                            channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "0",
                            quantity: cartSession["itemsList"].map(item => {
                                totalQuantity = totalQuantity + item.productQuantity;
                            })[this.cartSession["itemsList"].length - 1],
                            shipping: parseFloat(cartSession["shippingCharges"]),
                            itemList: cartSession["itemsList"].map(item => {
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
                        // this.sessionCart = this.session;
                    }
                    itemsList[i]['message'] = "Cart quantity updated successfully";
                    cartSession["itemsList"] = itemsList;
                    this._cartService.setCartSession(cartSession);
                    this.updateCartSession();
                }
                //Do not update cart object if isQuantityAvailable returns false and revert the entered quantity to previous.
                else {
                    $event.target.value = this.itemsList[i]['productQuantity'];
                }
            });
        }
    }
    // getval($event,i){
    //     if($event.target.value == 0){
    //         $event.target.value = null;
    //     }
    // }

    changeBulkPriceQuantity(input) {
    }

    checkNumber(quantity): boolean {
        quantity = parseInt(quantity, 10);
        // Check number-range
        if (quantity >= 1 && quantity <= 999){
            return true;
        }else{
            return false;
        }   
    }

    fireEvent() {
        this.isShowLoader = false;
    }

    incrementQuantity(quantityTarget, i) {
        debugger;
        let cartSession = this._cartService.getCartSession();
        // console.log(cartSession, "incrementQuantityincrementQuantity")
        let itemsList = cartSession["itemsList"];
        var taxonomy = cartSession["itemsList"][i]['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "increment_quantity",
            product_name: cartSession["itemsList"][i]['productName'],
            msn: cartSession["itemsList"][i]['productId'],
            brand: cartSession["itemsList"][i]['brandName'],
            price: cartSession["itemsList"][i]['totalPayableAmount'],
            quantity: quantityTarget.value,
            channel: "Cart",
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            page_type: "Cart"
        }
        this.dataService.sendMessage(trackingData);
        if (this.checkNumber(quantityTarget.value)) {
            this.isShowLoader = true;
            // $("#page-loader").show();
            let currentQuantity = quantityTarget.value;

            let updatedQuantity: number;
            //alert(currentQuantity);
            ////console.log(productQuantity.value, i);
            let item = itemsList[i];
            let productBO = {};
            //  $("#page-loader").show();
            debugger;
            const itemsValidationMessage = this.deleteValidationMessageLocalstorage(item);
            this.itemsValidationMessage = itemsValidationMessage;
            this.commonService.itemsValidationMessage = itemsValidationMessage;
            this.itemsValidationMessage$.emit();
            this._cartService.getProduct(item).subscribe((response) => {
                productBO = response;
                let productPriceQuantity = productBO["productBO"]["productPartDetails"][item["productId"].toUpperCase()]["productPriceQuantity"]["india"];
                let tax = 0;
                if (productPriceQuantity.taxRule && productPriceQuantity.taxRule.taxPercentage) {
                    let taxPercentage = Number(productPriceQuantity.taxRule.taxPercentage);
                    tax = Number(productPriceQuantity.sellingPrice) - (Number(productPriceQuantity.sellingPrice) / (1 + taxPercentage / 100));
                }
                if (parseInt(productPriceQuantity.incrementUnit) == 0) {
                    updatedQuantity = parseInt(currentQuantity) + 1;
                }
                if (parseInt(productPriceQuantity.incrementUnit) > 0) {
                    updatedQuantity = parseInt(currentQuantity) + parseInt(productPriceQuantity.incrementUnit);
                }
                //updatedQuantity = parseInt(currentQuantity) + parseInt(productPriceQuantity.incrementUnit);
                //console.log('cartSession updateCart intial', Object.assign({},cartSession));

                let isQua = this.isQuantityAvailable(updatedQuantity, productPriceQuantity, i);

                cartSession = this._cartService.getCartSession();
                itemsList = cartSession['itemsList'];

                //console.log('cartSession updateCart after', Object.assign({}, cartSession), Object.assign({}, this.itemsList));
                //Update cart object only when isQuantityAvailable returns true.
                if (isQua["status"]) {
                    quantityTarget.value = updatedQuantity;
                    itemsList[i]['productQuantity'] = updatedQuantity;
                    itemsList[i]['taxes'] = tax * updatedQuantity;
                    //  this._cartService.orderSummary.next(this.cartSession);                    
                    // console.log(itemsList, "itemsListitemsListitemsListitemsList");
                    cartSession["itemsList"] = itemsList;
                    cartSession = this._cartService.updateCart(cartSession);
                    if (cartSession['itemsList'] !== null && cartSession['itemsList']) {
                        var totalQuantity = 0;
                        var trackData = {
                            event_type: "click",
                            page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                            label: "cart_updated",
                            channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "0",
                            quantity: cartSession["itemsList"].map(item => {
                                return totalQuantity = totalQuantity + item.productQuantity;
                            })[this.cartSession["itemsList"].length - 1],
                            shipping: parseFloat(cartSession["shippingCharges"]),
                            itemList: cartSession["itemsList"].map(item => {
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
                        // this.sessionCart = this.session;
                    }
                    itemsList[i]['message'] = "Cart quantity updated successfully";
                    this._tms.show({ type: 'success', text: this.itemsList[i]['message'] });
                    //console.log('cartSession 2', Object.assign({}, cartSession), Object.assign({}, itemsList));

                    cartSession["itemsList"] = itemsList;

                    this._cartService.setCartSession(cartSession);
                    this.updateCartSession();
                } else {
                    //this.itemsList[i]['productQuantity'] = currentQuantity;
                }
                this.isShowLoader = false;
                // $("#page-loader").hide();
            });
        }
    }

    decrementQuantity(quantityTarget, i) {
        let cartSession = this._cartService.getCartSession();
        let itemsList = cartSession["itemsList"];
        var taxonomy = this.cartSession["itemsList"][i]['taxonomyCode'];
        var trackingData = {
            event_type: "click",
            label: "decrement_quantity",
            product_name: this.cartSession["itemsList"][i]['productName'],
            msn: this.cartSession["itemsList"][i]['productId'],
            brand: this.cartSession["itemsList"][i]['brandName'],
            price: this.cartSession["itemsList"][i]['totalPayableAmount'],
            quantity: quantityTarget.value,
            channel: "Cart",
            category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
            category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
            category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
            page_type: "Cart"
        }
        this.dataService.sendMessage(trackingData);
        if (this.checkNumber(quantityTarget.value)) {
            this.isShowLoader = true;
            // $("#page-loader").show();
            let currentQuantity = quantityTarget.value;
            let updatedQuantity: number;
            ////console.log(productQuantity.value, i);
            let item = this.itemsList[i];
            let productBO = {};
            //$("#page-loader").show();
            const itemsValidationMessage = this.deleteValidationMessageLocalstorage(item);
            this.itemsValidationMessage = itemsValidationMessage;
            this.commonService.itemsValidationMessage = itemsValidationMessage;
            this.itemsValidationMessage$.emit();

            this._cartService.getProduct(item).subscribe((response) => {
                productBO = response;
                let productPriceQuantity = productBO["productBO"]["productPartDetails"][item["productId"].toUpperCase()]["productPriceQuantity"]["india"];
                let tax = 0;
                if (productPriceQuantity.taxRule && productPriceQuantity.taxRule.taxPercentage) {
                    let taxPercentage = Number(productPriceQuantity.taxRule.taxPercentage);
                    tax = Number(productPriceQuantity.sellingPrice) - (Number(productPriceQuantity.sellingPrice) / (1 + taxPercentage / 100));
                }
                if (parseInt(productPriceQuantity.incrementUnit) == 0) {
                    updatedQuantity = parseInt(currentQuantity) - 1;
                }
                if (parseInt(productPriceQuantity.incrementUnit) > 0) {
                    updatedQuantity = parseInt(currentQuantity) - parseInt(productPriceQuantity.incrementUnit);
                }
                // updatedQuantity = parseInt(currentQuantity) - parseInt(productPriceQuantity.incrementUnit);
                let isQua = this.isQuantityAvailable(updatedQuantity, productPriceQuantity, i);
                cartSession = this._cartService.getCartSession();
                itemsList = cartSession['itemsList'];
                //Update cart object only when isQuantityAvailable returns true.
                if (isQua["status"]) {
                    quantityTarget.value = updatedQuantity;
                    itemsList[i]['productQuantity'] = updatedQuantity;
                    itemsList[i]['taxes'] = tax * updatedQuantity;
                    // this.itemsList[i]["totalPayableAmount"] = item["totalPayableAmount"] * updatedQuantity;
                    cartSession = this._cartService.updateCart(cartSession);
                    // this._cartService.orderSummary.next(this.cartSession);
                    if (cartSession['itemsList'] !== null && cartSession['itemsList']) {
                        var totalQuantity = 0;
                        var trackData = {
                            event_type: "click",
                            page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                            label: "cart_updated",
                            channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                            price: cartSession["cart"]["totalPayableAmount"] ? cartSession["cart"]["totalPayableAmount"].toString() : "0",
                            quantity: cartSession["itemsList"].map(item => {
                                return totalQuantity = totalQuantity + item.productQuantity;
                            })[this.cartSession["itemsList"].length - 1],
                            shipping: parseFloat(cartSession["shippingCharges"]),
                            itemList: cartSession["itemsList"].map(item => {
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
                        // this.sessionCart = this.session;
                    }
                    itemsList[i]['message'] = "Cart quantity updated successfully";
                    this._tms.show({ type: 'success', text: this.itemsList[i]['message'] });
                    // itemsList[i] = this.itemsList[i];
                    cartSession["itemsList"] = itemsList;
                    // console.log('cartSession 0', Object.assign({}, cartSession));
                    this._cartService.setCartSession(cartSession);
                    this.updateCartSession();
                } else {
                    //this.itemsList[i]['productQuantity'] = currentQuantity;
                }
                this.isShowLoader = false;
                // $("#page-loader").hide();
            });
        }
    }

    isQuantityAvailable(updatedQuantity, productPriceQuantity, index) {

        // console.log('isQuantityAvailable', updatedQuantity, productPriceQuantity, index);

        if (updatedQuantity > productPriceQuantity.quantityAvailable) {
            // alert("Quantity not available");
            this.isShowLoader = false;
            this.itemsList[index]['message'] = "Quantity not available";
            this._tms.show({ type: 'success', text: this.itemsList[index]['message'] });
            return { status: false, message: "Quantity not available" };

        }
        else if (updatedQuantity < productPriceQuantity.moq) {

            this.isShowLoader = false;
            this.itemsList[index]['message'] = "Minimum quantity is " + productPriceQuantity.moq;
            this.showPopup(index);
            if (this.removePopup == false) {
                this._tms.show({ type: 'error', text: 'Product successfully removed from Cart' });
            }
            // this.deleteProduct(index);
            // this._tms.show({type: 'success', text: this.itemsList[index]['message']});            
            // alert("Minimum quantity is " + productPriceQuantity.moq);
            return { status: false, message: "Minimum quantity is " + productPriceQuantity.moq };
        }
        else {
            let remainder = (updatedQuantity - productPriceQuantity.moq) % productPriceQuantity.incrementUnit;
            if (remainder > 0) {
                this.isShowLoader = false;
                this.itemsList[index]['message'] = "Incremental Count not matched";
                this._tms.show({ type: 'success', text: this.itemsList[index]['message'] });
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

                //console.log('bulkPriceWithoutTax', bulkPriceWithoutTax); 
                //console.log('bulkPrice', bulkPrice); 
                this.itemsList[index]['bulkPrice'] = bulkPrice;
                this.itemsList[index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;
                //this.updateCartSession();
                this.itemsList[index]['message'] = "Cart quantity updated successfully";
                //debugger
                const cartSession = this._cartService.getCartSession();
                cartSession['itemsList'][index]['bulkPrice'] = bulkPrice;
                cartSession['itemsList'][index]['bulkPriceWithoutTax'] = bulkPriceWithoutTax;

                this._cartService.setCartSession(cartSession);
                // alert("Cart quantity updated successfully");
                return { status: true, message: "Cart quantity updated successfully", items: this.itemsList };

            }
        }
    }

    updateCartSession() {
        this.applyPromoCode();
    }

    updateCartSessions() {
        debugger;
        if (!this.isShowLoader)
            this.isShowLoader = true;
        if (!this.isServer) {
            // $("#page-loader").show();
            let cs = Object.assign({}, this._cartService.getCartSession());
            let sro = this._cartService.getShippingObj(cs);
            // console.log('updateCartSessionssro', sro); 
            this.getShippingCharges(sro).subscribe(
                res => {
                    if (res['statusCode'] == 200) {
                        let cartSession = this._cartService.getCartSession();
                        // console.log('cartSession 1', Object.assign({}, cartSession));
                        // console.log(cartSession, "lakjsdlfjaldjfljadsf");
                        cartSession['cart']['shippingCharges'] = res['data']['totalShippingAmount'];

                        // let items: Array<any> = this.itemsList;
                        // items.forEach((element) => { delete element['message'] });
                        // cartSession["itemsList"] = items;

                        for (let i = 0; i < cartSession['itemsList'].length; i++) {
                            // console.log(res['data']['itemShippingAmount'], cs['itemsList'][i]['productId']);
                            cartSession['itemsList'][i]['shippingCharges'] = res['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                        }
                        // this.cartSession["cart"] = this.cart;
                        //console.log(this.cartSession);
                        // console.log(cartSession, "getShippingCharges")
                        // console.log('cartSession 2', Object.assign({}, cartSession));
                        this._cartService.updateCartSession(cartSession).subscribe((data) => {
                            this.isShowLoader = false;
                            // $("#page-loader").hide();
                            if (data.statusCode == 200) {
                                // console.log(data, cartSession, "datadatadatadatadatadata");
                                // console.log('data["itemsList"]', data["itemsList"]);
                                this.cartSession = data;
                                //  this.itemsList = data["itemsList"]
                                this.uniqueRequestNo = 1;
                                this.uniqueRequestNo = 0;
                                // let cartSessionnew = data;
                                this._cartService.orderSummary.next(data);
                            } else {
                                this.uniqueRequestNo = 0;
                            }
                        },
                            error => {
                                this.uniqueRequestNo = 0;
                            });


                        // let itemsList = this.cartSession['itemsList'];
                        /* for(let i=0; i<this.cartSession['itemsList'].length; i++){
                            // console.log(res['data']['itemShippingAmount'], cs['itemsList'][i]['productId']);
                            this.cartSession['itemsList'][i]['shippingCharges'] = res['data']['itemShippingAmount'][this.cartSession['itemsList'][i]['productId']];
                        } */
                        //this.shippingCharges = this.calCulateTotalAmount(this.cartSession['cart'].totalPayableAmount, this.shippingCharges, this.cartSession['cart'].totalPayableAmount)
                    }
                }

            );
        }

    }
    checkQuantityCode(event) {
        return event.charCode >= 48 && event.charCode <= 57;
    }

    uniqueRequestNo: number = 0;

    /**
     * @param il List of items to be removed from cart.
     * Below function is remove to items from cart for ex: out of stock
     */
    removeUnavailableItems(il) {

        const unAvailableItemsIndex = il.map((uaii) => {
            return uaii['productId'];
        });
        console.log(il);

        const showMessage = { type: 'error', text: "Product successfully removed from Cart" };
        this.isShowLoader = true;

        let cartSessions = this._cartService.getCartSession();
        // console.log("Cart After removal", cartSessions);
        let itemsList = cartSessions["itemsList"];
        const removedItem = itemsList.filter(item => unAvailableItemsIndex.indexOf(item['productId']) != -1);

        itemsList = itemsList.filter(item => unAvailableItemsIndex.indexOf(item['productId']) == -1)
        debugger;
        // const removedItem = itemsList.splice(index, 1);

        let itemsValidationMessage = [];
        for (let i = 0; i < removedItem.length; i++) {
            itemsValidationMessage = this.deleteValidationMessageLocalstorage(removedItem[i], "delete");
            this.commonService.itemsValidationMessage = itemsValidationMessage;
        }
        this.itemsValidationMessage = itemsValidationMessage;
        this.itemsValidationMessage$.emit();


        cartSessions["itemsList"] = itemsList;
        // console.log(cartSessions, "After spliceAfter splice");
        cartSessions = this._cartService.updateCart(cartSessions);

        // Update cart in service
        this._cartService.setCartSession(cartSessions);

        // alert(JSON.stringify(cartSessions));
        // this.isShowLoader = true;
        if (this.isBrowser) {
            if (this.localStorageService.retrieve('user')) {
                let userData = this.localStorageService.retrieve('user');
                if (userData.authenticated == "true") {
                    // console.log(cartSessions, "offerlistofferlistofferlist");
                    if (cartSessions['offersList'] && cartSessions['offersList'].length > 0) {


                        //alert(JSON.stringify(this.cartSession));
                        let reqobj = {
                            "shoppingCartDto": cartSessions
                        }

                        this.applyPromoCodeApi(reqobj).pipe(takeUntil(this.cDistryoyed)).subscribe(
                            res => {
                                // this.isShowLoader = false;
                                // $("#page-loader").hide();
                                if (res['status']) {
                                    if (res['data'].discount < cartSessions['cart']['totalAmount']) {
                                        cartSessions['cart']['totalOffer'] = res['data'].discount;

                                        /**
                                         * Updating offer for each product STARTS.
                                         */
                                        let productDis: Array<string> = Object.keys(res["data"]["productDis"] ? res["data"]["productDis"] : {});
                                        // let itemLists: Array<{}> = sessionDetails["itemsList"]; 
                                        itemsList.map((item) =>
                                            productDis.indexOf(item["productId"]) != -1 ?
                                                item["offer"] = res["data"]["productDis"][item["productId"]]
                                                :
                                                item["offer"] = null
                                        );
                                        cartSessions["itemsList"] = itemsList;
                                    } else {
                                        cartSessions['cart']['totalOffer'] = 0;
                                        cartSessions['offersList'] = [];
                                        itemsList.map((item) =>
                                            item["offer"] = null
                                        );
                                        cartSessions["itemsList"] = itemsList;
                                        //console.log("cart Sesion2" + JSON.stringify(cartSessions));
                                    }
                                    this.updateDeleteCart(cartSessions, { showMessage: showMessage });
                                }
                                else {
                                    cartSessions['cart']['totalOffer'] = 0;
                                    cartSessions['offersList'] = [];
                                    itemsList.map((item) =>
                                        item["offer"] = null
                                    );
                                    cartSessions["itemsList"] = itemsList;
                                    this._cartService.extra.next({ errorMessage: res["statusDescription"] });
                                    this.updateDeleteCart(cartSessions, { showMessage: showMessage });
                                    // this.errorMeesage = res['statusDescription'];
                                }
                            }
                        );
                    }
                    else {
                        this.isShowLoader = false;
                        // $("#page-loader").hide();
                        this._tms.show(showMessage);
                        this._cartService.extra.next({ errorMessage: null });
                        this.updateDeleteCart(cartSessions);

                        // this.errorMeesage = "Promo Code is invalid";

                        //alert("Promo Code is invalid");
                    }
                }
            }
        }
        // }
    }

    applyPromoCode() {

        let cartSession = this._cartService.getCartSession();
        // console.log(cartSession, "applyPromoCode")
        if (this.isBrowser) {
            if (this.uniqueRequestNo == 0) {
                this.uniqueRequestNo = 1;
                //  this.isShowLoader=true;
                // $("#page-loader").show();
                // this.errorMeesage = "";
                let appliedPromoCode = { "promoCode": null, "promoDescription": null };
                if (this.localStorageService.retrieve('user')) {
                    let userData = this.localStorageService.retrieve('user');
                    if (userData.authenticated == "true") {
                        //let obj: Array<any>;
                        let isPromoCodeValid: boolean = true;


                        // console.log(cartSession['offersList'], "cartSession['offersList']cartSession['offersList']cartSession['offersList']");
                        if (cartSession['offersList'] && cartSession['offersList'].length > 0) {


                            //alert(JSON.stringify(cartSession));
                            let reqobj = {
                                "shoppingCartDto": cartSession
                            }

                            // console.log('reqobj', reqobj);

                            this.applyPromoCodeApi(reqobj).subscribe(
                                res => {
                                    //  this.isShowLoader=false;
                                    // $("#page-loader").hide();
                                    if (res['status']) {
                                        if (res['data']['discount'] <= cartSession['cart']['totalAmount']) {
                                            cartSession['cart']['totalOffer'] = res['data']['discount'];
                                            let productDiscount = res['data']['productDis'];
                                            let productDis: Array<string> = Object.keys(res["data"]["productDis"] ? res["data"]["productDis"] : {});
                                            let itemsList: Array<{}> = cartSession["itemsList"];
                                            itemsList.map((item) =>
                                                productDis.indexOf(item["productId"]) != -1 ?
                                                    item["offer"] = res["data"]["productDis"][item["productId"]]
                                                    :
                                                    item["offer"] = null
                                            );
                                            cartSession["itemsList"] = itemsList;
                                            // Updating offer for each product ENDS
                                        } else {
                                            cartSession['cart']['totalOffer'] = 0;
                                            cartSession['offersList'] = [];
                                            let itemsList = cartSession["itemsList"];
                                            itemsList.map((item) => item["offer"] = null);
                                            cartSession["itemsList"] = itemsList;
                                        }
                                        console.log('cartSession 1', Object.assign({}, cartSession));
                                        this._cartService.setCartSession(cartSession);
                                        //this.cartSession['cart']['totalOffer']=res.data.discount
                                        //alert(res.data.discount);
                                        // this.errorMeesage = res.statusDescription;
                                        this.updateCartSessions();
                                    }
                                    else {
                                        cartSession['cart']['totalOffer'] = 0;
                                        cartSession['offersList'] = [];
                                        let itemsList = this.cartSession["itemsList"];
                                        /* this.itemsList.forEach((element,index)=>
                                        {
                                            this.cartSession["itemsList"][index]['offer']=null;
                                        }); */
                                        itemsList.map((item) => item["offer"] = null);
                                        cartSession["itemsList"] = itemsList;
                                        this._cartService.setCartSession(cartSession);
                                        this._cartService.extra.next({ errorMessage: res["statusDescription"] });
                                        this.updateCartSessions();
                                        // this.errorMeesage = res.statusDescription;
                                    }
                                }
                            );
                        }
                        else {
                            //  this.isShowLoader=false;
                            // $("#page-loader").hide();
                            // alert();
                            this._cartService.extra.next({ errorMessage: null });
                            // console.log('condition 1');
                            this.updateCartSessions();

                            // this.errorMeesage = "Promo Code is invalid";

                            //alert("Promo Code is invalid");
                        }
                    }
                    if (userData.authenticated == "false") {
                        //  this.isShowLoader=false;
                        // $("#page-loader").hide();
                        // console.log('condition 2');
                        this.updateCartSessions();
                        //
                        //  this.errorMeesage = "To avail offer,";
                    }
                }
                else {
                    //  this.isShowLoader=false;
                    // $("#page-loader").hide();
                    // console.log('condition 3');
                    this.updateCartSessions();

                    //this.errorMeesage = "To avail offer,";
                }
            }
        }
    }

    navigateTo(route) {
        this.router.navigate(['/']);
    }

    tabIndexUpdated(index, pinCodeStatus: Array<any>) {
        let serviceAvailable: boolean = pinCodeStatus.every((element) => {
            return element.serviceAvailable == true;
        })
        let codAvailable: boolean = pinCodeStatus.every((element) => {
            debugger;
            return element.codAvailable == true;
        });
        this.commonService.cashOnDeliveryStatus.isEnable = codAvailable;

        this.isPaymentValid = false;
        this.isShowLoader = true;

        if (!this.isServer) {
            // $("#page-loader").show();
            let addressList: any = this.checkOutService.getCheckoutAddress();

            let shippingAddress: any = this.checkOutService.getBillingAddress();

            let cart = this.cartSession.cart;
            let obj = {
                "shoppingCartDto": {
                    "cart":
                    {
                        "cartId": cart["cartId"],
                        "sessionId": cart["sessionId"],
                        "userId": cart["userId"],
                        "agentId": cart["agentId"] ? cart["agentId"] : null,
                        "isPersistant": true,
                        "createdAt": null,
                        "updatedAt": null,
                        "closedAt": null,
                        "orderId": null,
                        "totalAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                        "totalOffer": cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                        "totalAmountWithOffer": cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                        "taxes": cart["taxes"] == null ? 0 : cart["taxes"],
                        "totalAmountWithTaxes": cart["totalAmountWithTax"],
                        "shippingCharges": cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                        "currency": cart["currency"] == null ? "INR" : cart["currency"],
                        "isGift": cart["gift"] == null ? false : cart["gift"],
                        "giftMessage": cart["giftMessage"],
                        "giftPackingCharges": cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                        "totalPayableAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"]
                    },
                    "itemsList": this.commonService.getItemsList(this.cartSession.itemsList),
                    "addressList": [
                        {
                            "addressId": addressList.idAddress,
                            "type": "shipping",
                            "invoiceType": this.checkOutService.getInvoiceType()
                        }
                    ],
                    "payment": null,
                    "deliveryMethod": {
                        "deliveryMethodId": 77,
                        "type": "kjhlh"
                    },
                    "offersList": (this.cartSession.offersList != undefined && this.cartSession.offersList.length > 0) ? this.cartSession.offersList : null
                }
            };

            if (cart['buyNow']) {
                obj['shoppingCartDto']['cart']['buyNow'] = true;
            }

            if (shippingAddress !== undefined && shippingAddress !== null) {
                obj.shoppingCartDto.addressList.push({
                    "addressId": shippingAddress.idAddress,
                    "type": "billing",
                    "invoiceType": this.checkOutService.getInvoiceType()

                })
            }
            this.commonService.validateCartBeforePayment(obj).subscribe(res => {
                this.isShowLoader = false;
                if (res.status && res.statusCode == 200) {
                    let userSession = this._localAuthService.getUserSession();
                    let criteoItem = [];

                    let eventData = {
                        'prodId': '',
                        'prodPrice': 0,
                        'prodQuantity': 0,
                        'prodImage': '',
                        'prodName': '',
                        'prodURL': ''
                    };
                    for (let p = 0; p < this.cartSession["itemsList"].length; p++) {
                        criteoItem.push({ name: this.cartSession["itemsList"][p]['productName'], id: this.cartSession["itemsList"][p]['productId'], price: this.cartSession["itemsList"][p]['productUnitPrice'], quantity: this.cartSession["itemsList"][p]['productQuantity'], image: this.cartSession["itemsList"][p]['productImg'], url: CONSTANTS.PROD + '/' + this.cartSession["itemsList"][p]['productUrl'] });
                        eventData['prodId'] = this.cartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
                        eventData['prodPrice'] = this.cartSession["itemsList"][p]['productUnitPrice'] + eventData['prodPrice'];
                        eventData['prodQuantity'] = this.cartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
                        eventData['prodImage'] = this.cartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
                        eventData['prodName'] = this.cartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
                        eventData['prodURL'] = this.cartSession["itemsList"][p]['productUrl'] + ', ' + eventData['prodURL'];
                    }
                    /*Start Criteo DataLayer Tags */
                    dataLayer.push({
                        'event': 'viewBasket',
                        'email': (userSession && userSession.email) ? userSession.email : '',
                        'currency': 'INR',
                        'productBasketProducts': criteoItem,
                        'eventData': eventData
                    });
                    /*End Criteo DataLayer Tags */

                    dataLayer.push({
                        'event': 'checkout',
                        'ecommerce': {
                            'checkout': {
                                'actionField': { 'step': 4, 'option': 'payment' },
                                'products': criteoItem
                            }
                        },
                    });

                    this.tabIndex = index;
                    this.updateTabIndex.emit(this.tabIndex);
                }
                else {
                    this._tms.show({ type: 'error', text: res.statusDescription });
                    this.isPaymentValid = true;
                    this.paymnetValidationMessage = res.statusDescription;
                }
            });
        }
    }

    removeShippingClass() {
        if (this.isBrowser) {
            document.querySelector('.all_charge_mob').classList.remove('in');
        }
    }

    removeDiscountClass() {
        if (this.isBrowser) {
            document.querySelector('.all_charge_mob').classList.remove('in');
        }
    }

    togglePricing(i) {
        this.allCharges[i] = !this.allCharges[i];
    }

    toggleMobiledetails(i) {
        this.toggleDetails[i] = !this.toggleDetails[i];
    }
    onUpdate(data) {
        if (data.popupClose) {
            this.sbm = { index: null }
        }
    }

    ngOnDestroy() {
        this._state.unsubscribe("cart.rui", 0);
        this.commonService.itemsValidationMessage = [];
        if (this.validatationSub >= 0) this._state.unsubscribe('validationCheck', this.validatationSub);

        if (!this.isServer) {
            // $("#page-loadoer").hide();
        }

        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }
    getProductId(productId) {
        this.pid = productId;
    }


    addToPurchaseList() {
        // console.log("productId",this.pid);
        // console.log("1");
        // console.log("is purchse list product",this.isPurcahseListProduct);
        if (this.isPurcahseListProduct) {
            // console.log("2")
            this.removeItemFromPurchaseList();
        } else {
            // console.log("4");
            if (this.localStorageService.retrieve('user')) {
                const user = this.localStorageService.retrieve('user');
                if (user && user.authenticated == "true" && user.userType == "business") {
                    // console.log(this.productResult);
                    const userSession = this._localAuthService.getUserSession();
                    this.isPurcahseListProduct = true;
                    const obj = {
                        "idUser": userSession.userId,
                        "userType": "business",
                        // "idProduct": this.productResult['partNumber'],
                        "idProduct": this.pid,

                        "productName": this.productResult.productName,
                        "description": this.productResult.fulldescription,
                        "brand": this.productResult.brand,
                        "category": this.productResult.id_category_default
                    };
                    this._productService.addToPurchaseList(obj).subscribe((res) => {
                        //   console.log("status",res["status"]);
                        if (res["status"]) {
                            dataLayer.push({
                                'event': 'addToPurchaseList'
                            });
                        }
                    })
                }
            }
        }
        this.sbm.index = null;

    }
    cancelPopup() {
        this.sbm.index = null;
    }

    removeItemFromPurchaseList() {
        this.commonService.showLoader = true;
        const userSession = this._localAuthService.getUserSession();

        const obj = {
            "idUser": userSession.userId,
            "userType": "business",
            "idProduct": this.productId,
            "productName": this.productResult.productName,
            "description": this.productResult.fulldescription,
            "brand": this.productResult.brand,
            "category": this.productResult.id_category_default
        }
        // console.log("remove item fro product resiult obj");

        this._productService.removePurchaseList(obj).subscribe(
            res => {
                if (res["status"]) {
                    dataLayer.push({
                        'event': 'removeFromPurchaseList'
                    });
                    this.getPurchaseList();
                } else {
                    this.commonService.showLoader = false;
                }
            },
            err => {
                this.commonService.showLoader = false;
            }
        )
    }
    getGroupedProduct() {
        // console.log(" get grouped product");
        this.commonService.showLoader = true;

        if (this._tState.hasKey(PD)) {
            this.commonService.showLoader = false;
            const productResponse = this._tState.get(PD, {});
            this.setProductDetails(productResponse);
        } else {
            // let  user_id = this.localStorageService.retrieve('user') ? this.localStorageService.retrieve('user').userId : null 

            this._productService.getGroupProductObj(this.productId).subscribe(
                (r) => {
                    // console.log("r data",r)
                    this.commonService.showLoader = false;
                    // if (r['status']) {
                    if (this.isServer) {
                        this._tState.set(PD, r);
                    }
                    if (r['active'])
                        this.setProductDetails(r);
                    // }
                }, error => {
                    // console.log("in error",error);
                    this.commonService.showLoader = false;
                });
        }
    }

    checkProductType(categoryCode) {
        this.isCommonProduct = true;
        if (categoryCode == "116111700") {
            this.isCommonProduct = false;
        }
    }
    changeBulkPriceTable() {
        this.productResult['bulkPrice'].forEach((element, index) => {
            if (!element.active) {
                this.productResult['bulkPrice'].splice(index, 1)
            }
        });
        let isvalid: boolean = true;
        let minQty = 0;
        if (this.productResult['bulkPrice'].length > 0) {
            minQty = this.productResult['bulkPrice'][0].minQty;
        }

        this.productResult['bulkPrice'].forEach((element, index) => {

            if (this.productResult['minimal_quantity'] == minQty || !isvalid) {
                isvalid = false;
                element.minQty = element.minQty + 1;
                if (this.productResult['bulkPrice'].length - 1 !== index)
                    element.maxQty = element.maxQty + 1;
            }
            if (isvalid && this.productResult['minimal_quantity'] > minQty && this.productResult['minimal_quantity'] > 1) {

                element.minQty = element.minQty + this.productResult['minimal_quantity'];
                if (this.productResult['bulkPrice'].length - 1 !== index)
                    element.maxQty = element.maxQty + this.productResult['minimal_quantity'];
            }
        });

    }
    getDescription(description: string) {

        if (description.length > 200) {
            this.productResult['description'] = description.substring(0, 199);

            this.isProductDescriptionLarge = true;

        }
    }
    getReviewsRating() {
        // if (!this.tstate.hasKey(REVIEW_RATING_SERVER)) {
        let obj = {
            review_type: "PRODUCT_REVIEW",
            item_type: "PRODUCT",
            item_id: (this.productResult['partNumber']).toLowerCase(),
            user_id: " "
        }
        if (this._tState.hasKey(RRD)) {
            this.reviews = this._tState.get(RRD, {});
            this.setReviewRatingData();
        } else {
            this._productService.getReviewsRating(obj).subscribe(
                res => {
                    this.reviews = res['data'];
                    if (this.isServer) {
                        this._tState.set(RRD, res['data']);
                    }
                    this.setReviewRatingData();
                }
            );
        }


    }
    setReviewRatingData() {
        if (this.reviews && this.reviews.reviewList) {
            this.reviewLength = this.reviews.reviewList.length;
            this.reviews.reviewList.forEach(element => {
                element['isPost'] = false;
                element['yes'] = 0;
                element['no'] = 0;
                if (element.is_review_helpful_count_yes)
                    element['yes'] = Number(element.is_review_helpful_count_yes['value']);
                if (element.is_review_helpful_count_no)
                    element['no'] = Number(element.is_review_helpful_count_no['value']);
                element['totalReview'] = element['yes'] + element['no']
            });
        }
        let inStock = this.productResult['quantity'] > 0 ? CONSTANTS.SCHEMA + "/InStock" : CONSTANTS.SCHEMA + "/OutOfStock";
        let reviewCount = this.reviews.summaryData.review_count > 0 ? this.reviews.summaryData.review_count : 1;
        let ratingValue = this.reviews.summaryData.final_average_rating > 0 ? this.reviews.summaryData.final_average_rating : 3.5;

        if (this.isServer) {
            let s = this._renderer2.createElement('script');
            s.type = "application/ld+json";
            s.text = JSON.stringify({ "@context": CONSTANTS.SCHEMA, "@type": "Product", "name": this.productResult['productName'], "image": this.productResult['productImage'], "description": this.productResult['fulldescription'], "brand": this.productResult['brand'], "offers": { "@type": "Offer", "price": (this.productResult['price'] * this.productResult['minimal_quantity']).toString(), "priceCurrency": "INR", "availability": inStock, "url": CONSTANTS.PROD + this.productResult['url'], "ItemOffered": "Product", "areaServed": "IN", "itemCondition": CONSTANTS.SCHEMA + "/NewCondition", "sku": this.productId, "acceptedPaymentMethod": [{ "name": "COD" }, { "name": "ByBankTransferInAdvance" }, { "name": "PaymentMethodCreditCard" }, { "name": "MasterCard" }, { "name": "VISA" }] }, "aggregateRating": { "@type": "AggregateRating", "ratingValue": ratingValue, "ratingCount": reviewCount, "bestRating": "5", "worstRating": "1" } });
            this._renderer2.appendChild(this._document.head, s);
        }

        // links.tex
        this.sortReviewsList("date");
        this.setProductRating(this.reviews.summaryData.final_average_rating);
    }
    setProductRating(rating) {
        if (rating == 0 || rating == null) {
            this.starsCount = 0;
            this.productResult['rating'] = 0;
        }
        else if (rating < 3.5) {
            this.starsCount = 3.5;
            this.productResult['rating'] = 3.5;
        }
        else {
            this.starsCount = rating;
            this.productResult['rating'] = rating;
        }
    }
    sortReviewsList(sortType) {
        //alert(sortType);
        this.selectedReviewType = sortType;
        let list = this.reviews.reviewList;
        if (sortType === "helpful") {

            list.sort((a, b) => {
                return b.yes - a.yes;
            });
            //console.log(list);
        }

    }
    isQuestionApihit: boolean = false;
    getQuestionsAnswers(productId) {
        this.isQuestionApihit = false;
        if (this._tState.hasKey(QAD)) {
            this.questionAnswerList = this._tState.get(QAD, {});
            this.isQuestionApihit = true;
            // console.log(JSON.stringify(this.questionAnswerList) + "           similar product parmod                     ")
            /* if (isPlatformBrowser(this.platformId)) {
                this.tstate.remove(QUESTION_ANSWER_SERVER);
            } */

        }
        else {
            this._productService.getQuestionsAnswers(productId).subscribe(
                data => {
                    let res = data;
                    if (res['statusCode'] == 200) {
                        this.questionAnswerList = res;
                        if (this.isServer) {
                            this._tState.set(QAD, this.questionAnswerList);
                        }
                        this.isQuestionApihit = true;
                    }

                }
            );
        }
    }
    setRecentlyViewedItems() {
        // let productList = [];
        // let isElementFound: boolean = false;
        // if (!this.localStorageService.retrieve("recentProduct")) {
        //     this.localStorageService.store("recentProduct", []);
        // }
        // productList = this.localStorageService.retrieve("recentProduct");
        // productList.forEach((element) => {
        //     if (element.partNumber === product.partNumber) {
        //         isElementFound = true;
        //     }
        // });
        // if (!isElementFound && product.priceWithoutTax) {
        //     productList.push(product);
        // }
        // if (productList.length > 10) {
        //     productList.shift();
        // }
        // ;
        // this.localStorageService.store("recentProduct", productList);
        // this.recentProductList = this.localStorageService.retrieve("recentProduct");
        // alert(this.recentProductList.length);
    }
    getGTMData() {
        if (!this.isServer) {
            // console.log(this.productResult['outOfStock'], "this.productResult['outOfStock']");
            // Below datalayer is only for oos product.
            if (this.productResult['outOfStock']) {
                dataLayer.push({
                    'event': 'rqnProductPage',
                    'ecommerce': {
                        "rqn_product_name": this.productResult['productName']
                    }
                });
            }
            dataLayer.push({
                'event': 'productView',
                'ecommerce': {
                    'detail': {
                        'actionField': { 'list': (this.gaGtmData && this.gaGtmData['list']) ? this.gaGtmData['list'] : "" },                         // Local currency is optional.
                        'products': [
                            {
                                'name': this.productResult['productName'],       // Name or ID of the product is required.
                                'id': this.productId,
                                'price': this.productResult['priceWithoutTax'],
                                'brand': this.productResult['brand'],
                                'category': (this.gaGtmData && this.gaGtmData['category']) ? this.gaGtmData['category'] : this.productResult['categoryName'],
                                'variant': ''
                            }]
                    }
                },
            });

            let google_tag_params = {
                ecomm_prodid: this.productId,
                ecomm_pagetype: 'product',
                ecomm_totalvalue: parseFloat(this.productResult['priceWithoutTax'])
            };

            dataLayer.push({
                'event': 'dyn_remk',
                'ecomm_prodid': google_tag_params.ecomm_prodid,
                'ecomm_pagetype': google_tag_params.ecomm_pagetype,
                'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
                'google_tag_params': google_tag_params
            });
            let user;
            if (this.localStorageService.retrieve('user')) {
                user = this.localStorageService.retrieve('user');
                //console.log("User data:" + JSON.stringify(user));
            }

            /*Start Criteo DataLayer Tags */
            dataLayer.push({
                'event': 'viewItem',
                'email': (user && user["email"]) ? user["email"] : '',
                'ProductID': this.productId
            });
            /*End Criteo DataLayer Tags */

        }
    }
    setMetatag() {

        let title = this.productResult['productName'];
        const pwot = this.productResult['priceWithoutTax'];
        if (pwot && pwot > 0) {
            title += " - Buy at Rs." + this.productResult['priceWithoutTax']
        }
        this.pageTitle.setTitle(title);
        let metaDescription = '';
        // let title = (this.productResult["productBO"]["categoryDetails"][0]["seoDetails"]["title"] != undefined && this.productResult["productBO"]["categoryDetails"][0]["seoDetails"]["title"] != null && this.productResult["productBO"]["categoryDetails"][0]["seoDetails"]["title"] != "") ? this.productResult["productBO"]["categoryDetails"][0]["seoDetails"]["title"] : "Buy " + this.productResult["productBO"].productName + " at Best Price in India -Moglix" + this.productResult["productBO"]["categoryDetails"][0].categoryName;
        if (this.productResult["productBO"]["seoDetails"] && this.productResult["productBO"]["seoDetails"]["metaDescription"] != undefined && this.productResult["productBO"]["seoDetails"]["metaDescription"] != null && this.productResult["productBO"]["seoDetails"]["metaDescription"] != "")
            metaDescription = this.productResult["productBO"]["seoDetails"]["metaDescription"]
        else
            metaDescription = "Buy " + this.productResult['productName'] + " Online in India at moglix. Shop from the huge range of " + this.productResult['brand'] + " " + this.productResult['category'] + ". ✯ Branded " + this.productResult['category'] + " ✯ Lowest Price ✯ Best Deals ✯ COD";
        this.meta.addTag({ "name": "description", "content": metaDescription });

        this.meta.addTag({ "name": "og:description", "content": metaDescription })
        this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + "/" + this.productResult['url'] })
        this.meta.addTag({ "name": "og:title", "content": title })
        this.meta.addTag({ "name": "og:image", "content": this.productResult['productImage'] })
        this.meta.addTag({ "name": "robots", "content": CONSTANTS.META.ROBOT });
        this.meta.addTag({ "name": "keywords", "content": this.productResult['productName'] + ", " + this.productResult['categoryName'] + ", " + this.productResult['brand'] });
        if (this.isServer) {
            let links = this._renderer2.createElement('link');
            links.rel = "canonical";
            let url = this.productResult['canonicalUrl'];
            if (url.substring(url.length - 2, url.length) == "-g") {
                url = url.substring(0, url.length - 2);
            }
            links.href = CONSTANTS.PROD + "/" + url;
            this._renderer2.appendChild(this._document.head, links);
        }
    }
    rfqUrl: Array<any> = [];
    filterName = "filtername";
    goToRfqPage() {
        let productName: string = this.productResult['productName'];
        this.rfqUrl = productName.split(/[()]+/);
        this.filterName = "filtername";
        if (this.rfqUrl.length >= 2) {
            this.filterName = this.rfqUrl[1];
        }
    }
    getProductDetailAccordingToSize(productDetailArg, isSeoData) {

        //console.log("produyct Data:" + JSON.stringify(productDetailArg));
        let productDetail = productDetailArg.value;

        let priceQuantityCountry = productDetail.productPriceQuantity['india'];
        this.productResult['partNumber'] = productDetailArg.key;
        this.productId = productDetailArg.key;

        this.productResult['productName'] = productDetail.variantName;
        this.productResult['quantity'] = priceQuantityCountry.quantityAvailable;
        this.productResult['packageUnit'] = priceQuantityCountry.packageUnit;
        this.productResult['minimal_quantity'] = priceQuantityCountry.moq;
        this.productResult['available_now'] = '';
        this.productResult['available_later'] = '';
        this.productResult['price'] = priceQuantityCountry.sellingPrice;
        this.productResult['priceWithoutTax'] = priceQuantityCountry.priceWithoutTax;
        this.productResult['quantity_avail'] = priceQuantityCountry.quantityAvailable;

        this.productResult['default_attribute_mrp'] = priceQuantityCountry.mrp;
        this.productResult['mrp'] = priceQuantityCountry.mrp;

        let disc = 0;
        if (priceQuantityCountry.mrp > 0 && this.productResult['priceWithoutTax'] > 0) {
            disc = (((priceQuantityCountry.mrp - this.productResult['priceWithoutTax']) / priceQuantityCountry.mrp) * 100)
        }
        this.productResult['discount'] = disc;
        this.productResult['outOfStock'] = priceQuantityCountry.outOfStockFlag;
        // alert(this.productResult['outOfStock'])

        /*Product Specification: Attributes*/
        this.productResult['attributes'] = productDetail.attributes;
        this.productResult['rating'] = productDetail.productRating;

        this.productResult['url'] = productDetail.canonicalUrl;
        // this.productResult['canonicalUrl'] = productDetail.canonicalUrl;        
        let productAllImages = [];
        productDetail.images.forEach(element => {
            productAllImages.push(
                {
                    src: this.imagePath + "" + element.links.xlarge,
                    caption: this.imagePath + "" + element.links.icon,
                    thumb: this.imagePath + "" + element.links.icon,
                    medium: this.imagePath + "" + element.links.medium,
                    xxlarge: this.imagePath + "" + element.links.xxlarge,

                }
            )
        });
        if (priceQuantityCountry.bulkPrices && priceQuantityCountry.bulkPrices['india'])
            this.productResult['bulkPrice'] = priceQuantityCountry.bulkPrices['india'];
        else {
            this.productResult['bulkPrice'] = null;
        }
        this.productResult['bulkPriceWithSameDiscount'] = priceQuantityCountry.bulkPrices
        // alert(JSON.stringify(productObject['bulkPrice']));


        if (this.productResult['bulkPrice'] !== null) {
            this.productResult['bulkPrice'].forEach(element => {
                if (priceQuantityCountry.mrp > 0) {
                    element.discount = ((priceQuantityCountry.mrp - element.bulkSPWithoutTax) / priceQuantityCountry.mrp) * 100;
                }
                else {
                    element.discount = element.discount;
                }
            });
            this.changeBulkPriceTable();

        }
        this.goToRfqPage();

        if (isSeoData)
            this.setMetatag();

    }
    setProductDetails(data) {
        let productObject = {};
        let priceQuantityCountry, partReference, disc;
        // let data = productApiResult;
        this.isProductValid = data.status;
        if (data.status) {
            data = data.productBO;

            productObject['productBO'] = data;
            productObject['productName'] = data.productName;
            productObject['partNumber'] = data.partNumber;
            productObject['outOfStock'] = data.outOfStock;
            productObject['brandDetails'] = data.brandDetails;
            productObject['brand'] = data.brandDetails.brandName;
            productObject['manuDetails'] = data.manufDetails;
            productObject['id_brand'] = data.brandDetails.idBrand;
            productObject['id_category_default'] = data.categoryDetails[0].categoryCode;
            this.checkProductType(data.categoryDetails[0].categoryCode);
            productObject['description'] = data.desciption;

            productObject['fulldescription'] = data.desciption;

            productObject['description_short'] = data.shortDesc;
            productObject['product_rating'] = data.productRating;
            productObject['product_stars'] = productObject['product_rating'] / 5 * 100;
            productObject['active'] = '1';
            productObject['available_for_order'] = '1';
            productObject['category'] = data.categoryDetails[0].categoryName;
            productObject['is_grouped'] = data.partNumber;
            productObject['product_url'] = data.partNumber;
            productObject['key_features'] = data.keyFeatures;

            productObject['canonical_url'] = data.partNumber;

            productObject['canonical_url'] = data.partNumber;
            productObject['main_category'] = data.partNumber;

            productObject['InStock'] = 1;

            productObject['group_elements'] = data.productPartDetails;

            partReference = data.partNumber;
            this.productId = partReference;
            // alert(data);
            priceQuantityCountry = data.productPartDetails[partReference].productPriceQuantity['india'];

            productObject['quantity'] = priceQuantityCountry.quantityAvailable;
            productObject['packageUnit'] = priceQuantityCountry.packageUnit;
            productObject['minimal_quantity'] = priceQuantityCountry.moq;
            productObject['available_now'] = '';
            productObject['available_later'] = '';
            productObject['price'] = priceQuantityCountry.sellingPrice;
            productObject['priceWithoutTax'] = priceQuantityCountry.priceWithoutTax;
            productObject['quantity_avail'] = priceQuantityCountry.quantityAvailable;
            productObject['default_attribute_mrp'] = priceQuantityCountry.mrp;
            productObject['mrp'] = priceQuantityCountry.mrp;
            productObject['estimatedDelivery'] = priceQuantityCountry.estimatedDelivery;
            productObject['FreeShippingMinAmount'] = CONSTANTS.CONST_VAR.FreeShippingMinAmount;
            productObject['productPartDetails'] = data.productPartDetails[partReference];
            productObject['taxPercentage'] = priceQuantityCountry.taxRule.taxPercentage;
            // productObject['discount']=((productObject['mrp']-productObject['price'])/productObject['mrp'])/100;
            if (priceQuantityCountry.mrp > 0 && productObject['priceWithoutTax'] > 0) {
                disc = (((priceQuantityCountry.mrp - productObject['priceWithoutTax']) / priceQuantityCountry.mrp) * 100)
            }
            productObject['discount'] = disc;
            productObject['outOfStock'] = priceQuantityCountry.outOfStockFlag;

            /*Product Specification: Attributes*/
            productObject['attributes'] = data.productPartDetails[partReference].attributes;
            productObject['url'] = data.productPartDetails[partReference].canonicalUrl;
            productObject['canonicalUrl'] = this.isCommonProduct ? data.productPartDetails[data['partNumber']].canonicalUrl : data.productPartDetails[data['defaultPartNumber']].canonicalUrl;
            let productAllImages = [];
            data.productPartDetails[partReference].images.forEach(element => {
                productAllImages.push(
                    {
                        src: this.imagePath + "" + element.links.xlarge,
                        caption: this.imagePath + "" + element.links.icon,
                        thumb: this.imagePath + "" + element.links.icon,
                        medium: this.imagePath + "" + element.links.medium,
                        xxlarge: this.imagePath + "" + element.links.xxlarge

                    }
                )
            });
            this.updateImg['large'] = productAllImages[0]['xxlarge'];
            productObject['productAllImage'] = productAllImages;
            productObject['productImage'] = CONSTANTS.IMAGE_BASE_URL + data.productPartDetails[partReference].images[0].links.medium;
            productObject['productSmallImage'] = CONSTANTS.IMAGE_BASE_URL + data.productPartDetails[partReference].images[0].links.small;
            productObject['productZoomImage'] = CONSTANTS.IMAGE_BASE_URL + data.productPartDetails[partReference].images[0].links.xxlarge;
            productObject['shortDesc'] = data.shortDesc;
            productObject['bulkPriceWithSameDiscount'] = priceQuantityCountry.bulkPrices; //no change in discount from api
            // alert(JSON.stringify(productObject['bulkPriceWithSameDiscount']));
            if (priceQuantityCountry.bulkPrices !== null && priceQuantityCountry.bulkPrices['india']) {
                productObject['bulkPrice'] = priceQuantityCountry.bulkPrices['india'];

            }
            else {
                productObject['bulkPrice'] = null;
            }


            if (priceQuantityCountry.taxRule && priceQuantityCountry.taxRule.taxPercentage) {
                productObject['taxPercentage'] = priceQuantityCountry.taxRule.taxPercentage;
                // productObject['sellingPriceWithoutTax'] = productObject['price'] / (1 + productObject['taxPercentage'] / 100);
                productObject['tax'] = Number(productObject['price']) - Number(productObject['priceWithoutTax'])
            }
            else {
                productObject['tax'] = 0;
            }

            this.productResult = productObject;

            if (productObject['description'] && productObject['description'] !== null && productObject['description'] !== undefined) {
                this.getDescription(productObject['description']);
            }
            // alert(priceQuantityCountry.bulkPrices!==null);

            if (productObject['bulkPrice'] !== null) {


                productObject['bulkPrice'].forEach(element => {
                    if (priceQuantityCountry.mrp > 0) {
                        element.discount = ((priceQuantityCountry.mrp - element.bulkSellingPrice) / priceQuantityCountry.mrp) * 100;
                    }
                    else {
                        element.discount = element.discount;
                    }
                });
                this.changeBulkPriceTable();


            }

            //if(!this.isServer)
            let bData = { categoryLink: this.isCommonProduct ? this.productResult['url'] : this.productResult['url'] + "-g", page: "product" };
            this.breadcrumpUpdated.next(bData);

            //call similar products
            let categoryCode = data.categoryDetails[0].categoryCode;
            this.productResult['categoryCode'] = data.categoryDetails[0].categoryCode;
            this.productResult['categoryName'] = data.categoryDetails[0].categoryName;
            let productName = data.productName;
            this.getQuestionsAnswers(this.productResult['partNumber']);
            this.getReviewsRating();

            if (this.isBrowser)
                this.setRecentlyViewedItems();

            if (this.isCommonProduct)
                this.setMetatag();
            this.goToRfqPage();
            this.getGTMData();

            if (!this.isCommonProduct) {
                let productArray = this.objectToArray.transform(data.productPartDetails, "associative");
                let showFirstEnableSheosIndex = 0;
                //let i=0;
                productArray.forEach((element, index) => {

                    let extra = [];
                    // if(element.attributes==)
                    // {
                    //    extra.push()
                    // }
                    for (let key of element.value.attributes) {
                        if (key == "Antiskid" || key == "Oil Resistant" || key == "Heat Resistant" || key == "Puncture Resistant" || key == "Impact Resistant" || key == "Chemical Resistant" || key == "Toe Type" || key == "Waterproof") {
                            extra.push(key);
                        }
                    }

                    //  alert(element.value.productPriceQuantity['india'].outOfStockFlag);
                    this.productSizes.push({
                        size: parseInt(element.value.attributes.Size[0]),
                        key: element.key,
                        value: element.value,
                        extra: extra,
                        isOutOfStock: element.value.productPriceQuantity['india'].outOfStockFlag
                    });
                });

                this.productSizes.sort(function (a, b) {
                    return a.size - b.size
                });
                let i = 0;
                let titleMetaIndex = 0;
                this.productSizes.forEach((element, index) => {
                    if (element.key == this.productId) {
                        titleMetaIndex = index;
                    }
                    if (!element.isOutOfStock && i == 0) {
                        showFirstEnableSheosIndex = index;
                        i++;
                    }
                })
                this.getProductDetailAccordingToSize(this.productSizes[titleMetaIndex], true);
                this.getProductDetailAccordingToSize(this.productSizes[showFirstEnableSheosIndex], false);
            }
            if (this.isMobile) {
                this.sOptions.perPage = 2;
            }
            if (this._tState.hasKey(SPD)) {
                this.similarProducts = this._tState.get(SPD, []);
            }
            else {
                this._productService.getSimilarProducts(productName, categoryCode).subscribe(
                    data => {
                        let sp = [];
                        data['products'].forEach(product => {
                            let spitem = {
                                productUrl: product['productUrl'],
                                mainImageLink: product['mainImageLink'],
                                productName: product['productName'],
                                salesPrice: product['salesPrice'],
                                priceWithoutTax: product['priceWithoutTax'],
                                brandName: product['productUrl'],
                                mrp: product['mrp'],
                                discount: product['discount']
                            }
                            spitem['shortDesc'] = [];
                            let result = product.shortDesc.split("||");
                            result.forEach(element => {
                                let keyvalue = element.split(':');
                                spitem['shortDesc'].push({ 'key': keyvalue[0], 'value': keyvalue[1] })
                            })
                            sp.push(spitem);
                        })
                        // for(let i=0; i<data['products'].length; i++){
                        //     let spitem = {
                        //         productlink:data['products'][i]['productUrl'],
                        //         imageLink_medium: data['products'][i]['mainImageLink'],
                        //         imageLink_small: null,
                        //         productName:data['products'][i]['productName'],
                        //         sellingPrice:data['products'][i]['salesPrice'],
                        //         brandName:data['products'][i]['productUrl'],
                        //         mrp: data['products'][i]['mrp'],
                        //         discount: data['products'][i]['discount']
                        //     }
                        //     sp.push(spitem);
                        // }
                        this.similarProducts = sp;
                        if (this.isServer)
                            this._tState.set(SPD, this.similarProducts)
                    })
            }
            // }
            if (this.isBrowser) {
                this.commonService.showLoader = false;
            }

        }

    }

    getPurchaseList() {
        this.isPurcahseListProduct = false;
        //alert('ok');
        if (this.localStorageService.retrieve('user')) {
            let user = this.localStorageService.retrieve('user');

            if (user.authenticated == "true") {
                let request = { idUser: user.userId, userType: "business" };
                this._productService.getPurchaseList(request).subscribe((res) => {
                    this.commonService.showLoader = false;
                    if (res['status'] && res['statusCode'] == 200) {
                        let purchaseLists: Array<any> = []
                        purchaseLists = res['data'];
                        purchaseLists.forEach(element => {
                            if (element.productDetail.productBO.partNumber == this.productId) {
                                this.isPurcahseListProduct = true;
                            }

                        });

                    }
                })
            }
        }
    }
    checkPinCodeAddress(index, continueToNextTab) {
        debugger;
        let itemsList: Array<any> = (this.cartSession["itemsList"] != undefined && this.cartSession["itemsList"] != null) ? this.cartSession["itemsList"] : [];
        let allPinCodeStatus: Array<any> = [];
        let codNotAvailable: Array<any> = [];
        console.log(itemsList);


        //below map is created just to avoid nsquare complaxity
        const itemsListMap = itemsList.reduce(function (acc, obj) {
            const { productId } = obj;
            return acc[productId] = obj;
        }, {});
        const checkoutAddress = this.checkOutService.getCheckoutAddress();
        let pinCode = checkoutAddress['postCode'];
        const msnArr = itemsList.map(item => item.productId);
        this.commonService.checkPincodeApi({ productId: msnArr, toPincode: pinCode })
            .pipe(
                takeUntil(this.cDistryoyed),
                catchError((err) => {
                    return of(null);
                })
            )
            .subscribe((res) => {
                if (res && res.status && res.statusCode == 200) {
                    for (let productId in res["data"]) {
                        const partNumber = res["data"][productId];
                        let pinCodeStatus = { codAvailable: true, serviceAvailable: true };
                        //list of cod unavailable msns
                        if (partNumber.aggregate.codAvailable == false) {
                            for (let items of itemsList) {
                                if (items.productId == partNumber.aggregate.productId) {
                                    codNotAvailable.push(items)
                                }
                            }
                            this._cartService.codNotAvailableObj['itemsArray'] = codNotAvailable;
                        }
                        if (partNumber.aggregate.codAvailable) {
                            pinCodeStatus.codAvailable = true;
                        }
                        else {
                            pinCodeStatus.codAvailable = false;
                        }
                        if (partNumber.aggregate.serviceable) {
                            pinCodeStatus.serviceAvailable = true;
                        }
                        else {
                            pinCodeStatus.serviceAvailable = false;
                        }

                        allPinCodeStatus.push(pinCodeStatus);
                    }
                    if (allPinCodeStatus.length === itemsList.length && continueToNextTab) {
                        this.tabIndexUpdated(index, allPinCodeStatus);
                    }
                }
            })


        // itemsList.forEach((element, i) => {
        //     let pinCodeStatus = { codAvailable: true, serviceAvailable: true };
        //     const checkoutAddress = this.checkOutService.getCheckoutAddress();
        //     console.log(checkoutAddress, "hey1");
        //     let pinCode = checkoutAddress['postCode'];
        //     console.log(pinCode, "hey2");
        //     this._productService.checkPincodeApi(element.productId, pinCode).subscribe(
        //         response => {
        //             debugger;
        //             // this.isPincodeAvailble = true;
        //             if (response["data"] !== null && response["statusCode"] == 200) {
        //                 //alert(i);
        //                 let partNumber = response["data"][element.productId];

        //                 //list of cod unavailable msns
        //                 if (partNumber.aggregate.codAvailable == false) {
        //                     codNotAvailable.push(element);
        //                     this._cartService.codNotAvailableObj['itemsArray'] = codNotAvailable;

        //                 }
        //                 if (partNumber.aggregate.codAvailable) {
        //                     pinCodeStatus.codAvailable = true;
        //                 }
        //                 else {
        //                     pinCodeStatus.codAvailable = false;
        //                 }
        //                 if (partNumber.aggregate.serviceable) {
        //                     pinCodeStatus.serviceAvailable = true;
        //                 }
        //                 else {
        //                     pinCodeStatus.serviceAvailable = false;
        //                 }

        //                 allPinCodeStatus.push(pinCodeStatus);
        //             }
        //             else {
        //                 pinCodeStatus.codAvailable = false;
        //                 pinCodeStatus.serviceAvailable = false;
        //                 allPinCodeStatus.push(pinCodeStatus);
        //             }
        //             console.log(allPinCodeStatus, itemsList, "inner");
        //             console.log(index, "index");
        //             if (allPinCodeStatus.length === itemsList.length && continueToNextTab) {
        //                 this.tabIndexUpdated(index, allPinCodeStatus);
        //             }
        //         });

        // });

    }
    showPopup(i) {
        this.sbm.index = i;
        this.removePopup = true;
    }
    cancelRemove() {
        this.removePopup = false;
    }

    redirectToProductURL(isRedirect, url) {
        this.commonService.setSectionClickInformation('cart', 'pdp');
        if (isRedirect) {
            this.router.navigateByUrl('/' + url);
        }
        return false;
    }

    applyPromoCodeApi(obj) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.validatePromoCode;
        return this.dataService.callRestful('POST', url, { body: obj });
    }

    getShippingCharges(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getShippingValue;
        return this.dataService.callRestful("POST", url, { body: obj }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    getAllPromoCodesByUserId(userID) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getAllActivePromoCodes + '?userId=' + userID;
        return this.dataService.callRestful('GET', url).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }

    getPromoCodeDetailById(offerId) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CART.getPromoCodeDetails + '?promoId=' + offerId;
        return this.dataService.callRestful('GET', url).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({ status: false, statusCode: res.status });
            })
        );
    }


}
