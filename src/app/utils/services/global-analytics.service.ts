
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { LocalStorageService } from 'ngx-webstorage';
import { trackData } from '../clickStream';
import { LocalAuthService } from './auth.service';
import { DataService } from './data.service';

declare var dataLayer;
declare var digitalData;
declare var _satellite;

@Injectable({
  providedIn: 'root'
})
export class GlobalAnalyticsService {

  readonly COMMON_ORDER_KEYS = ["productID", "price", "quantity", "brand"];
  isServer: boolean = typeof window !== "undefined" ? false : true;
  isBrowser: boolean;

  constructor(
    private localStorageService: LocalStorageService,
    private _localAuthService: LocalAuthService,
    private _dataService: DataService,
    @Optional() @Inject(CONSTANTS.BROWSER_AGENT_TOKEN) private requestUserAgent: string,
    @Optional() @Inject(CONSTANTS.SERVER_CLIENT_IP) private reuestServerIp: string,
    @Inject(PLATFORM_ID) platformId
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  sendAdobeCall(data: any, trackingname = "genericPageLoad") {
    // console.log(environment["ISCHROME"]);
    if (this.isBrowser && _satellite && _satellite.track) {
      digitalData = Object.assign({}, data);
      _satellite.track(trackingname);
    }
  }

  sendGTMCall(data: any) {
    if (this.isBrowser && dataLayer) {
      dataLayer.push(data);
    }
  }

  sendToClicstreamViaSocket(data) {
    if (this.isBrowser ) {
      const user = this.localStorageService.retrieve('user');
      const previousUrl = localStorage.getItem("previousUrl");
      var trackingData = {
        message: (data.message) ? data.message : "tracking",
        session_id: user ? user.sessionId : null,
        cookie: "",
        user_id: user ? user.userId : null,
        url: document.location.href,
        device: "Mobile",
        ip_address: this.reuestServerIp,
        user_agent:  '',
        timestamp: new Date().getTime(),
        referrer: document.referrer,
        previous_url: (previousUrl && previousUrl.split("$$$").length >= 2) ? localStorage.getItem("previousUrl").split("$$$")[1] : ""
      }
      // Comment as we are rmeoving socket and will implement API in future releases
      // this.socket.emit("track", { ...trackingData, ...data });
      
    }
  }

  sendToClicstreamViaAPI(data) {
    if(this.isBrowser){
      trackData(data);
    }
  }

  sendPDPAddToCartTracking(product?, channel?, linkName?) {
    const TRACKING = this.getCommonTrackingObject(this.basicPDPTracking(product), channel, linkName);
    //Future:add extra tracking details as per requirement
    this.sendAdobeCall(TRACKING);
  }

  sendPLPAddToCartTracking(product?, channel?, linkName?) {
    const TRACKING = this.getCommonTrackingObject(this.basicPDPTracking(product), channel, linkName);
    //Future:add extra tracking details as per requirement
    this.sendAdobeCall(TRACKING);
  }

  sendAdobeOrderRequestTracking(request, linkName) {
    const TRACKING = this.getCommonTrackingObject(null, "checkout", linkName);
    TRACKING['payload'] = request;
    this.sendAdobeCall(TRACKING, "genericClick")
  }

  //this method gives basic common tracking object
  getCommonTrackingObject(product?, channel?, linkName?) {
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

  getTrackingOrder(product: any) {
    let order = {};
    this.COMMON_ORDER_KEYS.forEach((key) => { order[key] = product[key] });
    if (product['productTags'].length) {
      order['tags'] = (product['productTags'] as any[]).map((tag) => tag.name || tag.tagName).join("|");
    } else {
      order['tags'] = "";
    }
    return order;
  }

  taxons(categoryDetails) {
    const taxons = [];
    if (categoryDetails && categoryDetails.hasOwnProperty("taxonomyCode")) {
      const taxonomyCodes: any[] = (categoryDetails['taxonomyCode'] as string).split("/");
      taxonomyCodes.forEach((code) => { taxons.push(code || "") });
    }
    return taxons;
  }


  basicPDPTracking(productBo) {
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

  basicPLPTracking(product) {
    if (!product) return null;
    const PRODUCT = {};
    PRODUCT['productID'] = product['moglixPartNumber'];
    PRODUCT['price'] = product['salesPrice'];
    PRODUCT['quantity'] = product['quantityAvailable'];
    PRODUCT['brand'] = product['brandName'];
    PRODUCT['productTags'] = product['productTags'];
    return PRODUCT;
  }


  get loginStatusTracking() {
    const user = this.localStorageService.retrieve("user");
    return user && user["authenticated"] == "true"
      ? "registered user"
      : "guest";
  }

  get custDataTracking() {
    const user = this.localStorageService.retrieve("user");
    return {
      customerID: user && user["userId"] ? btoa(user["userId"]) : "",
      emailID: user && user["email"] ? btoa(user["email"]) : "",
      mobile: user && user["phone"] ? btoa(user["phone"]) : "",
      customerType: user && user["userType"] ? user["userType"] : "",
    };
  }

  sendMessage(msg: any) {
    if (this.isBrowser && this.requestUserAgent && this.requestUserAgent.toLocaleLowerCase().indexOf("googlebot") === -1 ) {
      var userSession = this._localAuthService.getUserSession();
      const previousUrl = localStorage.getItem("previousUrl");
      let prevUrl;
      if (previousUrl) {
        prevUrl =
          previousUrl.split("$$$").length >= 2
            ? localStorage.getItem("previousUrl").split("$$$")[1]
            : "";
      }
      var trackingData = {
        message: msg.message ? msg.message : "tracking",
        session_id: userSession ? userSession.sessionId : null,
        cookie: "",
        user_id: userSession ? userSession.userId : null,
        url: document.location.href,
        device: "Mobile",
        ip_address: this._dataService.clientIpFromServer || '',
        user_agent: this.requestUserAgent || navigator.userAgent,
        timestamp: new Date().getTime(),
        referrer: document.referrer,
        previous_url: prevUrl,
      };
      this.postClickStreamData({ ...trackingData, ...msg });
    }
  }

  postClickStreamData(data) {
    if (this.isBrowser) {
      console.log('postClickStreamData data', data);
      // console.log('clickstream in', data);
      // temp fix to check if this API impacting pageload time.
      setTimeout(() => {
        this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CLICK_STREAM, { body: data }).subscribe(res => {
          console.log('clickstream captured');
        });
      }, 3000);
    }else{
      console.log('clickstream called on server', data);
    }
  }

}
