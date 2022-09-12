import {
  Component,
  EventEmitter,
  OnInit,
  NgModule,
  Output,
  Input,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { BottomMenuModule } from "@app/modules/bottomMenu/bottom-menu.module";
import { PromoCodeModule } from "@app/modules/shared-checkout-quick-order-components/promoCode/promoCode.module";
import { CommonService } from "@app/utils/services/common.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductService } from "@app/utils/services/product.service";
import { CartService } from "@app/utils/services/cart.service";
import {
  catchError,
  map,
  switchMap,
} from "rxjs/operators";
import { forkJoin, Observable, of, Subscription } from "rxjs";
import { CheckoutService } from "@app/utils/services/checkout.service";
import { MathCeilPipeModule } from "@pipes/math-ceil";
import { MathFloorPipeModule } from "@pipes/math-floor";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { QuickCodService } from "@app/utils/services/quick-cod.service";
import { InitiateQuickCod } from "@app/utils/models/cart.initial";
import { BottomMenuComponent } from "@app/modules/bottomMenu/bottom-menu.component";

@Component({
  selector: "pdp-quick-checkout",
  templateUrl: "./pdp-quick-checkout.component.html",
  styleUrls: ["./pdp-quick-checkout.component.scss"],
})
export class PdpQuickCheckoutComponent implements OnInit {

  //inputs
  @Input("rawProductData") rawProductData;
  @Input("productPrice") productPrice;
  @Input("selectedProductBulkPrice") selectedProductBulkPrice;
  @Input("cartQunatityForProduct") cartQunatityForProduct;
  @Input("address") address;
  @ViewChild(BottomMenuComponent) _bottomMenuComponent: BottomMenuComponent;
  //outputs
  @Output() isClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  isPopup = true;
  currUser = null;
  billingAddress = null;
  shippingAddress = null;
  showPromoOfferPopup = false;
  isPaymentSummary = true;
  Isoverlay = true;
  purchasingForBusiness = false;
  cartSubscription: Subscription = null;
  promoSubscription: Subscription = null;
  showPromoSuccessPopup: boolean = false;

  transactionId: string;
  shippmentCharge: number = 0;
  totalPayableAmount: number = 0;
  totalOffer: number = 0;
  productQuantity: number = 0;
  currProductQuantity: number = 0;
  productImg: string = "";
  shippingCharges: number = 0;
  item = null;
  removableItem = null;

  constructor(
    public commonService: CommonService,
    public localAuthService: LocalAuthService,
    public globalLoader: GlobalLoaderService,
    public localStorageService: LocalStorageService,
    public productService: ProductService,
    public cartService: CartService,
    private quickCodService: QuickCodService,
    public checkoutService: CheckoutService,
    private _tms: ToastMessageService,
  ) {}

  close(isClose: boolean) {
    if (isClose) {
      this.removeCartItem();
    } else {
      this.cartService.billingAddress = this.billingAddress as any;
      this.cartService.shippingAddress = this.shippingAddress as any;
      this.cartService.invoiceType = (this.purchasingForBusiness ? "tax": "retail");
      this.isClose.emit(true);
      this.commonService.oosSimilarCard$.next(false);
    }
    this.isPopup = false;
    this._bottomMenuComponent.updateParent({ popupClose: true });
  }

  removeCartItem() {
    this.cartService.buyNow = false;
    this.removeCartFromCartSession();
  }

  removeCartFromCartSession() {
    this.cartService.buyNow = false;
    const user = this.localStorageService.retrieve("user");
    const params = { sessionid: user["sessionId"] };
    this.cartService.getCartBySession(params).subscribe((cartSession) => {
      this.cartService.setGenericCartSession(
        this.cartService.generateGenericCartSession(cartSession)
      );
      const itemsList = this.cartService.getGenericCartSession.itemsList;
      let itemIndex = 0;
      itemsList.forEach((ele, index) => {
        if (ele["productId"] == this.item["productId"]) {
          itemIndex = index;
        }
      });
      this.currProductQuantity == 1
        ? this.cartService.removeCartItemsByMsns(this.item["productId"])
        : this.handleItemQuantityChanges(itemIndex, "decrement");
    });
  }

  onUpdate(data) {
    if (data.popupClose) {
      this.removeCartItem();
      this.Isoverlay = false;
    }
  }

  expandPaymentSummary(val: boolean) {
    this.isPaymentSummary = val;
  }

  getGstInvoice(event: boolean) {
    if (!event) {
      this.billingAddress = null;
      this.cartService.billingAddress = null;
      this.cartService.shippingAddress["isGstInvoice"] = false;
    } else {
      this.setAddress(this.address, false);
    }
  }

  ngOnInit() {
    this.setAddress(this.address, true);
    this.shippmentCharge = this.cartService.shippingCharges;
    this.currUser = this.localAuthService.getUserSession();
    this.cartService.getPromoCodesByUserId(this.currUser["userId"]);
    this.cartService.appliedPromoCode = "";
    this.returnProductDetails().subscribe((result) => {
      this.addTocart(result, true);
      this.item = result;
    });

    this.promoSubscription = this.cartService.promoCodeSubject.subscribe(
      ({ promocode, isNewPromocode }) => {
        this.showPromoSuccessPopup = isNewPromocode;
        this.getUpdatedCart();
        setTimeout(() => {
          this.showPromoSuccessPopup = false;
        }, 800);
      }
    );
  }

  addTocart(productDetails, buyNow) {
    this.cartService.buyNow = buyNow;
    this.cartService
      .addToCart({ buyNow, productDetails: productDetails })
      .subscribe((res) => {
        this.currProductQuantity = this.cartService.getGenericCartSession['itemsList'][0]['productQuantity'];
        this.getUpdatedCart();
      });
  }

  getUpdatedCart() {
    this.cartSubscription = this.cartService
      .getCartUpdatesChanges()
      .subscribe((cartSession) => {
        if (cartSession && cartSession.itemsList) {
          this.item = cartSession.itemsList[0];
          this.productQuantity =
            cartSession.itemsList[0]["productQuantity"] || 0;
          this.productImg = cartSession.itemsList[0]["productImg"];
          this.shippingCharges =
            cartSession.itemsList[0]["shippingCharges"] || 0;
          this.totalOffer = cartSession["cart"]["totalOffer"] || 0;
          this.totalPayableAmount = this.cartService.getTotalPayableAmount(
            cartSession["cart"]
          );
        }
      });
  }

  returnProductDetails(): Observable<any> {
    return of(
      this.cartService.getAddToCartProductItemRequest({
        productGroupData: this.rawProductData,
        buyNow: true,
        selectPriceMap: this.selectedProductBulkPrice,
        quantity: this.cartQunatityForProduct,
      })
    );
  }

  setAddress(obj, isPurchaseForBussiness) {
    const isValid = obj && obj.bothAddress && obj.bothAddress.addressDetails;
    if (isValid) {
      const address = obj.bothAddress.addressDetails;
      const addressType = obj.addressType;
      // for shippingAddress
      if (address["shippingAddress"] && address["shippingAddress"].length) {
        let len =
          address["shippingAddress"].length > 1
            ? address["shippingAddress"].length - 1
            : 0;
        this.cartService.shippingAddress = address["shippingAddress"][len];
        this.shippingAddress = address["shippingAddress"][len];
      } else {
        this.cartService.shippingAddress = null;
      }
      // for billingAddress
      if (
        addressType != "shipping" &&
        address["billingAddress"] &&
        address["billingAddress"].length
      ) {
        let len =
          address["billingAddress"].length > 1
            ? address["billingAddress"].length - 1
            : 0;
        this.cartService.billingAddress = address["billingAddress"][len];
        this.billingAddress = address["billingAddress"][len];
      } else {
        this.cartService.billingAddress = null;
      }
      if (isPurchaseForBussiness) {
        addressType == "billing"
          ? (this.purchasingForBusiness = this.billingAddress.isGstInvoice)
          : (this.purchasingForBusiness = this.shippingAddress.isGstInvoice);
      }
    }
  }

  //new implmentation
  handleItemQuantityChanges(itemIndex: number, action: string, typedValue?) {
    const item = this.cartService.getGenericCartSession.itemsList[itemIndex];
    const currentQty = item.productQuantity;
    if (typedValue && parseInt(typedValue) === currentQty) {
      return;
    }
    this.getProductDetails(
      action,
      itemIndex,
      item["productId"],
      typedValue || null
    );
  }

  removeItemFromCart() {
    this.cartService.removeCartItemsByMsns(this.item['productId'])
    this.isPopup = false;
    this._bottomMenuComponent.updateParent({ popupClose: true });
  }

  getProductDetails(action, itemIndex, msn, typedValue) {
    this.globalLoader.setLoaderState(true);
    const buyNow = this.cartService.buyNow;
    this.productService
      .getProductGroupDetails(msn)
      .pipe(
        map((response) => {
          if (!response["productBO"]) return null;
          let productData = this.cartService.getAddToCartProductItemRequest({
            productGroupData: response["productBO"],
            buyNow,
          });
          return productData;
        }),
        catchError((error) => {
          return null;
        })
      )
      .subscribe((product) => {
        if (!product) {
          this.globalLoader.setLoaderState(false);
          const msg = "Product does not exist";
          this._tms.show({ type: "error", text: msg });
          return;
        }
        this.validateProductWithQty(
          msn,
          action,
          product,
          itemIndex,
          typedValue
        );
      });
  }

  validateProductWithQty(msn, action, product, itemIndex, typedValue) {
    const minQty = product["moq"] || 1;
    const maxQty = product["quantityAvailable"];
    const incrementUnit = product["incrementUnit"] || 1;
    const item = this.cartService.getGenericCartSession.itemsList[itemIndex];
    const currentQty = item.productQuantity;
    let updateQtyTo = null;
    let errorMsg = null;
    let removeIndex = -1;
    switch (action) {
      case "increment": {
        updateQtyTo = currentQty + incrementUnit;
        if (updateQtyTo > maxQty) {
          updateQtyTo = maxQty;
          errorMsg = `Maximum qty can be ordered is: ${maxQty}`;
        }
        break;
      }
      case "decrement": {
        updateQtyTo = currentQty - incrementUnit;
        if (updateQtyTo < minQty) {
          removeIndex = itemIndex;
        }
        break;
      }
      case "update": {
        updateQtyTo = Number(typedValue ? typedValue : null);
        if (updateQtyTo > maxQty) {
          updateQtyTo = maxQty;
          errorMsg = `Maximum qty can be ordered is: ${maxQty}`;
        }
        if (updateQtyTo < minQty) {
          updateQtyTo = minQty;
          errorMsg = `Minimum qty can be ordered is: ${minQty}`;
        }
        break;
      }
    }

    if (removeIndex > -1) {
      this.globalLoader.setLoaderState(false);
      this.removeItemFromCart();
      return;
    }

    let bulkPriceMap = [];
    const newCartSession = JSON.parse(
      JSON.stringify(this.cartService.getGenericCartSession)
    );
    newCartSession["itemsList"][itemIndex]["productQuantity"] = updateQtyTo;
    const productToUpdate = newCartSession["itemsList"][itemIndex];
    if (
      productToUpdate["bulkPriceMap"] &&
      productToUpdate["bulkPriceMap"]["india"] &&
      (productToUpdate["bulkPriceMap"]["india"] as any[]).length
    ) {
      bulkPriceMap = (productToUpdate["bulkPriceMap"]["india"] as any[]).filter(
        (bulk) => {
          return (
            bulk["active"] &&
            updateQtyTo >= bulk["minQty"] &&
            updateQtyTo <= bulk["maxQty"]
          );
        }
      );
      if (bulkPriceMap.length) {
        newCartSession["itemsList"][itemIndex]["bulkPrice"] =
          bulkPriceMap[0]["bulkSellingPrice"];
        newCartSession["itemsList"][itemIndex]["bulkPriceWithoutTax"] =
          bulkPriceMap[0]["bulkSPWithoutTax"];
      } else {
        newCartSession["itemsList"][itemIndex]["bulkPrice"] = null;
        newCartSession["itemsList"][itemIndex]["bulkPriceWithoutTax"] = null;
      }
    }
    this.updateCart(msn, newCartSession, errorMsg);
  }

  updateCart(msn, newCartSession, errorMsg) {
    let totalOffer = null;
    const updateCart$ = this.cartService.updateCartSession(newCartSession).pipe(
      switchMap((newCartSession) => {
        return this.cartService.verifyAndApplyPromocode(
          newCartSession,
          this.cartService.appliedPromoCode,
          true
        );
      }),
      switchMap((response) => {
        totalOffer = response.cartSession["cart"]["totalOffer"] || null;
        return this.cartService.verifyShippingCharges(response.cartSession);
      })
    );
    const setValidationMessages$ = this.cartService.removeNotificationsByMsns(
      [msn],
      true
    );
    forkJoin([updateCart$, setValidationMessages$]).subscribe(
      (responses) => {
        this.globalLoader.setLoaderState(false);
        let cartSession = responses[0];
        if (responses[0]) {
          const cartSession = this.cartService.generateGenericCartSession(
            responses[0]
          );
          cartSession["cart"]["totalOffer"] = totalOffer;
          cartSession["extraOffer"] = null;
          this.cartService.setGenericCartSession(cartSession);
          this.cartService.publishCartUpdateChange(cartSession);
          this.cartService.orderSummary.next(cartSession);
          this._tms.show({
            type: "success",
            text: errorMsg || "Cart quantity updated successfully",
          });
          return;
        }
        this._tms.show({
          type: "error",
          text: cartSession["message"] || "Cart quanity is not updated.",
        });
      },
      (error) => {
        this.globalLoader.setLoaderState(false);
      }
    );
  }

  placeOrder() {
    this.quickCodService
      .checkCODLimit(this.totalPayableAmount)
      .subscribe((res) => {
        if (res && res["iswithInCODLimit"] == true) {
          this.validateCart();
        } else {
          this.cartService.quickCheckoutCodMaxErrorMessage = res.message;
          this.close(false);
        }
      });
  }

  validateCart() {
    this.globalLoader.setLoaderState(true);
    const _cartSession = this.cartService.getCartSession();
    const _shippingAddress = this.cartService.shippingAddress ?? null;
    const _billingAddress = this.cartService.billingAddress ?? null;
    const _invoiceType = this.cartService.invoiceType;
    const _postCode = this.cartService.shippingAddress["zipCode"];
    const _userId = this.currUser["userId"];

    const validateDtoRequest: InitiateQuickCod = {
      cartSession: _cartSession,
      shippingAddress: _shippingAddress,
      billingAddress: _billingAddress,
      invoiceType: _invoiceType,
      isBuyNow: true,
      postCode: _postCode,
      userId: _userId,
    };
    this.quickCodService.initiateQuickCOD(validateDtoRequest);
  }

  openOfferPopUp() {
    this.showPromoOfferPopup = true;
  }

  closePromoSuccessPopUp() {
    this.showPromoSuccessPopup = false;
  }

  closePromoListPopUp(flag) {
    this.showPromoOfferPopup = flag;
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) this.cartSubscription.unsubscribe();
    if (this.promoSubscription) this.promoSubscription.unsubscribe();
  }
}

@NgModule({
  declarations: [PdpQuickCheckoutComponent],
  imports: [
    CommonModule,
    BottomMenuModule,
    PromoCodeModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
  ],
  exports: [PdpQuickCheckoutComponent],
})
export class PdpQuickCheckoutModule {}
