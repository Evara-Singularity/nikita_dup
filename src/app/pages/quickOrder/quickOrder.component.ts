import {
  Component,
  ViewEncapsulation,
  Input,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ComponentFactoryResolver,
  Injector,
  ViewContainerRef,
  ViewChild,
  EventEmitter,
} from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { ClientUtility } from "@app/utils/client.utility";
import { AddressService } from "@app/utils/services/address.service";
import { DataService } from "@app/utils/services/data.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductService } from "@app/utils/services/product.service";
import { LocalAuthService } from "@services/auth.service";
import { CartService } from "@services/cart.service";
import { CommonService } from "@services/common.service";
import { forkJoin, Subject, Subscription } from "rxjs";
import { delay, map } from "rxjs/operators";
import { CheckoutUtil } from "../checkout-v2/checkout-util";

@Component({
  selector: "quick-order",
  templateUrl: "./quickOrder.html",
  styleUrls: ["./quickOrder.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class QuickOrderComponent implements OnInit, AfterViewInit, OnDestroy {
  isCartNoItems: boolean = false;
  cartSubscription: Subscription;
  addToCartSubscription: Subscription;

  @Input("addDeliveryOrBilling") addDeliveryOrBilling: Subject<any> =
    new Subject();
  readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
  deliveryAddress = null;
  billingAddress = null;
  invoiceType = this.INVOICE_TYPES.RETAIL;
  cartSession = null;
  showPromoOfferPopup: boolean = false;
  userData: any;
  addressCount: number = 0;
  addressUpdated = false;
  // ondemad loaded component for homeMiscellaneousCarousel ( Buy it again, wishlist & FBT )
  homeMiscellaneousCarouselInstance = null;
  @ViewChild("homeMiscellaneousCarousel", { read: ViewContainerRef })
  homeMiscellaneousCarouselContainerRef: ViewContainerRef;
  // ondemad loaded component for quickOrderMiscellaneousCarousel
  quickOrderMiscellaneousCarouselInstance = null;
  @ViewChild("quickOrderMiscellaneousCarousel", { read: ViewContainerRef })
  quickOrderMiscellaneousCarouselContainerRef: ViewContainerRef;
  // on demand loading of wishlistPopup
  wishlistPopupInstance = null;
  @ViewChild("wishlistPopup", { read: ViewContainerRef })
  wishlistPopupContainerRef: ViewContainerRef;
  wishListData: Array<object> = [];
  // on demand loading of wishlistPopup
  simillarProductsPopupInstance = null;
  @ViewChild("simillarProductsPopup", { read: ViewContainerRef })
  simillarProductsPopupContainerRef: ViewContainerRef;

  constructor(
    public _localAuthService: LocalAuthService,
    public _cartService: CartService,
    public _commonService: CommonService,
    private _loaderService: GlobalLoaderService,
    public router: Router,
    private _dataService: DataService,
    private injector: Injector,
    private cfr: ComponentFactoryResolver,
    private _addressService: AddressService,
    private _productService: ProductService
  ) {
    this._cartService.getGenericCartSession;
  }

  ngOnInit(): void {
    this.userData = this._localAuthService.getUserSession();
    if (this._localAuthService.isUserLoggedIn()) {
      this.getWishlistData();
    }
  }

  ngAfterViewInit(): void {
    this._loaderService.setLoaderState(false);
    let i = 0;
    this.cartSubscription = this._cartService
      .getCartUpdatesChanges()
      .pipe(delay(250))
      .subscribe((cartSession) => {
        if (
          cartSession &&
          cartSession.itemsList &&
          cartSession.itemsList.length === 0
        ) {
          this.isCartNoItems = true;
        } else {
          this.isCartNoItems = false;
          if(this.homeMiscellaneousCarouselInstance == null && i == 0){
            this.callHomePageWidgetsApis();
            i=i+1;
          }
        }
      });
      this.addSubscribers();
  }

  ngOnDestroy() {
    if (this.cartSubscription) this.cartSubscription.unsubscribe();
    if (this.addToCartSubscription) this.addToCartSubscription.unsubscribe();
    if (this.homeMiscellaneousCarouselContainerRef) {
      this.homeMiscellaneousCarouselInstance = null;
      this.homeMiscellaneousCarouselContainerRef.remove();
    }
    if (this.quickOrderMiscellaneousCarouselContainerRef) {
      this.quickOrderMiscellaneousCarouselInstance = null;
      this.quickOrderMiscellaneousCarouselContainerRef.remove();
    }
    if (this.simillarProductsPopupInstance) {
      this.simillarProductsPopupInstance = null;
      this.simillarProductsPopupContainerRef.remove();
    }
    if (this.wishlistPopupInstance) {
      this.wishlistPopupInstance = null;
      this.wishlistPopupContainerRef.remove();
    }
  }

  private addSubscribers() {
    this.addToCartSubscription =
      this._cartService.isAddedToCartSubject.subscribe((response) => {
        const productId = (response && response["productId"]) || null;
        const filterdData = this.wishListData.filter(
          (res) => res["moglixPartNumber"] == productId
        );
        if (filterdData && filterdData.length > 0) {
          this.removeItemFromPurchaseList(response);
          return;
        }
        this.refreshAllApis();
      });
  }

  private refreshAllApis() {
    setTimeout(()=>{
      if(this.homeMiscellaneousCarouselContainerRef != undefined){
        this.homeMiscellaneousCarouselInstance
        this.homeMiscellaneousCarouselContainerRef.remove();
        this.homeMiscellaneousCarouselInstance = null;
        this.callHomePageWidgetsApis();
      }
      if(this.quickOrderMiscellaneousCarouselContainerRef != undefined){
        this.quickOrderMiscellaneousCarouselContainerRef.remove();
        this.quickOrderMiscellaneousCarouselInstance = null;
        this.getAllCategoryByMsns();
      }
    },2000)
    if(this._localAuthService.isUserLoggedIn()){ this.getWishlistData(); }
  }

  navigateToCheckout() {
    if (this._localAuthService.isUserLoggedIn()) {
      if (!this.deliveryAddress) {
        this.addDeliveryOrBilling.next({addressType: "Delivery", redirectedTo:"checkout/address"});
        return;
      }
    }
    const invalidIndex = this._cartService.findInvalidItem();
    if (invalidIndex > -1) return;
    this._localAuthService.setBackURLTitle(
      this.router.url,
      "Continue to checkout"
    );
    this.router.navigate(["/checkout/login"], {
      queryParams: { title: "Continue to checkout" },
    });
    this._commonService.adobe_tracking_proceed_to_checkout('proceed_to_checkout')
    this._commonService.updateUserSession();
  }

  /**@description triggers the unavailbel item pop-up from notfications */
  viewUnavailableItemsFromNotifacions(types: string[]) {
    if (types && types.length) this._cartService.viewUnavailableItems(types);
  }

  /**
  * @description to extract non-serviceable and COD msns
  * @param postCode deliverable post code
  */
  verifyServiceablityAndCashOnDelivery(postCode, cartSession)
  {
      const cartItems: any[] =  cartSession['itemsList'] || [];
      if ((!cartItems) || (cartItems.length === 0)) return;
      const MSNS = cartItems.map(item => item.productId);
      this._addressService.getServiceabilityAndCashOnDelivery({ productId: MSNS, toPincode: postCode }).subscribe((response) =>
      {
          if (!response) return;
          const AGGREGATES = CheckoutUtil.formatAggregateValues(response);
          const NON_SERVICEABLE_MSNS: any[] = CheckoutUtil.getNonServiceableMsns(AGGREGATES);
          const NON_CASH_ON_DELIVERABLE_MSNS: any[] = CheckoutUtil.getNonCashOnDeliveryMsns(AGGREGATES);
          this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
          this.updateNonDeliverableItems(cartItems, NON_CASH_ON_DELIVERABLE_MSNS);
      })
  }
  
      /**
      * @description to update the non serviceable items which are used in cart notfications
      * @param contains items is cart
      * @param nonServiceableMsns containes non serviceable msns
      */
      updateNonServiceableItems(cartItems: any[], nonServiceableMsns: any[])
      {
          if (nonServiceableMsns.length) {
              const ITEMS = CheckoutUtil.filterCartItemsByMSNs(cartItems, nonServiceableMsns);
              const NON_SERVICEABLE_ITEMS = CheckoutUtil.formatNonServiceableFromCartItems(ITEMS);
              this._cartService.setUnserviceables(NON_SERVICEABLE_ITEMS);
              return;
          }
          this._cartService.setUnserviceables([]);
         // this.sendServiceableCriteo();
      }
  
  /**@description updates global object to set in COD is available or not and used in payment section */
  updateNonDeliverableItems(cartItems: any[], nonCashonDeliverableMsns: any[])
  {
      this._cartService.updateNonDeliverableItems(cartItems, nonCashonDeliverableMsns);
  }

  //Address Information
  handleDeliveryAddressEvent(address, callShipping = false) {
    this.deliveryAddress = address;
    this._cartService.shippingAddress = address;
    this.verifyDeliveryAndBillingAddress(
      this.invoiceType,
      this.deliveryAddress
    );
    this._cartService.callShippingValueApi(this.cartSession);
    const POST_CODE = this.deliveryAddress && this.deliveryAddress['postCode'];
        if (!POST_CODE) return;
        const cartSession = this._cartService.getCartSession();
        this.verifyServiceablityAndCashOnDelivery(POST_CODE , cartSession);
        this.updateShipping();
  }

  updateShipping() {
    if(this.addressUpdated) {
      const cartSession = this._cartService.getCartSession();
      const sro = this._cartService.getShippingObj(cartSession);
      this._cartService.getShippingValue(sro).subscribe((data) => {
        this._cartService.updateShippingCharges(data, cartSession);
      });
    }
    this.addressUpdated = true;
  }

  handleBillingAddressEvent(address) {
    this.billingAddress = address;
    this._cartService.billingAddress = address;
    this.updateShipping();
  }

  /**
   * @description initiates the non-serviceable & non COD items processing
   * @param invoiceType containes retail | tax
   * @param deliveryAddress contains deliverable address
   * @param billingAddress contains billing address and optional for 'retail' case
   */
  verifyDeliveryAndBillingAddress(invoiceType, deliveryAddress) {
    if (deliveryAddress) {
      this._cartService.shippingAddress = deliveryAddress;
    }
    if (invoiceType) {
      this._cartService.invoiceType = invoiceType;
    }
    const POST_CODE = deliveryAddress && deliveryAddress["postCode"];
    if (!POST_CODE) return;
    //this.verifyServiceablityAndCashOnDelivery(POST_CODE);
  }
  handleInvoiceTypeEvent(invoiceType: string) {
    this.invoiceType = invoiceType;
  }

  openPromoCodeList() {
    this.showPromoOfferPopup = true;
    if (this._commonService.isBrowser && document.querySelector("app-pop-up")) {
      document.querySelector("app-pop-up").classList.add("open");
    }
  }

  closePromoListPopUp(flag) {
    (<HTMLElement>document.getElementById("body")).classList.remove(
      "stop-scroll"
    );
    document
      .getElementById("body")
      .removeEventListener("touchmove", this.preventDefault);
    this.showPromoOfferPopup = flag;
  }

  preventDefault(e) {
    e.preventDefault();
  }
  
  /**@description scrolls to payment summary section on click of info icon*/
  scrollPaymentSummary()
  {
      if (document.getElementById('summary_common_id_')) {
          let footerOffset = document.getElementById('summary_common_id_').offsetTop;
          ClientUtility.scrollToTop(1000, footerOffset-30);
          this.getAllCategoryByMsns();
      }
  }

  callHomePageWidgetsApis() {
    const fbt_prodcutsURL = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_FBT_PRODUCTS_BY_MSNS;
    const pastOrderURL = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_PAST_ORDERS + this.userData["userId"] || null;
    const wishlistUrl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
    const recentViewedUrl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RECENTLY_VIEWED + (this.userData && this.userData["userId"] || null);
    const fbtPostBody = this.getFbtPostBody(); 
    if(this._localAuthService.isUserLoggedIn()){
    const wishlistPayload = {
      idUser: this.userData["userId"],
      userType: "business",
    };
    const pastOrderApi = this._dataService.callRestful("GET", pastOrderURL);
    const recentViewedApi = this._dataService.callRestful('GET', recentViewedUrl);
    const wishlistApi = this._dataService
      .callRestful("GET", wishlistUrl, { params: wishlistPayload })
      .pipe(
        map((response: any) => {
          let index = 0;
          let res = response["data"];
          res = res.sort((a, b) => {
            return b.updated_on - a.updated_on;
          });
          return res.map((item) => {
            item["matCodeMode"] = false;
            if (item["matCodeFlag"] == undefined || item["matCodeFlag"] == null)
              item["matCodeFlag"] = false;
            item["index"] = index;
            index++;
            return item;
          });
        })
      );
    const fbtListApi = this._dataService
      .callRestful("POST", fbt_prodcutsURL, { body: fbtPostBody })
      .pipe(
        map((res) => {
          return res;
        })
      );
    forkJoin([pastOrderApi, wishlistApi, fbtListApi,recentViewedApi]).subscribe(
      (response) => {
        this.onVisiblePopularDeals(response);
      },
      (error) => {
        console.log("error", error);
        this.onVisiblePopularDeals([null, null, null,null]);
      }
    );
    }else{
      const recentViewedApi = this._dataService.callRestful('GET', recentViewedUrl);
      const fbtListApi = this._dataService
      .callRestful("POST", fbt_prodcutsURL, { body: fbtPostBody })
      .pipe(
        map((res)=>{
          return res;
        })
      );

      forkJoin([fbtListApi,recentViewedApi]).subscribe(
        (response) => {
          this.onVisiblePopularDeals([null, null,...response]);
        },
        (error) => {
          console.log("error", error);
          this.onVisiblePopularDeals([null, null, null,null]);
        }
      );
    }
  }

  async onVisiblePopularDeals([
    pastOrderResponse,
    wishlistResponse,
    fbtResponse,
    recentViewedResponse
  ]) {
    if (!this.homeMiscellaneousCarouselInstance && this.homeMiscellaneousCarouselContainerRef != undefined) {
      const { HomeMiscellaneousCarouselComponent } = await import(
        "./../../components/homeMiscellaneousCarousel/homeMiscellaneousCarousel.component"
      );
      const factory = this.cfr.resolveComponentFactory(
        HomeMiscellaneousCarouselComponent
      );
      this.homeMiscellaneousCarouselInstance =
        this.homeMiscellaneousCarouselContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.homeMiscellaneousCarouselInstance.instance["headertext"] =
        "You Maybe Interested In";
      this.homeMiscellaneousCarouselInstance.instance["isQuickOrder"] = true; 
      this.homeMiscellaneousCarouselInstance.instance["pastOrdersResponse"] =
        pastOrderResponse;
      this.homeMiscellaneousCarouselInstance.instance["recentResponse"] = 
        recentViewedResponse;  
      this.homeMiscellaneousCarouselInstance.instance["purcahseListResponse"] =
        wishlistResponse;
      this.homeMiscellaneousCarouselInstance.instance["fbtResponse"] =
        fbtResponse;
    }
  }

  private getFbtPostBody() {
    const itemsList = this._cartService.getGenericCartSession.itemsList;
    const postBody = {
      prodIdList: itemsList.map((res) => res.productId),
    };
    return postBody;
  }

  private postBodyForAllCategoryByMsns() {
    const itemsList = this._cartService.getGenericCartSession.itemsList;
    const postBody = {
      msnList: itemsList.map((res) => res.productId),
      count: itemsList.length,
      country: "india",
    };
    return postBody;
  }

  getAllCategoryByMsns() {
    const postBody = this.postBodyForAllCategoryByMsns();
    const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_INFO_BY_MSNS;
    this._dataService.callRestful("POST", url, { body: postBody }).subscribe(
      (res) => {
        if (res && res["products"] != null) {
          this.onVisiblePopularDeals2(res["products"] as any);
        } else {
          this.onVisiblePopularDeals2(null);
        }
      },
      (error) => {
        this.onVisiblePopularDeals2(null);
      }
    );
  }

  async onVisiblePopularDeals2(data) {
    if (!this.quickOrderMiscellaneousCarouselInstance && data != null) {
      const { QuickOrderMiscellaneousCarouselComponent } = await import(
        "./../../components/quick-order-miscellaneous-carousel/quick-order-miscellaneous-carousel.component"
      ).finally(() => {
        // console.log("component created .");
      });
      const factory = this.cfr.resolveComponentFactory(
        QuickOrderMiscellaneousCarouselComponent
      );
      this.quickOrderMiscellaneousCarouselInstance =
        this.quickOrderMiscellaneousCarouselContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.quickOrderMiscellaneousCarouselInstance.instance["data"] = data;
    }
  }

  async openWishlistPopup() {
    const userSession = this._localAuthService.getUserSession();
    if (userSession["authenticated"] != "true") {
      let navigationExtras: NavigationExtras = {
        queryParams: { backurl: "quickorder" },
      };
      this.router.navigate(["/login"], navigationExtras);
      return;
    }
    const { WishlistPopupComponent } = await import(
      "../../components/wishlist-popup/wishlist-popup.component"
    ).finally();
    const factory = this.cfr.resolveComponentFactory(WishlistPopupComponent);
    this.wishlistPopupInstance = this.wishlistPopupContainerRef.createComponent(
      factory,
      null,
      this.injector
    );
    (
      this.wishlistPopupInstance.instance["closePopup$"] as EventEmitter<any>
    ).subscribe((res) => {
      this.wishlistPopupContainerRef.remove();
      this.wishlistPopupInstance = null;
    });
  }

  async openSimillarProductsPopUp(event) {
    const msnid = event["productId"];
    const data = event["item"];
    const { SimillarProductsPopupComponent } = await import(
      "../../components/simillar-products-popup/simillar-products-popup.component"
    ).finally();
    const factory = this.cfr.resolveComponentFactory(
      SimillarProductsPopupComponent
    );
    this.simillarProductsPopupInstance =
      this.simillarProductsPopupContainerRef.createComponent(
        factory,
        null,
        this.injector
      );
    this.simillarProductsPopupInstance.instance["msnid"] = msnid;
    this.simillarProductsPopupInstance.instance["productName"] =
      data.productName;
    (
      this.simillarProductsPopupInstance.instance[
        "closePopup$"
      ] as EventEmitter<any>
    ).subscribe((res) => {
      this.simillarProductsPopupContainerRef.remove();
      this.simillarProductsPopupInstance = null;
    });
  }

  private getWishlistData() {
    const userSession = this._localAuthService.getUserSession();
    const wishlistPayload = {
      idUser: userSession["userId"],
      userType: "business",
    };
    const wishlistUrl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
    this._dataService
      .callRestful("GET", wishlistUrl, { params: wishlistPayload })
      .subscribe(
        (response) => {
          if (response && response["status"]) {
            const wishListResponseData = response["data"];
            this.wishListData = wishListResponseData.map((product) =>
              this._productService.wishlistToProductEntity(product)
            );
          }
        },
        (error) => {
          this.wishListData = [];
        }
      );
  }

  private removeItemFromPurchaseList(productObject) {
    if (productObject === null) return;
    let userSession = this._localAuthService.getUserSession();
    let obj = {
      idUser: userSession.userId,
      userType: "business",
      idProduct: productObject.moglixPartNumber || productObject.productId,
      productName: productObject.productName,
      description: productObject.description,
      brand: productObject.brandName,
      category: productObject.categoryCodes,
    };
    this._cartService.removePurchaseList(obj).subscribe(
      (res) => {
        if (res["status"]) {
          this._cartService.wishListSubject.next(res);
          this.refreshAllApis();
        }
      },
      (err) => {
        console.log("Error ==>",err);
        //this.showLoader = false;
      }
    );
  }
}
