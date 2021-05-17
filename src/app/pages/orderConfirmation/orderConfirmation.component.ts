import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { OrderConfirmationService } from './orderConfirmation.service';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { FooterService } from '@app/utils/services/footer.service';

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

    constructor(
        private localStorageService: LocalStorageService,
        public _dataService: DataService,
        @Inject(PLATFORM_ID) platformId,
        private _ocs: OrderConfirmationService,
        private _lss: LocalStorageService,
        private _las: LocalAuthService,
        private _cartService: CartService,
        private _router: Router,
        private footerService: FooterService,
        private _activatedRoute: ActivatedRoute,
        private _orderService: OrderConfirmationService) {

        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this._activatedRoute.params.subscribe((data) => { });
    }

    ngOnInit() {
        this.routeUrl = this._router.url;
        this.queryParams = this._activatedRoute.snapshot.queryParams;

        const utm_medium = this._lss.retrieve("utm_medium");
        const data = {
            orderId: this.queryParams["orderId"],
            transactionAmount: this.queryParams["transactionAmount"],
        };
        const ecomm_prodid = [];
        const userSession = this._las.getUserSession();
        /*Affiliate pixels call */

        this.mode = this.queryParams["mode"];
        this.orderId = this.queryParams["orderId"];
        this.amount = this.queryParams["transactionAmount"];

        if (this.isBrowser) {
            this._orderService
                .sendTrackerOrderConfirmationCall({
                    sessionId:
                        userSession && userSession.sessionId ? userSession.sessionId : "",
                    userId: userSession && userSession.userId ? userSession.userId : "",
                    orderId: this.orderId,
                    createdBySource: "pwa",
                    userAgent: window.navigator.userAgent,
                    orderStatus: "success",
                    index: "order_confirmation_1",
                })
                .subscribe((res) => {
                    console.log("sendTrackerOrderConfirmationCall", res);
                });
        }

        if (this.isBrowser) {
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
                    let src =
                        "https://track.in.omgpm.com/916096/transaction.asp?APPID=" +
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
                        src:
                            "https://track.clickonik.com/pixel?adid=5f7ad7f126f6cb33c836f693&&sale_amount=" +
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
                this._ocs.addAffiliateOrder(data).subscribe(() => {
                });
            }
            /*End Affiliate pixel call */
            //ENDS
            /*Get cart session on load*/
            const params = { sessionid: userSession.sessionId };
            /**
             * For buyNow fetch only buynow item.
             */
            const flashData = this.localStorageService.retrieve("flashData");
            if (flashData && flashData["buyNow"]) {
                params["buyNow"] = flashData["buyNow"];
            }

            if (
                userSession &&
                userSession.authenticated &&
                userSession.authenticated == "true"
            ) {
                let criteoItem = [];
                let couponId = [];
                let prodIds = "",
                    prodNames = "",
                    prodPrices = "",
                    prodQuantities = "",
                    aCat1 = "",
                    aCat2 = "",
                    aCat3 = "",
                    aprodIds = "",
                    aprodNames = "",
                    aprodPrices = "",
                    aprodQuantities = "",
                    aShipping = "",
                    aOffer = "",
                    aTotalDiscount = 0,
                    aTotalShipping = 0,
                    aTotalQuantity = 0;
                let totalPriceCalc = 0;
                this._cartService.getCartBySession(params).subscribe(
                    (cartSession) => {
                        try {
                            this._orderService
                                .sendTrackerOrderConfirmationCall({
                                    sessionId: userSession && userSession.sessionId
                                        ? userSession.sessionId
                                        : "",
                                    userId: userSession && userSession.userId
                                        ? userSession.userId
                                        : "",
                                    orderId: this.orderId,
                                    createdBySource: "pwa",
                                    userAgent: window.navigator.userAgent,
                                    orderStatus: "success",
                                    index: "order_confirmation_2",
                                })
                                .subscribe((res) => {
                                    console.log("sendTrackerOrderConfirmationCall", res);
                                });

                            if (cartSession["statusCode"] != undefined && cartSession["statusCode"] == 200) {
                                let obj = [];
                                let obj1 = [];
                                let orderedItem = [];
                                debugger;
                                cartSession["itemsList"].forEach((element) => {
                                    let price = element.productUnitPrice;
                                    if (element.bulkPrice != "" && element.bulkPrice != null) {
                                        price = element.bulkPrice;
                                    }

                                    this.productCategoryCode.push(element.categoryCode);

                                    obj.push({
                                        sku: element.productId,
                                        name: element.productName,
                                        price: element.productUnitPrice,
                                        quantity: element.productQuantity,
                                    });

                                    obj1.push({
                                        id: element.productId,
                                        name: element.productName,
                                        price: element.productUnitPrice,
                                        quantity: element.productQuantity,
                                        variant: "",
                                    });

                                    criteoItem.push({
                                        id: element.productId,
                                        price: element.productUnitPrice,
                                        quantity: element.productQuantity,
                                        name: element.productName,
                                    });

                                    if (utm_medium && utm_medium == "admitad") {
                                        orderedItem.push({
                                            Product: {
                                                category: "1",                        // Please don't change the value of this
                                                price: element.productUnitPrice,      // Pass total amount here
                                                priceCurrency: "INR",                 // currency code in the ISO-4217 alfa-3 format
                                            },

                                            orderQuantity: element.productQuantity, // product quantity. Always '1' for "Insurance and finance" program category
                                            additionalType: "sale",                 // always sale
                                        });
                                    }

                                    ecomm_prodid.push(element.productId);
                                    prodIds = element.productId + ", " + prodIds;
                                    prodNames = element.productName + ", " + prodNames;
                                    prodPrices = price + ", " + prodPrices;
                                    prodQuantities = element.productQuantity + ", " + prodQuantities;
                                    totalPriceCalc = price * element.productQuantity + totalPriceCalc;
                                    let taxonomy = element.taxonomyCode.split("/");
                                    taxonomy.forEach((ele, i) => {
                                        if (i == 0) aCat1 = ele + "|" + aCat1 || "NA";
                                        if (i == 1) aCat2 = ele + "|" + aCat2 || "NA";
                                        if (i == 2) aCat3 = ele + "|" + aCat3 || "NA";
                                    });
                                    if (aCat1) {
                                        this.parentCate = aCat1.split("|");
                                        this.parentCate.pop();
                                    }
                                    aprodIds = element.productId + "|" + aprodIds;
                                    aprodNames = element.productName + "|" + aprodNames;
                                    aprodPrices = price + "|" + aprodPrices;
                                    aprodQuantities = element.productQuantity + "|" + aprodQuantities;
                                    if (element.shipping)
                                        aShipping = element.shipping + "|" + aShipping;
                                    if (element.offer)
                                        aOffer = element.offer + "|" + aOffer;
                                    if (element.offer)
                                        aTotalDiscount = element.offer + aTotalDiscount;
                                    if (element.shipping)
                                        aTotalShipping = element.shipping + aTotalShipping;
                                    if (element.productQuantity)
                                        aTotalQuantity = parseInt(element.productQuantity) + aTotalQuantity;
                                });
                                if (utm_medium && utm_medium == "admitad") {
                                    ADMITAD = window["ADMITAD"] || {};
                                    ADMITAD.Invoice = ADMITAD.Invoice || {};
                                    ADMITAD.Invoice.broker = "adm";
                                    ADMITAD.Invoice.referencesOrder =
                                        ADMITAD.Invoice.referencesOrder || [];
                                    ADMITAD.Invoice.category = "1";

                                    ADMITAD.Invoice.referencesOrder.push({      // adding items to the order
                                        orderNumber: this.queryParams["orderId"], // Pass order ID here
                                        orderedItem: orderedItem,
                                    });
                                    ADMITAD.Tracking.processPositions();        // Important! If order data is loaded via AJAX, uncomment this string.
                                }
                            }

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
                                id: prodIds,
                                name: prodNames,
                                price: prodPrices,
                                quantity: prodQuantities,
                            });
                            /*End Criteo DataLayer Tags */

                            dataLayer.push({
                                event: "pr-purchase",
                                "Payment Mode": this.queryParams["mode"], //cod ,  HDFC, paytm, Payu, etc
                                ecommerce: {
                                    purchase: {
                                        actionField: {
                                            id: this.queryParams["orderId"],    // Transaction ID. Required for purchases and refunds.
                                            affiliation: "Moglix",
                                            revenue: this.queryParams["transactionAmount"], // Total transaction value (incl. tax and shipping)
                                            tax: "",
                                            shipping: "",
                                        },
                                        products: criteoItem,
                                    },
                                },
                            });

                            let google_tag_params = {
                                ecomm_prodid: ecomm_prodid,
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

                            let page = {
                                pageName: "order-Confirmation",
                                channel: "purchase",
                                subsection: "Payment Success",
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
                            };
                            let order = {
                                transactionID: this.queryParams["orderId"],
                                platformType: "mobile",
                                productCategoryL1: aCat1,
                                productCategoryL2: aCat2,
                                productCategoryL3: aCat3,
                                productID: aprodIds,
                                productPrice: aprodPrices,
                                shipping: aShipping,
                                couponDiscount: aOffer,
                                quantity: aprodQuantities,
                                paymentMode: this.queryParams["mode"],
                                totalDiscount: aTotalDiscount,
                                totalQuantity: aTotalQuantity,
                                totalPrice: totalPriceCalc,
                                couponCode: "",
                                shippingCharges: aTotalShipping,
                                couponCodeID: this.couponCodeData,
                            };
                            digitalData["page"] = page;
                            digitalData["custData"] = custData;
                            digitalData["order"] = order;

                            try {
                                _satellite.track("genericPageLoad");
                            } catch (adobeError) {
                                this.sendClickStreamDataError(
                                    "order_completed_adobe_error",
                                    adobeError
                                );
                            }

                            this.sendClickStreamData(cartSession);
                        } catch (trackError) {
                            this.sendClickStreamDataError(
                                "order_completed_data_error",
                                trackError
                            );
                        }
                    },
                    (reponseError) => {
                        this.sendClickStreamDataError(
                            "order_completed_api_error",
                            reponseError
                        );
                    }
                );
            }
            this.footerService.setFooterObj({ footerData: false });
            this.footerService.footerChangeSubject.next(
                this.footerService.getFooterObj()
            );
        }
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
            }
        } catch (error) {
            console.log("sendClickStreamData error", error);
        }
    }

    ngAfterViewInit() {
        let currentCartSession;
        setTimeout(() => {
            currentCartSession = this._cartService.getCartSession();
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
                this._cartService.cart.next(data["noOfItems"]);
                let res = data;
                if (res["statusCode"] == 200) {
                    this._cartService.setCartSession(res);
                }
            });
        }, 2000);
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
}