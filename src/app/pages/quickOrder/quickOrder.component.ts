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
} from "@angular/core";
import { Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { QuickOrderAllAddressComponent } from "@app/modules/shared-checkout-address/all-address-core/quick-order-all-address/quick-order-all-address.component";
import { AddressListModel } from "@app/utils/models/shared-checkout.models";
import { AddressService } from "@app/utils/services/address.service";
import { DataService } from "@app/utils/services/data.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { LocalAuthService } from "@services/auth.service";
import { CartService } from "@services/cart.service";
import { CommonService } from "@services/common.service";
import { forkJoin, Subject, Subscription } from "rxjs";
import { delay, map } from "rxjs/operators";

@Component({
  selector: "quick-order",
  templateUrl: "./quickOrder.html",
  styleUrls: ["./quickOrder.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class QuickOrderComponent implements OnInit, AfterViewInit, OnDestroy {
  isCartNoItems: boolean = false;
  cartSubscription: Subscription;

  @Input("addDeliveryOrBilling") addDeliveryOrBilling: Subject<string> =
    new Subject();
  readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
  deliveryAddress = null;
  billingAddress = null;
  invoiceType = this.INVOICE_TYPES.RETAIL;
  cartSession = null;
  showPromoOfferPopup: boolean = false;
  userData: any;
  addressCount: number = 0;

  // ondemad loaded component for quickOrderAllAddress
  @ViewChild(QuickOrderAllAddressComponent)
  quickOrderAllAddressComponent: QuickOrderAllAddressComponent;
  // ondemad loaded component for homeMiscellaneousCarousel ( Buy it again, wishlist & FBT )
  homeMiscellaneousCarouselInstance = null;
  @ViewChild("homeMiscellaneousCarousel", { read: ViewContainerRef })
  homeMiscellaneousCarouselContainerRef: ViewContainerRef;
// ondemad loaded component for quickOrderMiscellaneousCarousel
  quickOrderMiscellaneousCarouselInstance = null;
  @ViewChild("quickOrderMiscellaneousCarousel", { read: ViewContainerRef })
  quickOrderMiscellaneousCarouselContainerRef: ViewContainerRef;

  constructor(
    public _localAuthService: LocalAuthService,
    public _cartService: CartService,
    public _commonService: CommonService,
    private _loaderService: GlobalLoaderService,
    public router: Router,
    private _dataService: DataService,
    private injector: Injector,
    private cfr: ComponentFactoryResolver,
    private _addressService: AddressService
  ) {
    this._cartService.getGenericCartSession;
  }

  ngOnInit(): void {
    this.userData = this._localAuthService.getUserSession();
    this.getAllddressList();
  }

  ngAfterViewInit(): void {
    this._loaderService.setLoaderState(false);
    this.cartSubscription = this._cartService
      .getCartUpdatesChanges()
      .pipe(delay(800))
      .subscribe((cartSession) => {
        if (
          cartSession &&
          cartSession.itemsList &&
          cartSession.itemsList.length === 0
        ) {
          this.isCartNoItems = true;
        } else {
          this.isCartNoItems = false;
        }
      });
  }

  ngOnDestroy() {
    if (this.cartSubscription) this.cartSubscription.unsubscribe();
    if (this.homeMiscellaneousCarouselInstance) {
      this.homeMiscellaneousCarouselInstance = null;
      this.homeMiscellaneousCarouselContainerRef.remove();
    }
    if(this.quickOrderMiscellaneousCarouselInstance){
      this.quickOrderMiscellaneousCarouselInstance = null;
      this.quickOrderMiscellaneousCarouselContainerRef.remove();
    }
  }

  navigateToCheckout() {
    if (this.addressCount == 0) {
      this.quickOrderAllAddressComponent.displayAddressFormPopup(
        "Delivery",
        null
      );
      return;
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
    this._commonService.updateUserSession();
  }

  /**@description triggers the unavailbel item pop-up from notfications */
  viewUnavailableItemsFromNotifacions(types: string[]) {
    if (types && types.length) this._cartService.viewUnavailableItems(types);
  }

  //Address Information
  handleDeliveryAddressEvent(address) {
    this.deliveryAddress = address;
    this._cartService.shippingAddress = address;
    this.verifyDeliveryAndBillingAddress(
      this.invoiceType,
      this.deliveryAddress
    );
    this._cartService.callShippingValueApi(this.cartSession);
  }

  handleBillingAddressEvent(address) {
    this.billingAddress = address;
    this._cartService.billingAddress = address;
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

  callHomePageWidgetsApis() {
    const wishlistPayload = {
      idUser: this.userData["userId"],
      userType: "business",
    };
    const fbt_prodcuts =
      CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_FBT_PRODUCTS_BY_MSNS;
    const pastOrderURL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_PAST_ORDERS}${this.userData["userId"]}`;
    const wishlistUrl = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
    const pastOrderApi = this._dataService.callRestful("GET", pastOrderURL);
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
    const fbtPostBody = this.getFbtPostBody();
    const fbtListApi = this._dataService
      .callRestful("POST", fbt_prodcuts, { body: fbtPostBody })
      .pipe(
        map((res) => {
          return res;
        })
      );
    forkJoin([pastOrderApi, wishlistApi, fbtListApi]).subscribe(
      (response) => {
        this.onVisiblePopularDeals(response);
      },
      (error) => {
        console.log("error", error);
        this.onVisiblePopularDeals([null, null, null]);
      }
    );
  }

  async onVisiblePopularDeals([
    pastOrderResponse,
    wishlistResponse,
    fbtResponse,
  ]) {
    if (!this.homeMiscellaneousCarouselInstance) {
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
        "You Maybe Intrested in";
      this.homeMiscellaneousCarouselInstance.instance["pastOrdersResponse"] =
        pastOrderResponse;
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

  private getAllddressList() {
    const params = { customerId: this.userData["userId"], invoiceType: "tax" };
    this._addressService.getAddressList(params).subscribe(
      (response: AddressListModel) => {
        this.addressCount = response.deliveryAddressList.length || 0;
      },
      (err) => {
        this.addressCount = 0;
      }
    );
  }

  private postBodyForAllCategoryByMsns(){
    const itemsList = this._cartService.getGenericCartSession.itemsList;
    const postBody = {
      "msnList": itemsList.map((res) => res.productId),
      "count": itemsList.length,
      "country": "india"
    };
    return postBody;
  }

  getAllCategoryByMsns() {
    const postBody = this.postBodyForAllCategoryByMsns();
    const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CATEGORY_INFO_BY_MSNS
    this._dataService.callRestful("POST", url, { body: postBody }).subscribe(res=>{
      if(res && res['products'] != null){
        this.onVisiblePopularDeals2(res['products'] as any)
      }else{
        this.onVisiblePopularDeals2(null)
      }
    },error=>{
      this.onVisiblePopularDeals2(null);
    });
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
      )
      this.quickOrderMiscellaneousCarouselInstance =
        this.quickOrderMiscellaneousCarouselContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.quickOrderMiscellaneousCarouselInstance.instance["data"] =
      data;
    }
  }
  
}
