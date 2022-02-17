import { Component, OnInit, ComponentFactoryResolver, Injector, ViewChild, ViewContainerRef, EventEmitter } from '@angular/core';
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
    parentCate;
    productCategoryCode: Array<any> = [];
    userType;
    couponCodeData;
    appPromoVisible = true;
    set showLoader(value: boolean) {
        this.globalLoader.setLoaderState(value);
    }
    // ondemand loaded components for app Promo
    appPromoInstance = null;
    @ViewChild('appPromo', { read: ViewContainerRef }) appPromoContainerRef: ViewContainerRef;

    constructor(
        private localStorageService: LocalStorageService,
        public _dataService: DataService,
        private _ocs: OrderConfirmationService,
        private _lss: LocalStorageService,
        private _las: LocalAuthService,
        private _cartService: CartService,
        private _router: Router,
        private footerService: FooterService,
        private _activatedRoute: ActivatedRoute,
        private _orderService: OrderConfirmationService,
        private globalLoader: GlobalLoaderService,
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
        public _commonService: CommonService
    ) {

        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
        this._activatedRoute.params.subscribe((data) => { });
    }

    ngOnInit() {
        const utm_medium = this._lss.retrieve("utm_medium");
        const userSession = this._las.getUserSession();

        this.routeUrl = this._router.url;
        this.queryParams = this._activatedRoute.snapshot.queryParams;
        this.mode = this.queryParams["mode"];
        this.orderId = this.queryParams["orderId"];
        this.amount = this.queryParams["transactionAmount"];

        console.log('order onfirmation logs ==> routeUrl, queryParams, mode, orderId, amount', this.routeUrl, this.queryParams, this.mode, this.orderId, this.amount)

        if (this.isBrowser) {

            this.analyticCallUsingAPI(userSession, { orderStatus: "success", index: "order_confirmation_1" });
            this.utmBasedTracking(utm_medium, {
                orderId: this.queryParams["orderId"],
                transactionAmount: this.queryParams["transactionAmount"],
            });

            this.getCartSessionAnalyticsCall(userSession, utm_medium);
            this.footerService.setFooterObj({ footerData: false });
            this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());

        }
    }

    private getCartSessionAnalyticsCall(userSession: any, utm_medium: any) {

        console.log('order onfirmation logs ==> getCartSessionAnalyticsCall started');
        if (userSession && userSession.authenticated && userSession.authenticated == "true") {
            let buyNow = false;
            const FLASHDATA = this.localStorageService.retrieve("flashData");
            if (FLASHDATA){buyNow = FLASHDATA['buyNow'];}
            this._cartService.getCartBySession({
                buyNow: buyNow,
                sessionid: userSession.sessionId
            }).subscribe((cartSession) => {
                console.log('order onfirmation logs ==> completed response ', cartSession);
                if (cartSession["cart"]) {
                    // this.analyticCallUsingAPI(userSession, { orderStatus: "success", index: "order_confirmation_2" });
                    this.setVars(cartSession);
                    // sent to analytics
                    const anayticsData = this.getAnalyticCartItemObj(cartSession, utm_medium)
                    console.log('order onfirmation logs ==> completed processed obj ', anayticsData);
                    this.admitAdsTracking(utm_medium, anayticsData.orderedItem);
                    this.gtmTracking(userSession, anayticsData);
                    this.abobeTracking(userSession, anayticsData);
                    this.sendClickStreamData(cartSession);
                    this.resetCartSession();
                }
            },
                (reponseError) => {
                    this.sendClickStreamDataError(
                        "order_completed_api_error",
                        reponseError
                    );
                },

            );
        }
    }


    private setVars(cartSession: Object) {
        let couponId = [];
        if (cartSession["offersList"].length > 0) {
            cartSession["offersList"].forEach((element) => {
                couponId.push(element.offerId);
            });
            this.couponCodeData = couponId.toString();
        } else {
            this.couponCodeData = "";
        }

        if (cartSession["userInfo"]) {
            this.userType = cartSession["userInfo"].userType;
        }
    }

    private admitAdsTracking(utm_medium: any, orderedItem: any[]) {
        if (utm_medium && utm_medium == "admitad") {
            ADMITAD = window["ADMITAD"] || {};
            ADMITAD.Invoice = ADMITAD.Invoice || {};
            ADMITAD.Invoice.broker = "adm";
            ADMITAD.Invoice.referencesOrder =
                ADMITAD.Invoice.referencesOrder || [];
            ADMITAD.Invoice.category = "1";
            // adding items to the order
            ADMITAD.Invoice.referencesOrder.push({
                orderNumber: this.queryParams["orderId"],
                orderedItem: orderedItem,
            });
            // Important! If order data is loaded via AJAX, uncomment this string.
            console.log('order onfirmation logs ==> admitAdsTracking completed');
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
        this._lss.clear("utm_medium");
        console.log('order onfirmation logs ==> gtmTracking completed');
    }

    private abobeTracking(userSession: any, anayticsData) {
        let page = {
            pageName: "order-Confirmation",
            channel: "purchase",
            subSection: "Payment Success" + ((userSession && userSession["agentId"]) ? " | Inside Sales" : ''),
        };
        let custData = {
            customerID: userSession && userSession["userId"]
                ? btoa(userSession["userId"])
                : "",
            emailID: userSession && userSession["email"]
                ? btoa(userSession["email"])
                : "",
            mobile: userSession && userSession["phone"]
                ? btoa(userSession["phone"])
                : "",
            customerType: this.userType,
            agentId: userSession && userSession["agentId"]
                ? btoa(userSession["agentId"])
                : '',
        };
        let order = {
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
        digitalData["page"] = page;
        digitalData["custData"] = custData;
        digitalData["order"] = order;
        console.log(digitalData);
        _satellite.track("genericPageLoad");
        console.log('order onfirmation logs ==> abobeTracking completed');
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
                this._ocs.cs(src, "script");
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
                this._ocs.cns(e);
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
            console.log('order onfirmation logs ==> started with body', data);
            this._ocs.addAffiliateOrder(data).subscribe((res) => {
                console.log('order onfirmation logs ==> completed with res', res);
            });
        }
    }

    private analyticCallUsingAPI(userSession: any, options: object) {
        console.log('order onfirmation logs ==> started', options);
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
                    console.log('order onfirmation logs ==> completed', res);
                    console.log("sendTrackerOrderConfirmationCall", res);
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

        cartSession["itemsList"].forEach((element) => {
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
            this._dataService.sendMessage(trackData);
        } catch (error) {
            console.log("sendClickStreamData error", error);
        }
    }

    sendClickStreamData(cartSession) {
        try {
            if (cartSession["itemsList"] !== null && cartSession["itemsList"]) {
                var totQuantity = 0;
                var trackData = {
                    event_type: "page_load",
                    page_type: "order_confirmation",
                    label: "order_completed",
                    channel: "Checkout",
                    price: cartSession["cart"]["totalPayableAmount"].toString(),
                    quantity: cartSession["itemsList"].map((item) => {
                        return (totQuantity = totQuantity + item.productQuantity);
                    })[cartSession["itemsList"].length - 1],
                    shipping: parseFloat(cartSession["shippingCharges"]),
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
                };
                this._dataService.sendMessage(trackData);
                console.log('order onfirmation logs ==> completed sendClickStreamData ');
            }
        } catch (error) {
            console.log("sendClickStreamData error", error);
        }
    }

    private resetCartSession() {
        let currentCartSession = this._cartService.getCartSession();
        let userSession = this._las.getUserSession();
        let emptyCart = {
            cart: {
                cartId: currentCartSession.cart.cartId,
                sessionId: currentCartSession.cart.sessionId,
                agentId: currentCartSession.cart["agentId"],
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
            },
            itemsList: [],
            addressList: null,
            payment: null,
            deliveryMethod: null,
            offersList: null,
        };

        /**
         * For buyNow item remove buynow data from localstorage.
         */
        const flashData = this.localStorageService.retrieve("flashData");
        if (flashData && flashData["buyNow"]) {
            emptyCart["cart"]["buyNow"] = true;
            this.localStorageService.clear("flashData");
        }
        //ENDS
        this._cartService.updateCartSession(emptyCart).subscribe((data) => {
            this._cartService.cart.next({ count: data["noOfItems"] || (data["itemsList"] as any[]).length || 0 });
            let res = data;
            if (res["statusCode"] == 200) {
                this._cartService.setCartSession(res);
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