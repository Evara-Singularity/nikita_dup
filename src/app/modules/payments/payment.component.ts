import { Component, ElementRef, EventEmitter, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { CartUtils } from "@app/utils/services/cart-utils";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { forkJoin } from "rxjs";
import CONSTANTS from "../../config/constants";
import { LocalAuthService } from "../../utils/services/auth.service";
import { CartService } from "../../utils/services/cart.service";
import { CommonService } from "../../utils/services/common.service";
import { DataService } from "../../utils/services/data.service";
import { GlobalLoaderService } from "../../utils/services/global-loader.service";
import { PaymentService } from "./payment.service";

// TODO:
/**
 * remove isSavedCardExist, savedCardsData, paymentForm
 */
@Component({
  selector: "checkout-payment",
  templateUrl: "./payment.html",
  styleUrls: ["./payment.scss"],
})
export class PaymentComponent implements OnInit {
  readonly REPLACE_URL = { replaceUrl: true };
  paymentBlock: number;
  globalConstants: any = CONSTANTS.GLOBAL;
  isSavedCardExist: boolean = false;
  savedCardsData: any;
  updateTabIndex: EventEmitter<number> = new EventEmitter();
  spp: boolean; // spp: Show Payment Popup
  invoiceType: string;
  totalAmount: number;
  messageEmi: string;
  messageCod: string;
  messageNeft: string;
  disableCod: boolean;
  showPopup: boolean = false;
  unAvailableMsnList: Array<any> = [];
  paymentForm: FormGroup;
  isPaymentSelected: boolean = false;
  canNEFT_RTGS = true;
  successPercentageRawData = null;
  paymentMode : any = CONSTANTS.PAYMENT_MODE

  constructor(
    public _dataService: DataService,
    private _loaderService: GlobalLoaderService,
    public _cartService: CartService,
    private _paymentService: PaymentService,
    private _localAuthService: LocalAuthService,
    public _commonService: CommonService,
    private _analytics: GlobalAnalyticsService,
    private _router: Router,
    private _elementRef: ElementRef
  ) {
    this.isShowLoader = true;
  }
  
  

  ngOnInit() {
    const gCartSession = this._cartService.getGenericCartSession;
    if (this._commonService.isBrowser && (gCartSession && Object.keys(gCartSession?.cart).length == 0) ||
      !((this._cartService.invoiceType == 'retail' && this._cartService.shippingAddress) ||
        (this._cartService.invoiceType == 'tax' && this._cartService.shippingAddress && this._cartService.billingAddress))
    ) { this._router.navigateByUrl('/checkout/address', this.REPLACE_URL); return }
    this.intialize();
    this._cartService.sendAdobeOnCheckoutOnVisit("payment");
    this.getSavedCardData();
    this._cartService.clearCartNotfications();
    this._cartService.updateNonDeliverableItemsAfterRemove(gCartSession['itemsList']);
    this.updatePaymentBlock(this.globalConstants['upi'], 'upi', 'upiSection');
  }

  private intialize() {
    if (this._commonService.isBrowser) {
      const cartData = this._cartService.getGenericCartSession;
      this._cartService.updateNonDeliverableItemsAfterRemove(cartData['itemsList']);
      this.canNEFT_RTGS = cartData["cart"]["agentId"];
      this.totalAmount =
        cartData["cart"]["totalAmount"] +
        cartData["cart"]["shippingCharges"] -
        cartData["cart"]["totalOffer"]; // intialize total amount
      const _cartItems = cartData["itemsList"] || [];
      const _cartMSNs = (_cartItems as any[]).map((item) => item["productId"]);
      this._paymentService.updatePaymentMsns(_cartMSNs);
      // TODO  -- change this and use it from cart service
      let invoiceType = this._cartService.invoiceType;
      this.invoiceType = invoiceType;
      if (invoiceType == "tax") {
        this.paymentBlock = this.globalConstants["razorPay"];
        this.isShowLoader = false;
      }
      this.disableCod = !(this._cartService.cashOnDeliveryStatus.isEnable);
      // TODO - this should used in case there are some COD not avalible
      this.unAvailableMsnList =
        this._cartService.codNotAvailableObj["itemsArray"];
      this.callApisAsyncly();
      this.analyticVisit(cartData);
    }
  }

  private getSavedCardData() {
    const userSession = this._localAuthService.getUserSession();
    const data = {
      userEmail: (userSession && userSession['email']) ? userSession['email'] : userSession['phone'],
      userType: this.invoiceType
    };

    if (this.invoiceType == 'tax') {
      data['userId'] = userSession['userId'];
      data['userEmail'] = '';
    }
    this._paymentService.getSavedCards(data, this.invoiceType)
      .subscribe((res) => {
        if (res['status'] === true && res['data']['user_cards'] !== undefined && res['data']['user_cards'] != null) {
          this.savedCardsData = res['data']['user_cards'];
          this.isSavedCardExist = true;
          this.paymentBlock = this.globalConstants['savedCard'];
        }
        this.isShowLoader = false;
      });
  }

  updatePaymentBlock(block, mode?, elementId?) {
    let cart = this._cartService.getGenericCartSession["cart"];
    this.totalAmount =
      cart["totalAmount"] + cart["shippingCharges"] - (cart["totalOffer"] || 0);
    this.messageEmi = "";
    this.messageCod = "";
    this.messageNeft = "";
    if (block == 4 && this.totalAmount < 3000) {
      this.messageEmi = "Not available below Rs. 3000";
      this.paymentBlock == null;
      return;
    } else if (block == 5 && this.totalAmount > CONSTANTS.GLOBAL.codMax) {
      this.messageCod = "Not available above Rs. " + CONSTANTS.GLOBAL.codMax;
      this.paymentBlock == null;
      return;
    } else if (block == 5 && this.totalAmount < 300) {
      this.messageCod = "Not available below Rs. 300";
      this.paymentBlock == null;
      return;
    } else if (block == 6 && this.totalAmount < 2000) {
      this.messageNeft = "Not available below Rs. 2000";
      this.paymentBlock == null;
      return;
    } else {
      this.paymentBlock = block;
      this.spp = true;
    }

    this.isPaymentSelected = true;

    this.changeInPaymentBlockAnalytic(cart, mode);

    if (elementId) {
      this.scollToSection(elementId);
    }
  }

  private changeInPaymentBlockAnalytic(cart: any, mode: any) {
    if (cart["itemsList"] !== null && cart["itemsList"]) {
      var trackData = {
        event_type: "click",
        page_type: "payment",
        label: "payment_select",
        channel: "Checkout",
        price: cart["cart"]["totalPayableAmount"].toString(),
        quantity: cart["noOfItems"],
        shipping: parseFloat(cart["shippingCharges"]),
        invoiceType: this.invoiceType,
        paymentMode: mode,
        itemList: cart["itemsList"].map((item) => {
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
      this._analytics.sendToClicstreamViaSocket(trackData);
    }
  }

  private analyticVisit(cartData: any) {
    if (cartData["itemsList"] !== null && cartData["itemsList"]) {
      var trackData = {
        event_type: "page_load",
        page_type: "payment",
        label: "view",
        channel: "Checkout",
        price: cartData["cart"]["totalPayableAmount"].toString(),
        quantity: cartData["noOfItems"],
        shipping: parseFloat(cartData["shippingCharges"]),
        invoiceType: this.invoiceType,
        itemList: cartData["itemsList"].map((item) => {
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
      this._analytics.sendToClicstreamViaSocket(trackData);
    }
  }

  scollToSection(elementId) {
    setTimeout(() => {
      this._elementRef.nativeElement.ownerDocument
        .getElementById(elementId)
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }

  outData(data) {
    this[data.selector] = !this[data.selector];
    this.showPopup = false;
  }

  removeTab(tabId) {
    this.isSavedCardExist = false;
  }

  tabIndexUpdated(index) {
    this.updateTabIndex.emit(index);
  }

  callApisAsyncly()
  {
    this.isShowLoader = true;
    const userSession = this._localAuthService.getUserSession();
    const data = { userEmail: userSession && userSession["email"] ? userSession["email"] : userSession["phone"], 
    userType: this.invoiceType
  };
    if (this.invoiceType == "tax") {
      data["userId"] = userSession["userId"];
      data["userEmail"] = "";
    }
    const savedCards = this._paymentService.getSavedCards(data, this.invoiceType)
    const paymentsMethodData = this._paymentService.getPaymentsMethodData(this.invoiceType);

    forkJoin([paymentsMethodData, savedCards]).subscribe((responses)=>{
      this.isShowLoader = false;
      this.handlePaymentsData(responses[0]);
      this.handleSavedCards(responses[1]);
      if (this._cartService.lastPaymentMode) {
        const { paymentBlock, mode, section } = CartUtils.getPaymentInfo(this._cartService.lastPaymentMode);
        this.updatePaymentBlock(paymentBlock, mode, section);
        return;
      }
    })
  }

  handleSavedCards(repsonse)
  {
    if (repsonse["status"] === true && repsonse["data"]["user_cards"]) {
      this.savedCardsData = repsonse["data"]["user_cards"];
      this.isSavedCardExist = true;
      this.paymentBlock = this.globalConstants["savedCard"];
    }
  }

  handlePaymentsData(response)
  {
    if (response["status"]) {
      this.successPercentageRawData = response["data"] || null;
    }
  }

  get neftSuccessPercentageData() {
    return this.successPercentageRawData && this.successPercentageRawData["NB"]
      ? this.successPercentageRawData["NB"]
      : null;
  }

  get walletSuccessPercentageData() {
    return this.successPercentageRawData &&
      this.successPercentageRawData["WALLET"]
      ? this.successPercentageRawData["WALLET"]
      : null;
  }

  get upiSuccessPercentageData() {
    return this.successPercentageRawData && this.successPercentageRawData["UPI"]
      ? this.successPercentageRawData["UPI"]
      : null;
  }

  learnMore(e) {
    this.showPopup = true;
  }

  set isShowLoader(value) {
    this._loaderService.setLoaderState(value);
  }
}
