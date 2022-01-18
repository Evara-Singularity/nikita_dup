import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

declare var digitalData;
declare var _satellite;


@Injectable({ providedIn: "root", })

export class TrackingService
{
    readonly COMMON_ORDER_KEYS = ["productID", "price", "quantity", "brand"];

    constructor(private _localStorageService: LocalStorageService,) { }

    sendPDPAddToCartTracking(product?, channel?, linkName?)
    {
        const TRACKING = this.getCommonTrackingObject(this.basicPDPTracking(product), channel, linkName);
        //Future:add extra tracking details as per requirement
        this.sendAdobeCall(TRACKING);
    }

    sendPLPAddToCartTracking(product?, channel?, linkName?)
    {
        const TRACKING = this.getCommonTrackingObject(this.basicPDPTracking(product), channel, linkName);
        //Future:add extra tracking details as per requirement
        this.sendAdobeCall(TRACKING);
    }

    sendAdobeOrderRequestTracking(request, linkName)
    {
        const TRACKING = this.getCommonTrackingObject(null, "checkout", linkName);
        TRACKING['payload'] = request;
        this.sendAdobeCall(TRACKING, "genericClick")
    }

    //this method gives basic common tracking object
    getCommonTrackingObject(product?, channel?, linkName?)
    {
        let tracking = { page: {}, order: {}, custData: this.custDataTracking };
        tracking['page']['channel'] = channel ? channel : "";
        tracking['page']['linkName'] = linkName ? linkName : "";
        tracking['page']['loginStatus'] = this.loginStatusTracking;
        if (product) {
            const TAXONS: any[] = this.taxons(product["categoryDetails"]);
            tracking['order'] = this.getTrackingOrder(product);
            if (TAXONS.length) {
                tracking['page']['linkPageName'] = `moglix:${TAXONS.join(":")}`;
                tracking['order']['productCategoryL1'] = TAXONS[0];
                tracking['order']['productCategoryL2'] = TAXONS[1];
                tracking['order']['productCategoryL3'] = TAXONS[2];
            }
        }
        return tracking;
    }

    getTrackingOrder(product: any)
    {
        let order = {};
        this.COMMON_ORDER_KEYS.forEach((key) => { order[key] = product[key] });
        if (product['productTags'].length) {
            order['tags'] = (product['productTags'] as any[]).map((tag) => tag.name || tag.tagName).join("|");
        } else {
            order['tags'] = "";
        }
        return order;
    }

    taxons(categoryDetails)
    {
        const taxons = [];
        if (categoryDetails && categoryDetails.hasOwnProperty("taxonomyCode")) {
            const taxonomyCodes: any[] = (categoryDetails['taxonomyCode'] as string).split("/");
            taxonomyCodes.forEach((code) => { taxons.push(code || "") });
        }
        return taxons;
    }

    sendAdobeCall(data: any, trackingname = "genericPageLoad")
    {
        if (_satellite && _satellite.track) {
            digitalData = Object.assign({}, data);
            _satellite.track(trackingname);
        }
    }

    basicPDPTracking(productBo)
    {
        if (!productBo) return null;
        const PRODUCT = {};
        PRODUCT['productID'] = productBo['partNumber'] || productBo['defaultPartNumber'];
        let pDetails = productBo["productPartDetails"][PRODUCT['productID']];
        let productPriceQuantity = (pDetails && pDetails['productPriceQuantity']) ? pDetails['productPriceQuantity'] : null;
        PRODUCT['quantity'] = productBo['quantityAvailable'];
        PRODUCT['brand'] = productBo['brandDetails'] ? productBo['brandDetails']['brandName'] : "";
        PRODUCT['productTags'] = productBo['productTags'];
        PRODUCT['categoryDetails'] = (productBo['categoryDetails'] && productBo['categoryDetails'][0]) ? productBo['categoryDetails'][0] : null;
        PRODUCT['price'] = null;
        if (productPriceQuantity && productPriceQuantity['india']['sellingPrice']) {
            PRODUCT['price'] = productPriceQuantity['india']['sellingPrice'];
        }
        return PRODUCT;
    }

    basicPLPTracking(product)
    {
        if (!product) return null;
        const PRODUCT = {};
        PRODUCT['productID'] = product['moglixPartNumber'];
        PRODUCT['price'] = product['salesPrice'];
        PRODUCT['quantity'] = product['quantityAvailable'];
        PRODUCT['brand'] = product['brandName'];
        PRODUCT['productTags'] = product['productTags'];
        return PRODUCT;
    }


    get loginStatusTracking()
    {
        const user = this._localStorageService.retrieve("user");
        return user && user["authenticated"] == "true"
            ? "registered user"
            : "guest";
    }

    get custDataTracking()
    {
        const user = this._localStorageService.retrieve("user");
        return {
            customerID: user && user["userId"] ? btoa(user["userId"]) : "",
            emailID: user && user["email"] ? btoa(user["email"]) : "",
            mobile: user && user["phone"] ? btoa(user["phone"]) : "",
            customerType: user && user["userType"] ? user["userType"] : "",
        };
    }
}