import {
  Component,
  EventEmitter,
  OnInit,
  NgModule,
  Output,
  Input,
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
import { forkJoin, Observable, of, Subscription, throwError } from "rxjs";
import { CheckoutService } from "@app/utils/services/checkout.service";
import { MathCeilPipeModule } from "@pipes/math-ceil";
import { MathFloorPipeModule } from "@pipes/math-floor";
import CONSTANTS from "@app/config/constants";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { DataService } from "@app/utils/services/data.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { Router } from "@angular/router";
import { QuickCodService } from "@app/utils/services/quick-cod.service";
import { InitiateQuickCod } from "@app/utils/models/cart.initial";

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
    private _dataService: DataService,
    private _analytics: GlobalAnalyticsService,
    private _router: Router
  ) {}

  close(isClose: boolean) {
    if (isClose) {
      this.removeCartItem();
    } else {
      this.isClose.emit(true);
      this.commonService.oosSimilarCard$.next(false);
    }
    this.isPopup = false;
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
      this.productQuantity == 1
        ? this.cartService.removeCartItemsByMsns(this.item["productId"])
        : this.handleItemQuantityChanges(itemIndex, "decrement");
      this.isPopup = false;
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

  removeItemFromCart(itemIndex, packageUnit) {
    this.removableItem = JSON.parse(
      JSON.stringify(
        this.cartService.getGenericCartSession?.itemsList[itemIndex]
      )
    );
    this.removableItem["packageUnit"] = packageUnit;
    this.close(true);
  }

  resetRemoveItemCart() {
    this.removableItem = null;
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
        this.sendMessageOnQuantityChanges(
          this.cartService.getGenericCartSession,
          updateQtyTo,
          itemIndex,
          "increment_quantity"
        );
        break;
      }
      case "decrement": {
        updateQtyTo = currentQty - incrementUnit;
        this.sendMessageOnQuantityChanges(
          this.cartService.getGenericCartSession,
          updateQtyTo,
          itemIndex,
          "decrement_quantity"
        );
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
        this.sendMessageOnQuantityChanges(
          this.cartService.getGenericCartSession,
          updateQtyTo,
          itemIndex,
          "quantity_updated"
        );
        break;
      }
    }

    if (removeIndex > -1) {
      this.globalLoader.setLoaderState(false);
      this.removeItemFromCart(itemIndex, product["packageUnit"]);
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
          // this.sendMessageAfterCartAction(cartSession);
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

  sendMessageOnQuantityChanges(cartSession, quantityTarget, index, label) {
    var taxonomy = cartSession["itemsList"][index]["taxonomyCode"];
    var trackingData = {
      event_type: "click",
      label: "quantity_updated", //quantity_updated, increment_quantity, decrement_quantity
      product_name: cartSession["itemsList"][index]["productName"],
      msn: cartSession["itemsList"][index]["productId"],
      brand: cartSession["itemsList"][index]["brandName"],
      price: cartSession["itemsList"][index]["totalPayableAmount"],
      quantity: parseInt(quantityTarget),
      channel: "Cart",
      category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
      category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
      category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
      page_type: "Cart",
    };
    // this._globalAnalyticsService.sendToClicstreamViaSocket(trackingData);
  }

  placeOrder() {
    this.quickCodService
      .checkCODLimit(this.totalPayableAmount)
      .subscribe((res) => {
        if (res && res["iswithInCODLimit"] == true) {
          this.validateCart();
        } else {
          this._tms.show({
            type: "error",
            text: res.message,
          });
          this.close(false);
        }
      });
  }

  validateCart() {
    // console.log("this.cartService.billingAddress--" , this.cartService.billingAddress);
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
