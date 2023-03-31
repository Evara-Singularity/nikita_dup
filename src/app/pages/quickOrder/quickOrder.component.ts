import {
  Component,
  ViewEncapsulation,
  Input,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { LocalAuthService } from "@services/auth.service";
import { CartService } from "@services/cart.service";
import { CommonService } from "@services/common.service";
import { Subject, Subscription } from "rxjs";
import { delay } from "rxjs/operators";

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

  constructor(
    private _localAuthService: LocalAuthService,
    public _cartService: CartService,
    public _commonService: CommonService,
    private _loaderService: GlobalLoaderService,
    public router: Router
  ) {
    this._cartService.getGenericCartSession;
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._loaderService.setLoaderState(false);
    this.cartSubscription = this._cartService
      .getCartUpdatesChanges()
      .pipe(delay(800))
      .subscribe((cartSession) => {
        // console.log('cartSession ==>', cartSession)
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
  }

  navigateToCheckout() {
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
}
