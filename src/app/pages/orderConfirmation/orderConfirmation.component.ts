import { GlobalSessionStorageService } from './../../utils/services/global-session-storage.service';
import { Component, OnInit, ComponentFactoryResolver, Injector, ViewChild, ViewContainerRef, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { OrderConfirmationService } from './orderConfirmation.service';
import { DataService } from '@app/utils/services/data.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { FooterService } from '@app/utils/services/footer.service';
import CONSTANTS from '@app/config/constants';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { UrlsService } from '@app/utils/services/urls.service';

declare let dataLayer;
declare var ADMITAD;
declare var digitalData: {};
declare let _satellite;

@Component({
    selector: "order-confirmation",
    templateUrl: "orderConfirmation.html",
    styleUrls: ["orderConfirmation.scss"],
})
export class OrderConfirmationComponent implements OnInit {
    data: {};
    queryParams: {};
    mode: string = null;
    orderId: string = null;
    iFrameUrl: any;
    afType: string;
    id: any;
    routeUrl: string;
    isServer: boolean;
    isBrowser: boolean;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    amount: any;
    netDebitAmount: any;
    parentCate;
    productCategoryCode: Array<any> = [];
    userType;
    couponCodeData;
    appPromoVisible = true;
    processedItems = 0;
    set showLoader(value: boolean) {
        this.globalLoader.setLoaderState(value);
    }
    // ondemand loaded components for app Promo
    appPromoInstance = null;
    @ViewChild('appPromo', { read: ViewContainerRef }) appPromoContainerRef: ViewContainerRef;
    @ViewChild('iframeContainer', { static: true }) iframeContainer: ElementRef;
    iframeSources = [
        {
            type: 'iframe',
            src: 'https://track.vcommission.com/pixel?adid=64743f8fdf12f84ed101e3ef&sub1={{TransactionID}}&sub2=&sale_amount={{OrderRevenue}}&currency=INR',
            cookieCheck: false
        },
        {
            type: 'iframe',
            src: 'https://track.clickonik.com/pixel?adid=648998bbf1cf554c307985cf&sale_amount={{OrderRevenue}}&sub1={{TransactionID}}',
            cookieCheck: false
        },
        {
            type: 'iframe',
            src: 'https://rainmaker49.gotrackier.com/pixel?adid=64805ed8407577334745ece2&txn_id={{TransactionID}}&sale_amount={{OrderRevenue}}',
            cookieCheck: false
        },
        {
            type: 'iframe',
            src: 'https://tracking.primedigital.in/aff_l?offer_id=11383&adv_sub={{TransactionID}}&amount={{OrderRevenue}}',
            cookieCheck: false
        },
        {
            type: 'iframe',
            src: 'https://conv.trackaw.com/tracking/conversion/192745?country=India&partner_trans_id={{TransactionID}}&os_version=android&event_type=event name/goal name&order_id={{TransactionID}}&order_value={{OrderRevenue}}',
            cookieCheck: true,
            cookie: 'zoutons'
        },
        {
            type: 'script',
            src: 'https://pixiloom.com/veion/starerthi/jari/othRtre.js'
        }
    ]

    constructor(
        private localStorageService: LocalStorageService,
        public _dataService: DataService,
        private _orderConfrimationService: OrderConfirmationService,
        private _localStorageService: LocalStorageService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _router: Router,
        private footerService: FooterService,
        private _activatedRoute: ActivatedRoute,
        private _orderService: OrderConfirmationService,
        private globalLoader: GlobalLoaderService,
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        public _commonService: CommonService,
        private _globalSessionService:GlobalSessionStorageService,
        private globalAnalyticsService: GlobalAnalyticsService,
        private _urlsService: UrlsService,
        private renderer: Renderer2
        ) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
        this._activatedRoute.params.subscribe((data) => { });
    }

    ngOnInit() {
        // console.log("----Order Confrimtaion Logs----")
        const utm_medium = this._localStorageService.retrieve("utm_medium");
        const userSession = this._localAuthService.getUserSession();
        this.routeUrl = this._router.url;
        this.queryParams = this._activatedRoute.snapshot.queryParams;
        this.mode = this.queryParams["mode"];
        this.orderId = (this.queryParams && this.queryParams["orderId"]) ? this.queryParams["orderId"] : null;
        this.amount = this.queryParams["transactionAmount"];
        this.netDebitAmount= this.queryParams["netDebitAmount"];
        const log = `OrderId:${this.orderId}, Mode:${this.mode}, Amount:${this.amount}`;
        // console.log("ngOnInit")
        // console.log(log);
        this.checkUserSessionAndValidateOrder(userSession, utm_medium);
        this.getItemsCount(userSession);
        // this.insertIframes();
    }

    insertIframes() {
        if(this.orderId && this.amount) {
            console.log(this.orderId, this.amount)
            this.iframeSources.forEach((each) => {
                each['src'] = each['src'].replace('{{TransactionID}}', this.orderId)
                each['src'] = each['src'].replace('{{OrderRevenue}}', this.amount)
                if(each['type'] == 'iframe' && !each['cookieCheck']) {
                    this.loadIframe(each['src']);
                } else if(each['type'] == 'iframe' && each['cookieCheck']) {
                    if(this._orderConfrimationService.checkCookie(each['cookie'])) {
                        this.loadIframe(each['src']);
                    }
                } else if(each['type'] == 'script') {
                    this.loadScript(each['src'])
                }
            })
        }
    };

    loadIframe(src) {
        const iframe = this.renderer.createElement('iframe');
        this.renderer.setAttribute(iframe, 'src', src);
        this.renderer.appendChild(this.iframeContainer.nativeElement, iframe);
    }

    loadScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        document.head.appendChild(script);
    }

    checkUserSessionAndValidateOrder(userSession, utm_medium){
        if(userSession && userSession['authenticated'] == "true" && this.orderId != null){
            const orderIdsList = userSession['orderIdsList'] ? userSession['orderIdsList'] : null;
            if(orderIdsList == null){
                userSession['orderIdsList'] = [this.orderId];
                const userSessionObject = Object.assign({}, userSession);
                this._localAuthService.setUserSession(userSessionObject);
                this.callAnalyticsAndUserSessionAPI(userSessionObject, utm_medium);
            }else{
                if(orderIdsList && orderIdsList.length > 0){
                    const isExits = orderIdsList.findIndex(res=> res == this.orderId);
                    if(isExits == -1){
                        orderIdsList.push(this.orderId);
                        userSession['orderIdsList'] = orderIdsList;
                        const userSessionObject = Object.assign({}, userSession);
                        this._localAuthService.setUserSession(userSessionObject);
                        this.callAnalyticsAndUserSessionAPI(userSessionObject, utm_medium);
                    }
                }
            }
        }
    }

    async callAnalyticsAndUserSessionAPI(userSession, utm_medium){
        try{
            if (this.isBrowser) {
                this.analyticCallUsingAPI(userSession, { orderStatus: "success", index: "order_confirmation_1" });
                this.utmBasedTracking(utm_medium, {
                    orderId: this.queryParams["orderId"],
                    transactionAmount: this.queryParams["transactionAmount"],
                });
                this.getCartSessionAnalyticsCallUpdated(this.orderId,utm_medium,userSession);
                this.getCartSessionAnalyticsCall(userSession, utm_medium);
                this.footerService.setFooterObj({ footerData: false });
                this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
            }
        }catch(err){
            console.log("Error in callAnalyticsAndUserSessionAPI function :" , err);
        }
    }

    getCartSessionAnalyticsCallUpdated(orderId, utm_medium, userSession) {
        if (userSession && userSession.authenticated && userSession.authenticated == "true") {
            if (orderId) {
                this._urlsService.getRetryPaymentByOrderId(orderId).subscribe(response => {
                    // console.log("get cart by session response in the order summary via retry payment", response['data']['shoppingCartDto'])
                    if (response && response['status'] && response['data'] && response['data']['shoppingCartDto']) {
                        const anayticsData = this.getAnalyticCartItemObj(response['data']['shoppingCartDto'], utm_medium)
                        this.admitAdsTracking(utm_medium, anayticsData.orderedItem);
                        this.gtmTracking(userSession, anayticsData);
                        this.adobeTracking(userSession, anayticsData);
                        this.sendClickStreamData(response['data']['shoppingCartDto']);
                    }
                })
            }
        }
    }

    private getCartSessionAnalyticsCall(userSession: any, utm_medium: any) {
        if (userSession && userSession.authenticated && userSession.authenticated == "true") {
            let buyNow = false;
            const FLASHDATA = this.localStorageService.retrieve("flashData");
            if (FLASHDATA) {
                 buyNow = FLASHDATA['buyNow'].toString() == "true" ? true : false; 
            }
            // console.log(`User SessionId:${userSession.sessionId}, Buy Now:${buyNow}`);
            this._cartService.getCartBySession({
                buyNow: buyNow,
                sessionid: userSession.sessionId
            }).subscribe((cartSession) => {
                // console.log("Received Processed Cart Session");
                if (cartSession["cart"]) {
                    this.setVars(cartSession);
                    // const anayticsData = this.getAnalyticCartItemObj(cartSession, utm_medium)
                    // this.admitAdsTracking(utm_medium, anayticsData.orderedItem);
                    // this.gtmTracking(userSession, anayticsData);
                    // this.adobeTracking(userSession, anayticsData);
                    // this.sendClickStreamData(cartSession);
                    this.getUpdatedCart(buyNow, userSession, cartSession);
                }
            },
                (reponseError) => {
                    this.adobeTracking(userSession, null);
                    this.sendClickStreamDataError(
                        "order_completed_api_error",
                        reponseError
                    );
                },
            );
        }
    }

    private getItemsCount(userSession){
        this._orderConfrimationService.getOrderbyUserid(userSession.userId, 0, this.orderId).subscribe((order)=>{
            this.processedItems = order? order.numberOfItem : 0;
        });
    }

    private setVars(cartSession: Object) {
        this.couponCodeData = "";
        if (cartSession["userInfo"]) {
            this.userType = cartSession["userInfo"].userType;
        }
        if (cartSession["offersList"] && (cartSession["offersList"] as any[]).length)
        {
            let couponId = [];
            cartSession["offersList"].forEach(element =>couponId.push(element.offerId));
            this.couponCodeData = couponId.toString();
        }
    }

    private admitAdsTracking(utm_medium: any, orderedItem: any[]) {
        if (utm_medium && utm_medium == "admitad") {
            ADMITAD = window["ADMITAD"] || {};
            ADMITAD.Invoice = ADMITAD.Invoice || {};
            ADMITAD.Invoice.broker = "adm";
            ADMITAD.Invoice.referencesOrder = ADMITAD.Invoice.referencesOrder || [];
            ADMITAD.Invoice.category = "1";
            // adding items to the order
            ADMITAD.Invoice.referencesOrder.push({
                orderNumber: this.queryParams["orderId"],
                orderedItem: orderedItem,
            });
            // Important! If order data is loaded via AJAX, uncomment this string.
            // console.log('order onfirmation logs ==> admitAdsTracking completed');
            ADMITAD.Tracking.processPositions();

        }
    }

    private gtmTracking(userSession: any, anayticsData) {
        dataLayer.push({
            event: "orderConfirmationEcommerce",
            transactionId: this.queryParams["orderId"],
            transactionTotal: this.queryParams["transactionAmount"],
        });

        /*Start Criteo DataLayer Tags */
        dataLayer.push({
            event: "trackTransaction",
            email: userSession.email,
            productTransactionAmount: this.queryParams["transactionAmount"],
            TransactionID: this.queryParams["orderId"],
            categoryCode: this.productCategoryCode.toString(),
            parentCategoryCode: this.parentCate.toString(),
            currency: "INR",
            id: anayticsData.prodIds,
            name: anayticsData.prodNames,
            price: anayticsData.prodPrices,
            quantity: anayticsData.prodQuantities,
        });
        /*End Criteo DataLayer Tags */
        dataLayer.push({
            event: "pr-purchase",
            "Payment Mode": this.queryParams["mode"],
            ecommerce: {
                purchase: {
                    actionField: {
                        id: this.queryParams["orderId"],
                        affiliation: "Moglix",
                        revenue: this.queryParams["transactionAmount"],
                        tax: "",
                        shipping: "",
                    },
                    products: anayticsData.criteoItem,
                },
            },
        });

        let google_tag_params = {
            ecomm_prodid: anayticsData.ecomm_prodid,
            ecomm_pagetype: "order-confirmation",
            ecomm_totalvalue: this.queryParams["transactionAmount"],
        };

        dataLayer.push({
            event: "pr-confirmation",
            ecomm_prodid: google_tag_params.ecomm_prodid,
            ecomm_pagetype: google_tag_params.ecomm_pagetype,
            ecomm_totalvalue: google_tag_params.ecomm_totalvalue,
            google_tag_params: google_tag_params,
        });
        this._localStorageService.clear("utm_medium");
        // console.log('order onfirmation logs ==> gtmTracking completed');
    }

    private adobeTracking(userSession: any, anayticsData = null) {
        let page = {
            pageName: "order-Confirmation",
            channel: "purchase",
            subSection: "Payment Success" + ((userSession && userSession["agentId"]) ? " | Inside Sales" : ''),
        };
        let order = {};
        if(anayticsData){
            order = {
                transactionID: this.queryParams["orderId"],
                platformType: "mobile",
                productCategoryL1: anayticsData.aCat1,
                productCategoryL2: anayticsData.aCat2,
                productCategoryL3: anayticsData.aCat3,
                productID: anayticsData.aprodIds,
                productPrice: anayticsData.aprodPrices,
                shipping: anayticsData.aShipping,
                couponDiscount: anayticsData.aOffer,
                quantity: anayticsData.aprodQuantities,
                paymentMode: this.queryParams["mode"],
                totalDiscount: anayticsData.aTotalDiscount,
                totalQuantity: anayticsData.aTotalQuantity,
                totalPrice: anayticsData.totalPriceCalc,
                couponCode: "",
                shippingCharges: anayticsData.aTotalShipping,
                couponCodeID: this.couponCodeData,
            };
        }else{
            order = {
                transactionID: this.queryParams["orderId"],
                platformType: "mobile",
                paymentMode: this.queryParams["mode"],
            };
        }
        digitalData["page"] = page;
        digitalData["custData"] = this._commonService.custDataTracking;
        digitalData["order"] = order;
        // console.log(digitalData);
        _satellite.track("genericPageLoad");
        // console.log('order onfirmation logs ==> adobeTracking completed');
    }

    private utmBasedTracking(utm_medium: any, data: { orderId: any; transactionAmount: any; }) {
        if (utm_medium) {
            if (utm_medium === "mysmartprice") {
                this.afType = "iFrame";
                this.iFrameUrl =
                    "https://mspdv.in/p.ashx?o=10&e=16&p=" +
                    this.queryParams["transactionAmount"] +
                    "&t=" +
                    this.queryParams["orderId"] +
                    "&udid=" +
                    this.queryParams["transactionAmount"];
                data["affiliateId"] = 1;
            } else if (utm_medium === "affprog-mopm") {
                data["affiliateId"] = 2;
                let src = "https://track.in.omgpm.com/916096/transaction.asp?APPID=" +
                    this.queryParams["orderId"] +
                    "&MID=916096&PID=17423&status=" +
                    this.queryParams["transactionAmount"];
                this._orderConfrimationService.cs(src, "script");
            } else if (utm_medium === "cuelinks_desidime") {
                this.afType = "image";
                this.iFrameUrl =
                    "https://paritycube.go2cloud.org/SLCD?adv_sub=" +
                    this.queryParams["orderId"] +
                    "&amount=" +
                    this.queryParams["transactionAmount"];
                data["affiliateId"] = 7;
            } else if (utm_medium === "clickonik") {
                const e = {
                    ce: "img",
                    src: "https://track.clickonik.com/pixel?adid=5f7ad7f126f6cb33c836f693&&sale_amount=" +
                        this.queryParams["transactionAmount"] +
                        "&sub1=" +
                        this.queryParams["orderId"],
                };
                this._orderConfrimationService.cns(e);
                data["affiliateId"] = 8;
            } else if (utm_medium == "admitad") {
                data["affiliateId"] = 9;
            } else if (utm_medium == "CPS") {
                data["affiliateId"] = 10;
                this.afType = "iFrame";
                this.iFrameUrl =
                    "https://tracking.icubeswire.co/aff_a?offer_id=375&adv_sub1=" +
                    this.queryParams["orderId"] +
                    "&sale_amount=" +
                    this.queryParams["transactionAmount"] +
                    this.queryParams["orderId"] +
                    "&amount=" +
                    this.queryParams["transactionAmount"];
                this.id = "pixelcodeurl";
            }
            // console.log('order onfirmation logs ==> started with body', data);
            this._orderConfrimationService.addAffiliateOrder(data).subscribe((res) => {
                // console.log('order onfirmation logs ==> completed with res', res);
            });
        }
    }

    private analyticCallUsingAPI(userSession: any, options: object) {
        // console.log('order onfirmation logs ==> started', options);
        if (this.isBrowser) {
            const body = Object.assign({
                sessionId: userSession && userSession.sessionId ? userSession.sessionId : "",
                userId: userSession && userSession.userId ? userSession.userId : "",
                orderId: this.orderId,
                createdBySource: "pwa",
                userAgent: window.navigator.userAgent,
            }, options)
            this._orderService
                .sendTrackerOrderConfirmationCall(body)
                .subscribe((res) => {
                    // console.log('order onfirmation logs ==> completed', res);
                    // console.log("sendTrackerOrderConfirmationCall", res);
                });
        }
    }

    getAnalyticCartItemObj(cartSession, utm_medium) {
        const dataObj = {
            criteoItem: [],
            couponId: [],
            ecomm_prodid: [],
            prodIds: "",
            prodNames: "",
            prodPrices: "",
            prodQuantities: "",
            aCat1: "",
            aCat2: "",
            aCat3: "",
            aprodIds: "",
            aprodNames: "",
            aprodPrices: "",
            aprodQuantities: "",
            aShipping: "",
            aOffer: "",
            aTotalDiscount: 0,
            aTotalShipping: 0,
            aTotalQuantity: 0,
            totalPriceCalc: 0,
            orderedItem: [],
            obj: [],
            obj1: [],
        }
        const PAYMENT_MSNS = this._globalSessionService.fetchPaymentMsns();
        // console.log("PAYMENT_MSNS:", PAYMENT_MSNS);
        const ACTUAL_CART_ITEMS:any[] = (cartSession["itemsList"] as any[]);
        // console.log("ACTUAL_CART_ITEMS:", ACTUAL_CART_ITEMS);
        let PAYMENT_CART_ITEMS = ACTUAL_CART_ITEMS
        if (PAYMENT_MSNS)
        {
            PAYMENT_CART_ITEMS = ACTUAL_CART_ITEMS.filter((item) => PAYMENT_MSNS.includes(item.productId))
        }
        // console.log("PAYMENT_CART_ITEMS:", PAYMENT_CART_ITEMS);
        PAYMENT_CART_ITEMS.forEach((element) => {
            let price = element.productUnitPrice;

            if (element.bulkPrice != "" && element.bulkPrice != null) {
                price = element.bulkPrice;
            }

            this.productCategoryCode.push(element.categoryCode);

            dataObj.obj.push({
                sku: element.productId,
                name: element.productName,
                price: element.productUnitPrice,
                quantity: element.productQuantity,
            });

            dataObj.obj1.push({
                id: element.productId,
                name: element.productName,
                price: element.productUnitPrice,
                quantity: element.productQuantity,
                variant: "",
            });

            dataObj.criteoItem.push({
                id: element.productId,
                price: element.productUnitPrice,
                quantity: element.productQuantity,
                name: element.productName,
            });

            if (utm_medium && utm_medium == "admitad") {
                dataObj.orderedItem.push({
                    Product: {
                        category: ((element.taxonomyCode.split('/').filter(categoryId => ['214000000', '250000000'].includes(categoryId))).length > 0) ? "2" : "1",
                        price: element.productUnitPrice,
                        priceCurrency: "INR", // currency code in the ISO-4217 alfa-3 format
                    },
                    orderQuantity: element.productQuantity,
                    additionalType: "sale", // always sale
                });
            }

            dataObj.ecomm_prodid.push(element.productId);
            dataObj.prodIds = element.productId + ", " + dataObj.prodIds;
            dataObj.prodNames = element.productName + ", " + dataObj.prodNames;
            dataObj.prodPrices = price + ", " + dataObj.prodPrices;
            dataObj.prodQuantities = element.productQuantity + ", " + dataObj.prodQuantities;

            dataObj.totalPriceCalc = price * element.productQuantity + dataObj.totalPriceCalc;

            let taxonomy = element.taxonomyCode.split("/");
            taxonomy.forEach((ele, i) => {
                if (i == 0)
                    dataObj.aCat1 = ele + "|" + dataObj.aCat1 || "NA";
                if (i == 1)
                    dataObj.aCat2 = ele + "|" + dataObj.aCat2 || "NA";
                if (i == 2)
                    dataObj.aCat3 = ele + "|" + dataObj.aCat3 || "NA";
            });

            if (dataObj.aCat1) {
                this.parentCate = dataObj.aCat1.split("|");
                this.parentCate.pop();
            }

            dataObj.aprodIds = element.productId + "|" + dataObj.aprodIds;
            dataObj.aprodNames = element.productName + "|" + dataObj.aprodNames;
            dataObj.aprodPrices = price + "|" + dataObj.aprodPrices;
            dataObj.aprodQuantities = element.productQuantity + "|" + dataObj.aprodQuantities;

            if (element.shipping)
                dataObj.aShipping = element.shipping + "|" + dataObj.aShipping;
            if (element.offer)
                dataObj.aOffer = element.offer + "|" + dataObj.aOffer;
            if (element.offer)
                dataObj.aTotalDiscount = element.offer + dataObj.aTotalDiscount;
            if (element.shipping)
                dataObj.aTotalShipping = element.shipping + dataObj.aTotalShipping;
            if (element.productQuantity)
                dataObj.aTotalQuantity = parseInt(element.productQuantity) + dataObj.aTotalQuantity;
        });
        this._globalSessionService.clearPaymentMsns();
        return dataObj;
    }

    sendClickStreamDataError(key, reponseError) {
        var trackData = {
            event_type: "page_load",
            page_type: "order_confirmation",
            label: key,
            channel: "Checkout",
            message: reponseError,
        };
        try {
            this.globalAnalyticsService.sendMessage(trackData);
        } catch (error) {
            // console.log("sendClickStreamData error", error);
        }
    }

    sendClickStreamData(cartSession) {
        try {
            if (cartSession["itemsList"] !== null && cartSession["itemsList"]) {
                var totQuantity = 0;
                let eventData = { 'prodId': '', 'prodPrice': 0, 'prodQuantity': 0, 'prodImage': '', 'prodName': '', 'prodURL': '' };
                for (let p = 0; p < cartSession["itemsList"].length; p++) {
                    eventData['prodId'] = cartSession["itemsList"][p]['productId'] + ', ' + eventData['prodId'];
                    eventData['prodPrice'] = cartSession["itemsList"][p]['productUnitPrice'] * cartSession["itemsList"][p]['productQuantity'] + eventData['prodPrice'];
                    eventData['prodQuantity'] = cartSession["itemsList"][p]['productQuantity'] + eventData['prodQuantity'];
                    eventData['prodImage'] = cartSession["itemsList"][p]['productImg'] + ', ' + eventData['prodImage'];
                    eventData['prodName'] = cartSession["itemsList"][p]['productName'] + ', ' + eventData['prodName'];
                    eventData['prodURL'] = cartSession["itemsList"][p]['productUrl'].includes('https://') ?
                        cartSession["itemsList"][p]['productUrl'] : CONSTANTS.PROD + '/' + cartSession["itemsList"][p]['productUrl'] +
                        ', ' + eventData['prodURL'];
                }
                var trackData = {
                    event_type: "page_load",
                    page_type: "order_confirmation",
                    label: "order_completed",
                    channel: "Checkout",
                    price: cartSession["cart"]["totalPayableAmount"].toString(),
                    quantity: cartSession["itemsList"].map((item) => {
                        return (totQuantity = totQuantity + item.productQuantity);
                    })[cartSession["itemsList"].length - 1],
                    shipping: parseFloat(cartSession["cart"]["shippingCharges"]) || '',
                    invoiceType: null,
                    paymentMode: this.queryParams["mode"],
                    itemList: cartSession["itemsList"].map((item) => {
                        return {
                            category_l1: item["taxonomyCode"]
                                ? item["taxonomyCode"].split("/")[0]
                                : null,
                            category_l2: item["taxonomyCode"]
                                ? item["taxonomyCode"].split("/")[1]
                                : null,
                            category_l3: item["taxonomyCode"]
                                ? item["taxonomyCode"].split("/")[2]
                                : null,
                            price: item["totalPayableAmount"].toString(),
                            quantity: item["productQuantity"],
                        };
                    }),
                    eventData: eventData
                };
                this.globalAnalyticsService.sendMessage(trackData);
                // console.log('order onfirmation logs ==> completed sendClickStreamData ');
            }
        } catch (error) {
            // console.log("sendClickStreamData error", error);
        }
    }

    private getUpdatedCart(buyNow, userSession, cartSession) {
        this.localStorageService.clear("flashData");
        this.resetCartSessionForNormalFlow(buyNow, userSession, cartSession);
    }

    private resetCartSessionForNormalFlow(buyNow, userSession, cartSession) {
        let emptyCart = {
            cart: {
                cartId: cartSession.cart.cartId,
                sessionId: cartSession.cart.sessionId,
                agentId: cartSession.cart["agentId"],
                userId: userSession.userId,
                isPersistant: true,
                createdAt: null,
                updatedAt: null,
                closedAt: null,
                orderId: null,
                totalAmount: null,
                totalOffer: null,
                totalAmountWithOffer: null,
                taxes: null,
                totalAmountWithTaxes: null,
                shippingCharges: null,
                currency: null,
                isGift: null,
                giftMessage: null,
                giftPackingCharges: null,
                totalPayableAmount: null,
                buyNow: buyNow
            },
            itemsList: [],
            addressList: null,
            payment: null,
            deliveryMethod: null,
            offersList: null,
        };
        this._cartService.updateCartSession(emptyCart).subscribe((response) => {
            if (response['cart'])
            {
                this._cartService.checkForUserAndCartSessionAndNotify().subscribe(res =>
                {
                    // console.log(res)
                    // console.log('cart updated');
                });
            }
        });
    }

    ngOnDestroy() {
        this.footerService.setFooterObj({ footerData: false });
        this.footerService.footerChangeSubject.next(
            this.footerService.getFooterObj()
        );
    }

    navigateTo(route) {
        this._router.navigate([route]);
    }

    async onVisibleAppPromo(event) {
        this.showLoader = true;
        const { ProductAppPromoComponent } = await import('../../components/product-app-promo/product-app-promo.component').finally(() => {
            this.showLoader = false;
        });
        const factory = this.cfr.resolveComponentFactory(ProductAppPromoComponent);
        this.appPromoInstance = this.appPromoContainerRef.createComponent(factory, null, this.injector);
        this.appPromoInstance.instance['page'] = 'order-confirmation';
        this.appPromoInstance.instance['isOverlayMode'] = false;
        this.appPromoInstance.instance['showPromoCode'] = false;
        this.appPromoInstance.instance['isLazyLoaded'] = true;
        (this.appPromoInstance.instance['appPromoStatus$'] as EventEmitter<boolean>).subscribe((status) => {
            this.appPromoVisible = status;
        });
    }
}


/**
 * ORDER CONFIRMATION DOCUMENT FLOW
 *
 * queryParams
 * - orderId
 * - transactionAmount
 * - mode
 *
 * setOrderStreamData Analytics calls
 * - API URL ::  /clickStream/setOrderStreamData
 * - API DATA: {sessionId, userId, orderId, createdBySource, userAgent, orderStatus, index}
 * - API CALLED ON : onload on comp before any other API with "index" value as "order_confirmation_1"
 *
 *
 * utm_medium logic
 *  - expected values in utm_medium ::  mysmartprice, affprog-mopm, cuelinks_desidime, clickonik, admitad, CPS
 * - based on values scripts are created and added into documents
 * - /checkout/createAffiliateOrder APIs is called with param affiliateId
 *
 *
 * CartBySession API called
 * - called with post body with buynow(true OR false) status by refering to localStorage key "flashData"
 * - On success response : setOrderStreamData Analytics call with with "index" value as "order_confirmation_2"
 * - On Error response : Socket API is called with "label" key value as "order_completed_data_error"
 * - ADOBE events fired in success - orderConfirmationEcommerce, trackTransaction, pr-purchase, pr-confirmation
 * - GTM events fires events, pageName: "order-Confirmation", channel: "purchase",
 * - SOCKET event fired :    event_type: "page_load", page_type: "order_confirmation" and other details
 *
 * OTHER features
 * App promo
 *
 * Need to check with PM team
 * - utm_medium signifiance with "admitad" as value
 *
 * POTENTIAL RISK ::
 *  1. get cart session API is called on ngOnInit and in ngAfterViewInit updateCartSession cart session is called, there are chances that ngAfterViewInit is called with ngOnInit as both calls are async
 *
 */