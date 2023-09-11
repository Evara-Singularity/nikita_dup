import { Compiler, Component,ComponentFactoryResolver, ComponentRef, ElementRef, EventEmitter, Injector, NgModuleRef, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CartUtils } from "@app/utils/services/cart-utils";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { RetryPaymentService } from "@app/utils/services/retry-payment.service";
import { forkJoin,Subscription } from "rxjs";
import CONSTANTS from "../../config/constants";
import { LocalAuthService } from "../../utils/services/auth.service";
import { CartService } from "../../utils/services/cart.service";
import { PopupService } from "@app/utils/services/popup.service";
import { CommonService } from "../../utils/services/common.service";
import { DataService } from "../../utils/services/data.service";
import { GlobalLoaderService } from "../../utils/services/global-loader.service";
import { SharedTransactionDeclinedComponent } from '../shared-transaction-declined/shared-transaction-declined.component';
import { SharedTransactionDeclinedModule } from '../shared-transaction-declined/shared-transaction-declined.module';
import { PaymentService } from "./payment.service";
import { NavigationService } from "@app/utils/services/navigation.service";

// TODO:
/**
 * remove isSavedCardExist, savedCardsData, paymentForm
 */
@Component({
  selector: "checkout-payment",
  templateUrl: "./payment.html",
  styleUrls: ["./payment.scss"],
})
export class PaymentComponent implements OnInit
{

  readonly REPLACE_URL = { replaceUrl: true };
  paymentBlock: number;
  globalConstants: any = CONSTANTS.GLOBAL;
  isSavedCardExist: boolean = false;
  savedCardsData: any;
  payUOffersData: any ={};
  updateTabIndex: EventEmitter<number> = new EventEmitter();
  spp: boolean; // spp: Show Payment Popup
  invoiceType: string;
  totalAmount: number;
  messageEmi: string;
  messageCod: string;
  messageNeft: string;
  messageBnpl: string;
  disableCod: boolean;
  showPopup: boolean = false;
  payUOfferPopup : boolean = false ;
  unAvailableMsnList: Array<any> = [];
  paymentForm: FormGroup;
  isPaymentSelected: boolean = false;
  canNEFT_RTGS = true;
  successPercentageRawData = null;
  paymentMode: any = CONSTANTS.PAYMENT_MODE

  orderId = null;
  paymentErrorType = null;
  isRetryPayment = false;//Indicateas retry payment flow.
  txnDeclinedInstance: ComponentRef<SharedTransactionDeclinedComponent> = null;
  @ViewChild("txnDeclined", { read: ViewContainerRef })
  txnDeclinedContainerRef: ViewContainerRef;
  isSavedCardChecked: any;
  hasPhoneNumber : boolean;
  isPayUOffersAvailable : boolean = false;
  payUOfferPopupData : any ={};
  payUOfferPopUpSubscription: Subscription;
  payUOfferPopUpDataSubscription: Subscription;

  bankOfferBottomSheetInstance = null;
  @ViewChild('bankOfferBottomSheet', { read: ViewContainerRef })
  bankOfferBottomSheetRef: ViewContainerRef;

  backButtonClickPaymentSubscription: Subscription;
  isBackClicked: boolean=false; 
  private cancelIconClickedSubscription: Subscription;
  public isCancelIconClicked: boolean=true;  
  missOutSavingAmount: number=0;
  popStateListener;
  isBrowser = false;

  
  constructor(
    public _dataService: DataService,
    private _loaderService: GlobalLoaderService,
    public _cartService: CartService,
    public _popupService:PopupService,
    private _paymentService: PaymentService,
    private _localAuthService: LocalAuthService,
    public _commonService: CommonService,
    private _analytics: GlobalAnalyticsService,
    private _router: Router,
    private _elementRef: ElementRef,
    private _activatedRoute: ActivatedRoute,
    private _compiler: Compiler,
    private _injector: Injector,
    private _retryPaymentService: RetryPaymentService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private _navigationService: NavigationService

  )
  {
    this.isShowLoader = true;
    this.isBrowser = _commonService.isBrowser
  }
  

  ngOnInit()
  {
    this._navigationService.setBackClickedPayment(false);
    this._navigationService.setCancelIconPaymentClicked(true);
    this.backButtonClickPaymentSubscription = this._navigationService.isBackClickedPayment$.subscribe(
      value => {
        this.isBackClicked = value;
      }
    );
    this.cancelIconClickedSubscription = this._navigationService.isCancelIconPaymentClicked$.subscribe(
      value => {
        this.isCancelIconClicked = value;
      }
    );
    const queryParams = this._activatedRoute.snapshot.queryParams;
    this.orderId = queryParams['orderId'] || queryParams['txnId'];

    this.payUOfferPopUpSubscription = this._popupService.payUOfferPopUp$.subscribe(data => {
      //console.log("consumed 1")
      this.payUOfferPopup = data;
    });

    this.payUOfferPopUpDataSubscription = this._popupService.payUOfferPopUpData$.subscribe(data => {
      // console.log("consumed 2")
      this.payUOfferPopupData = data;
    });

    //CASE-1: Valid OrderId from backend
    if (this.orderId) {
      this.isRetryPayment = true;
      this.fetchTransactionDetails();
      return;
    }
    //CASE-2:BAD_REQUEST_ERROR or GATE_WAY_ERROR
    this.paymentErrorType = queryParams['error'] || null;
    if(this.paymentErrorType)
    {
      this.navigateToQuickorder();
      return;
    }
    if (this._commonService.isBrowser && (this._cartService.getGenericCartSession && Object.keys(this._cartService.getGenericCartSession?.cart).length == 0) ||
      !((this._cartService.invoiceType == 'retail' && this._cartService.shippingAddress) ||
        (this._cartService.invoiceType == 'tax' && this._cartService.shippingAddress && this._cartService.billingAddress))
    ) {
      this._router.navigateByUrl('/checkout/address', this.REPLACE_URL);
      return;
    }
    this.intialize();
    this._cartService.sendAdobeOnCheckoutOnVisit("payment");
    this._cartService.clearCartNotfications();
    this.doubleCurrentPageInHistory();
    if (this.isBrowser && this._router.url.includes('/checkout/payment')) {
      this.backUrlNavigationHandler();  
       }
  }
  private doubleCurrentPageInHistory(): void {
    if (!this.isPageDoubled) {
      window.history.pushState({ page: 'samePage' }, null, window.location.href);
      this.isPageDoubled = true;
    }
  }
  private isPageDoubled = false;
  
  backUrlNavigationHandler() {
    this.popStateListener = (event:PopStateEvent):void => {
      this.doubleCurrentPageInHistory();
      this.backButtonClickPaymentSubscription = this._navigationService.isBackClickedPayment$.subscribe(
        value => {
          this.isBackClicked = true;
        }
      );
    };
    window.addEventListener('popstate', this.popStateListener, { once: true });
  }


  private intialize()
  {
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
      this.unAvailableMsnList = this._cartService.codNotAvailableObj["itemsArray"];
      this.callApisAsyncly();
      this.analyticVisit(cartData);
      this.missOutSavingAmount=this.calculate_mrp_totalPayable_Difference();
    }
  }
  calculate_mrp_totalPayable_Difference() { 
    const sums = this._cartService.getGenericCartSession["itemsList"].reduce((acc, item) => {
      acc.sum_mrpAmounts += (item.amount * item.productQuantity);
      acc.sum_totalPayableAmounts += (item.totalPayableAmount + item.shippingCharges);
      return acc;
    }, { sum_mrpAmounts: 0, sum_totalPayableAmounts: 0 });
    return sums.sum_mrpAmounts - sums.sum_totalPayableAmounts;
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
    this.messageBnpl ="";
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
    } 
    else {
      this.paymentBlock = block;
      this.spp = true;
    }

    if(this.isSavedCardChecked && block !==null){
      this._paymentService.setSavedCardDeselect(true);
    }
    this.isPaymentSelected = true;

    this.changeInPaymentBlockAnalytic(cart, mode);

    if (elementId) {
      this.scollToSection(elementId);
    }
  }

  private changeInPaymentBlockAnalytic(cart: any, mode: any)
  {
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
        itemList: cart["itemsList"].map((item) =>
        {
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

  private analyticVisit(cartData: any)
  {
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
        itemList: cartData["itemsList"].map((item) =>
        {
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

  scollToSection(elementId)
  {
    setTimeout(() =>
    {
      this._elementRef.nativeElement.ownerDocument
        .getElementById(elementId)
        .scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }

  outData(data)
  {
    this[data.selector] = !this[data.selector];
    this.showPopup = false;
  }

  removeTab(tabId)
  {
    this.isSavedCardExist = false;
  }

  tabIndexUpdated(index)
  {
    this.updateTabIndex.emit(index);
  }

  cardSelected(isChecked){
    if(isChecked){
      this.isSavedCardChecked = isChecked
      this.updatePaymentBlock(null);
    }
   }

  callApisAsyncly() {
    this.isShowLoader = true;
    const userSession = this._localAuthService.getUserSession();
    // ?userEmail=7044317877&userType=retail&userId=3395297&phone=7044317877
    const data = {
      userEmail: userSession && userSession["email"] ? userSession["email"] : ((userSession["phone"]) ? userSession["phone"] : ''),
      userType: this.invoiceType,
      userId: userSession["userId"],
      phone: userSession["phone"] || ''
    };
    const savedCards = this._paymentService.getSavedCards(data, this.invoiceType)
    const paymentsMethodData = this._paymentService.getPaymentsMethodData(this.invoiceType);
    const payUOffersData =this._paymentService.getPayUOffers(this.invoiceType);

    forkJoin([paymentsMethodData, savedCards,payUOffersData]).subscribe((responses) => {
      this.isShowLoader = false;
      this.handlePaymentsData(responses[0]);
      this.handleSavedCards(responses[1]);
      this.handlePayUOffersData(responses[2]);
    })
  }

  handleSavedCards(repsonse)
  {
    if (this._cartService.lastPaymentMode) {
      const { paymentBlock, mode, section } = CartUtils.getPaymentInfo(this._cartService.lastPaymentMode);
      this.updatePaymentBlock(paymentBlock, mode, section);
      return;
    }
    if (repsonse["status"] === true && repsonse["data"]["user_cards"]) {
      this.savedCardsData = repsonse["data"]["user_cards"];
      this.isSavedCardExist = true;
      this.paymentBlock = this.globalConstants["savedCard"];
    }
    // this.updatePaymentBlock(this.globalConstants['upi'], 'upi', 'upiSection');
  }

  handlePaymentsData(response)
  {
    if (response["status"]) {
      this.successPercentageRawData = response["data"] || null;
    }
  }

  handlePayUOffersData(response)
  {
    if (response["status"] && response["data"] != null) {
      let responseData = response["data"];
      let offers =responseData['result']['payUOfferDetails']
     
      //this.isPayUOffersAvailable = true;

      var offersArray = [];
       
      if(offers)
      {
          offers.forEach(function(item) {
      offersArray.push({"description":item['description'],"tnc":item['tnc']});
            });
      }
      this.payUOffersData['offers'] = offersArray;
    }
  }

  async initiateBankOfferGuidlinesPopUp(offerData) {
    if (!this.bankOfferBottomSheetInstance) {
      const { BankOfferGuildlinesComponent } = await import(
        '../../components/bank-offer-guildlines/bank-offer-guildlines.component'
      );
      const factory = this.cfr.resolveComponentFactory(BankOfferGuildlinesComponent);
      this.bankOfferBottomSheetInstance = this.bankOfferBottomSheetRef.createComponent(
        factory,
        null,
        this.injector
      );
      this.bankOfferBottomSheetInstance.instance['bm'] = true;
      this.bankOfferBottomSheetInstance.instance['bankOfferData'] = offerData;
    } else {
      //toggle
      this.bankOfferBottomSheetInstance.instance['bankOfferData'] = offerData;
      this.bankOfferBottomSheetInstance.instance['bm'] = !(this.bankOfferBottomSheetInstance.instance['bm']);
    }
  }

  get neftSuccessPercentageData()
  {
    return this.successPercentageRawData && this.successPercentageRawData["NB"]
      ? this.successPercentageRawData["NB"]
      : null;
  }

  get walletSuccessPercentageData()
  {
    return this.successPercentageRawData &&
      this.successPercentageRawData["WALLET"]
      ? this.successPercentageRawData["WALLET"]
      : null;
  }

  get upiSuccessPercentageData()
  {
    return this.successPercentageRawData && this.successPercentageRawData["UPI"]
      ? this.successPercentageRawData["UPI"]
      : null;
  }

  learnMore(e)
  {
    this.showPopup = true;
  }

  set isShowLoader(value)
  {
    this._loaderService.setLoaderState(value);
  }

  fetchTransactionDetails()
  {
    this.isShowLoader = true;
    this._retryPaymentService.getPaymentDetailsByOrderId(this.orderId).subscribe((response) =>
    {
      if (response.status && response['data']['shoppingCartDto']) {
        this.openTxnDeclinedPopup(response['data']['shoppingCartDto']);
      } else {
        this.navigateToQuickorder();
      }
      this.isShowLoader = false;
    },
      (error) => { this.navigateToQuickorder(); })
  }

  async openTxnDeclinedPopup(shoppingCartDto)
  {
    const txnDeclinedModule = await import('./../../modules/shared-transaction-declined/shared-transaction-declined.module').then(m => m.SharedTransactionDeclinedModule);
    const moduleFactory = await this._compiler.compileModuleAsync(txnDeclinedModule);
    const txnDeclinedModuleRef: NgModuleRef<SharedTransactionDeclinedModule> = moduleFactory.create(this._injector);
    const componentFactory = txnDeclinedModuleRef.instance.resolveComponent();
    this.txnDeclinedInstance = this.txnDeclinedContainerRef.createComponent(componentFactory, null, txnDeclinedModuleRef.injector);
    this.txnDeclinedInstance.instance.shoppingCartDto = shoppingCartDto;
    this.txnDeclinedInstance.instance.userId = this._localAuthService.getUserSession()['userId'];
    this.txnDeclinedInstance.instance.orderId = this.orderId;
    (this.txnDeclinedInstance.instance["emitCloseEvent$"] as EventEmitter<boolean>).subscribe((paymentDetails) =>
    {
      this.txnDeclinedInstance = null;
      this.txnDeclinedContainerRef.remove();
      this.setCartServiceDetails(paymentDetails);
      this.intialize();
    });
  }

  setCartServiceDetails(paymentDetails)
  {
    this._cartService.invoiceType = paymentDetails.invoiceType;
    this._cartService.shippingAddress = paymentDetails.shippingAddress;
    this._cartService.billingAddress = paymentDetails.billingAddress;
    this._cartService.lastPaymentMode = paymentDetails.lastPaymentMode;
    this._cartService.lastParentOrderId = paymentDetails.lastParentOrderId;
    this._cartService.buyNow = paymentDetails.buyNow;
  }

  navigateToQuickorder() { 
    this._router.navigateByUrl('/quickorder', this.REPLACE_URL); 
  }

  togglePayOfferPopup(mode: boolean) {
    if (mode) {
      this.payUOfferPopup = true
      this._commonService.setBodyScroll(null, false);
    } else {
      this.payUOfferPopup= false
      this._commonService.setBodyScroll(null, true);
    }
  }

  closebackpopup(){
    this._navigationService.setBackClickedPayment(false);
    this._navigationService.setCancelIconPaymentClicked(false);
  }

  backFromBackPopup(){
  this._navigationService.goBack();
  }   
  
  ngOnDestroy() {
    if (this.payUOfferPopUpSubscription) {
      this.payUOfferPopUpSubscription.unsubscribe();
    }
    if (this.payUOfferPopUpDataSubscription) {
      this.payUOfferPopUpDataSubscription.unsubscribe();
    }
    if (this.backButtonClickPaymentSubscription) this.backButtonClickPaymentSubscription.unsubscribe();
    if (this.cancelIconClickedSubscription) this.cancelIconClickedSubscription.unsubscribe();
    window.removeEventListener('popstate', this.popStateListener);
  }
}