import { ViewEncapsulation } from "@angular/core";
import { Component } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import { BusinessOrderService } from "./businessOrder.service";
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  NavigationExtras,
} from "@angular/router";
import { map, filter } from "rxjs/operators";
import { Subscription } from "rxjs";
import { LocalStorageService } from "ngx-webstorage";
import { LocalAuthService } from "@app/utils/services/auth.service";
import CONSTANTS from "@app/config/constants";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";

declare var digitalData: {};
declare let _satellite;
@Component({
  selector: "bussiness-order",
  templateUrl: "./businessOrder.html",
  styleUrls: ["./businessOrder.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BussinessOrderComponent {
  IsHidden: boolean = true;
  orderArray: Array<any> = [];
  user: { authenticated: string };
  i: any;
  orders: Array<{}>;
  orderDetail: any;
  cancelReasons: Array<{}>;
  totalOrder: number = 0;
  pageSize = 10;
  pages: number = 0;
  pagesArray: any = [];
  currentPage: number = 0;
  extraPagination: number = 3;
  previousPagination: number = 0;
  spp: boolean;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  getPagination: boolean = true;
  sub: Subscription;
  openOrder: any;
  currentRoute: any;
  lastPage: any;
  readonly validBuyAgainStatus = [
    "DELIVERED",
    "RETURN REQUESTED",
    "RETURN REJECTED",
    "RETURN APPROVED",
    "RETURN PICKED",
    "RETURN DONE",
    "EXCHANGE REQUESTED",
    "EXCHANGE REJECTED",
    "EXCHANGE APPROVED",
    "EXCHANGE PICKED",
  ];
  currentOrderTotalAmount = 0.0;
  currentOrderShippingCharges = 0.0;
  currentOrderDiscountCharges = 0.0;
  currentOrderNoEMIDiscountCharges = 0.0;
  currentOrderShippingAddress = null;
  currentOrderBillingAddress = null;
  set isShowLoader(value) {
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private meta: Meta,
    private _localAuthService: LocalAuthService,
    private _businessOrderService: BusinessOrderService,
    public _router: Router,
    public _activatedRoute: ActivatedRoute,
    private _commonService: CommonService,
    public localStorageService: LocalStorageService,
    private loaderService: GlobalLoaderService
  ) {
    this.isShowLoader = false;
  }

  ngOnInit() {
    this.meta.addTag({ name: "robots", content: CONSTANTS.META.ROBOT2 });
    this.orderDetail = [];
    this.user = this._localAuthService.getUserSession();
    let page = this._activatedRoute.snapshot.queryParams.page || 0;
    this.openOrder = this._activatedRoute.snapshot.queryParams.order;
    this.currentRoute = this._commonService.getCurrentRoute(this._router.url);

    if (!this._activatedRoute.snapshot.queryParams.hasOwnProperty("token")) {
      this.initializePageParams(page);
    } else {
      this._commonService.bharatcraftUserSessionArrived.subscribe((res) => {
        if (res && this.user.authenticated === "true") {
          this.initializePageParams(page);
        } else {
          this._router.navigateByUrl("/login");
        }
      });
    }

    this.sub = this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        let page = this._activatedRoute.snapshot.queryParams.page || 0;
        if (page != this.lastPage) {
          this.initializePageParams(page);
        }
      });

    this._businessOrderService.getCancelReasons().subscribe((cancelReasons) => {
      if (
        cancelReasons != undefined &&
        cancelReasons != null &&
        Array.isArray(cancelReasons)
      ) {
        this.cancelReasons = cancelReasons;
      }
    });
    let userSession = this._localAuthService.getUserSession();

    let pageData = {
      pageName: "”moglix:account dashboard-myorders",
      channel: "moglix:my account",
      subSection: "moglix:account dashboard-myorders",
      loginStatus:
        userSession &&
        userSession.authenticated &&
        userSession.authenticated == "true"
          ? "registered user"
          : "guest",
    };
    let custData = {
      customerID:
        userSession && userSession["userId"] ? btoa(userSession["userId"]) : "",
      emailID:
        userSession && userSession["email"] ? btoa(userSession["email"]) : "",
      mobile:
        userSession && userSession["phone"] ? btoa(userSession["phone"]) : "",
      customerType:
        userSession && userSession["userType"] ? userSession["userType"] : "",
    };
    let order = {};
    digitalData["page"] = pageData;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
    if (_satellite) {
      _satellite.track("genericPageLoad");
    }
  }

  initializePageParams(page) {
    if (!page) {
      this.getAllOrders(page);
      this.lastPage = page;
    } else {
      page = parseInt(page) - 1;
      if (isNaN(page) || page < 0) {
        this.clearPosParam();
      } else {
        this.getAllOrders(page);
        this.lastPage = parseInt(page) + 1;
      }
    }
  }

  getAllOrders(page) {
    this.currentPage = page + 1;
    this.isShowLoader = true;
    this._businessOrderService.getOrderbyUserid(page).subscribe((res) => {
      this.isShowLoader = false;
      if (res["status"] == true) {
        if (res["numberOfOrder"] > this.pageSize)
          this.pages = res["numberOfOrder"] / this.pageSize + 1;
        if (this.getPagination) {
          this.getPagination = false;
          for (let i = 0; i < res["numberOfOrder"]; i++) {
            this.pagesArray.push(i);
          }
        }
        this.orders = res["data"];
        console.log(JSON.stringify(this.orders, null, 2));
        this.orders.forEach((element) => {
          element["isOrderVisible"] = false;
        });
      } else if (res["statusCode"] == 500 || res["status"] == false) {
        this.orders = [];
      }
      if (this.orders[0]) {
        if (!this.openOrder) {
          this.openOrder = this.orders[0]["orderId"];
        }
        const result =
          this.orders.findIndex((x) => x["orderId"] == this.openOrder) || 0;
        if (result == -1) {
          this.showOrder(this.orders[0]["orderId"], 0);
        } else {
          this.showOrder(this.orders[result]["orderId"], result);
        }
      }
    });
  }

  clearPosParam() {
    this._router.navigate([this.currentRoute]);
  }

  showOrder(orderId, index) {
    this.isShowLoader = true;
    this._businessOrderService
      .getOrderDetail(orderId, this.user["userId"])
      .pipe(
        map((cr) => {
          if (
            cr != undefined &&
            cr != null &&
            cr != "" &&
            Array.isArray(cr) &&
            cr.length > 0
          ) {
            for (let i = 0; i < cr.length; i++) {
              cr[i]["cancelReasonId"] = "";
              cr[i]["showTrackOrder"] = false;
              cr[i]["isCanceled"] = false;
            }
            this._router.navigate([this.currentRoute], {
              queryParams: { order: orderId },
              queryParamsHandling: "merge",
              replaceUrl: true,
            });
          }
          return cr;
        })
      )
      .subscribe((res) => {
        this.isShowLoader = false;
        this.orders.forEach((element, i) => {
          if (i == index) {
            element["isOrderVisible"] = true;
          } else {
            element["isOrderVisible"] = false;
          }
        });
        this.orderDetail[orderId] = res;
        this.currentOrderTotalAmount = this.getTotalAmount(
          this.orderDetail[orderId]
        );
        this.currentOrderShippingCharges = this.getShippingCharge(
          this.orderDetail[orderId]
        );
        this.currentOrderDiscountCharges = this.getDiscountCharge(
          this.orderDetail[orderId]
        );
        this.currentOrderNoEMIDiscountCharges = this.getNoEMIDiscountCharge(
          this.orderDetail[orderId]
        );
        this.setCurrentOrderAddressDetails(this.orderDetail[orderId]);
      });
  }

  getTotalAmount(orderDetails) {
    let totalAmount: number = 0.0;
    for (let i = 0; i < orderDetails.length; i++) {
      totalAmount =
        totalAmount +
        orderDetails[i]["price"] * parseInt(orderDetails[i]["Quantity"]) +
        orderDetails[i]["shipping_charge"] -
        parseInt(orderDetails[i]["discount"]);
    }
    return totalAmount;
  }

  getShippingCharge(orderDetails) {
    let shippingCharge: number = 0.0;
    for (let i = 0; i < orderDetails.length; i++) {
      shippingCharge = shippingCharge + orderDetails[i]["shipping_charge"];
    }
    return shippingCharge;
  }

  getDiscountCharge(orderDetails) {
    let shippingCharge: number = 0.0;
    for (let i = 0; i < orderDetails.length; i++) {
      shippingCharge = shippingCharge + orderDetails[i]["discount"];
    }
    return shippingCharge;
  }
  getNoEMIDiscountCharge(orderDetails) {
    let emidiscountCharge: number = 0.0;
    for (let i = 0; i < orderDetails.length; i++) {
      emidiscountCharge = emidiscountCharge + orderDetails[i]["emi_discount"];
    }
    return emidiscountCharge;
  }

  changePagination(page) {
    let extras: NavigationExtras = {};
    let currentRoute = this._commonService.getCurrentRoute(this._router.url);
    let fragmentString = this._activatedRoute.snapshot.fragment;
    if (fragmentString != null) {
      extras.fragment = fragmentString;
    }

    let currentQueryParams = this._activatedRoute.snapshot.queryParams;
    let newQueryParams: {} = {};
    if (Object.keys(currentQueryParams).length) {
      for (let key in currentQueryParams) {
        newQueryParams[key] = currentQueryParams[key];
      }
    }

    if (page != "1") {
      newQueryParams["page"] = page;
    } else if (newQueryParams["page"] != undefined) {
      delete newQueryParams["page"];
    }
    if (Object.keys(newQueryParams).length > 0)
      extras.queryParams = newQueryParams;
    else extras.queryParams = {};
    this._router.navigate([currentRoute], extras);
  }

  pageChanged(event) {
    this.changePagination(event);
  }

  showBuyAgain_Invoice(status: string) {
    return this.validBuyAgainStatus.indexOf(status.toUpperCase()) > -1;
  }
  setCurrentOrderAddressDetails(orderDetails: any[]) {
    if (orderDetails && orderDetails.length > 0 && orderDetails[0]["address"]) {
      let address = orderDetails[0]["address"];
      this.currentOrderShippingAddress = address["shipping_address"];
      this.currentOrderBillingAddress = address["billing_address"];
    } else {
      this.currentOrderShippingAddress = null;
      this.currentOrderBillingAddress = null;
    }
  }

  trackAndNavigateToProductPage(url, productID, e) {
    const user = this.localStorageService.retrieve("user");
    let page = {
      linkPageName: "moglix:account dashboard-myorders",
      linkName: "buy again",
      channel: "moglix:my account",
      loginStatus: user.userId ? "registered" : "guest",
    };
    let custData = {
      customerID: user && user["userId"] ? btoa(user["userId"]) : "",
      emailID: user && user["email"] ? btoa(user["email"]) : "",
      mobile: user && user["phone"] ? btoa(user["phone"]) : "",
      customerType: user && user["userType"] ? user["userType"] : "",
    };
    let order = {
      productID: productID,
    };

    digitalData["page"] = page;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
    console.log(digitalData);
    if (_satellite) {
      _satellite.track("genericClick");
    }
    e.stopPropagation();
    e.preventDefault();

    if (url) {
      this._router.navigate(["/" + url]);
    }
  }
}
