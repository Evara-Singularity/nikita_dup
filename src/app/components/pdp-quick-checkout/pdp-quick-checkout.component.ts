import {
  Component,
  EventEmitter,
  OnInit,
  AfterViewChecked,
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
import { catchError, delay, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';
import { forkJoin, Observable, of, Subscription, throwError } from "rxjs";
import { CheckoutService } from "@app/utils/services/checkout.service";
import { MathCeilPipeModule } from '@pipes/math-ceil';
import { MathFloorPipeModule } from '@pipes/math-floor';
import CONSTANTS from "@app/config/constants";
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { DataService } from "@app/utils/services/data.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { Router, NavigationExtras } from '@angular/router';
import { CartModule } from "@app/modules/shared-checkout-quick-order-components/cart/cart.module";

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
  shippingAddress = null
  showPromoOfferPopup = false;
  cartSubscription: Subscription = null;
  promoSubscription: Subscription = null;
  showPromoSuccessPopup:boolean = false;
  
  transactionId: string;
  shippmentCharge: number = 0;
  totalPayableAmount:number = 0;
  totalOffer:number = 0;
  productQuantity:number = 0;
  productImg:string = '';
  tax:number = 0;
  shippingCharges:number = 0;
  item = null;
  removableItem = null;



  constructor(
    public commonService: CommonService,
    public localAuthService: LocalAuthService,
    public globalLoader: GlobalLoaderService,
    public localStorageService: LocalStorageService,
    public productService: ProductService,
    public cartService: CartService,
    public checkoutService: CheckoutService,
    private _tms: ToastMessageService,
    private _dataService: DataService,
    private _analytics: GlobalAnalyticsService,
    private _router: Router
  ) {}

  close() {
    this.isPopup = false;
    this.isClose.emit(true);
    this.commonService.oosSimilarCard$.next(false);
  }

  ngOnInit() {
    this.setAddress(this.address);
    this.shippmentCharge = this.cartService.shippingCharges;
    this.currUser = this.localAuthService.getUserSession();
    this.cartService.appliedPromoCode = "";
    this.returnProductDetails().subscribe((result) => {
      this.addTocart(result, true);
      this.item = result;
    });

    this.promoSubscription = this.cartService.promoCodeSubject.subscribe(({ promocode, isNewPromocode }) =>
    {
        this.showPromoSuccessPopup = isNewPromocode;
        this.getUpdatedCart();
        setTimeout(() => { this.showPromoSuccessPopup = false; },  800)
    })

  }
  
  addTocart(productDetails, buyNow){
    this.cartService.buyNow = buyNow;
      this.cartService.addToCart({buyNow, productDetails: productDetails}).subscribe(res=>{
      this.getUpdatedCart();
    });
  }


  getUpdatedCart(){
    this.cartSubscription = this.cartService.getCartUpdatesChanges().subscribe(cartSession =>
    {
        if (cartSession && cartSession.itemsList) {
          this.item = cartSession.itemsList[0];
          this.productQuantity = cartSession.itemsList[0]['productQuantity'] || 0;
          this.productImg =  cartSession.itemsList[0]['productImg'];
          this.tax = cartSession.itemsList[0]['tax'] || 0;
          this.shippingCharges = cartSession.itemsList[0]['shippingCharges'] || 0;
          this.totalOffer = cartSession['cart']['totalOffer'] || 0;
          this.totalPayableAmount = this.cartService.getTotalPayableAmount(cartSession['cart']);
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

  setAddress(obj){
   const isValid = obj && obj.bothAddress && obj.bothAddress.addressDetails;
   if(isValid){
    const address = obj.bothAddress.addressDetails;
    // for shippingAddress
    if(address['shippingAddress'] && address['shippingAddress'].length){
      let len = (address['shippingAddress'].length > 1 ? address['shippingAddress'].length : 0)
      this.cartService.shippingAddress = address['shippingAddress'][len];
      this.shippingAddress = address['shippingAddress'][len];
    }else{
      this.cartService.shippingAddress = null;
    }
    // for shippingAddress
    if(address['billingAddress'] && address['billingAddress'].length){
      let len = (address['billingAddress'].length > 1 ? address['billingAddress'].length : 0)
      this.cartService.billingAddress = address['billingAddress'][len];
      this.billingAddress = address['billingAddress'][len];
    }else{
      this.cartService.billingAddress = null;
    }
   }
  }

   //new implmentation
   handleItemQuantityChanges(itemIndex: number, action: string, typedValue?)
   {
       const item = this.cartService.getGenericCartSession.itemsList[itemIndex];
       const currentQty = item.productQuantity;
       if (typedValue && parseInt(typedValue) === currentQty) { return; }
       this.getProductDetails(action, itemIndex, item['productId'], typedValue || null);
   }

   removeItemFromCart(itemIndex, packageUnit) { 
    this.removableItem = JSON.parse(JSON.stringify(this.cartService.getGenericCartSession?.itemsList[itemIndex])); 
    this.removableItem['packageUnit'] = packageUnit;  
    this.close();
   }

  resetRemoveItemCart() { this.removableItem = null; }
 
   getProductDetails(action, itemIndex, msn, typedValue)
   {
       this.globalLoader.setLoaderState(true);
       const buyNow = this.cartService.buyNow;
       this.productService.getProductGroupDetails(msn).pipe(
           map((response) =>
           {
               if (!response['productBO']) return null;
               let productData = this.cartService.getAddToCartProductItemRequest({ productGroupData: response['productBO'], buyNow });
               return productData;
           }),
           catchError((error) => { return null })
       ).subscribe((product) =>
       {
           if (!product) {
               this.globalLoader.setLoaderState(false);
               const msg = "Product does not exist";
               this._tms.show({ type: 'error', text: msg });
               return;
           }
           this.validateProductWithQty(msn, action, product, itemIndex, typedValue)
       });
   }

   validateProductWithQty(msn, action, product, itemIndex, typedValue)
   {
       const minQty = product['moq'] || 1;
       const maxQty = product['quantityAvailable'];
       const incrementUnit = product['incrementUnit'] || 1;
       const item = this.cartService.getGenericCartSession.itemsList[itemIndex];
       const currentQty = item.productQuantity;
       let updateQtyTo = null;
       let errorMsg = null;
       let removeIndex = -1;
       switch (action) {
           case 'increment': {
               updateQtyTo = currentQty + incrementUnit;
               if (updateQtyTo > maxQty) {
                   updateQtyTo = maxQty;
                   errorMsg = `Maximum qty can be ordered is: ${maxQty}`;
               }
               this.sendMessageOnQuantityChanges(this.cartService.getGenericCartSession, updateQtyTo, itemIndex, "increment_quantity");
               break;
           }
           case 'decrement': {
               updateQtyTo = currentQty - incrementUnit;
               this.sendMessageOnQuantityChanges(this.cartService.getGenericCartSession, updateQtyTo, itemIndex, "decrement_quantity");
               if (updateQtyTo < minQty) {
                   removeIndex = itemIndex;
               }
               break;
           }
           case 'update': {
               updateQtyTo = Number(typedValue ? typedValue : null);
               if (updateQtyTo > maxQty) {
                   updateQtyTo = maxQty;
                   errorMsg = `Maximum qty can be ordered is: ${maxQty}`;
               }
               if (updateQtyTo < minQty) {
                   updateQtyTo = minQty;
                   errorMsg = `Minimum qty can be ordered is: ${minQty}`;
               }
               this.sendMessageOnQuantityChanges(this.cartService.getGenericCartSession, updateQtyTo, itemIndex, "quantity_updated");
               break;
           }
       }
       if (removeIndex > -1) {
           this.globalLoader.setLoaderState(false);
           this.removeItemFromCart(itemIndex, product['packageUnit']);
           return
       }
       let bulkPriceMap = [];
       const newCartSession = JSON.parse(JSON.stringify(this.cartService.getGenericCartSession));
       newCartSession['itemsList'][itemIndex]['productQuantity'] = updateQtyTo;
       const productToUpdate = newCartSession['itemsList'][itemIndex];
       if (productToUpdate['bulkPriceMap'] && productToUpdate['bulkPriceMap']['india'] && (productToUpdate['bulkPriceMap']['india'] as any[]).length) {
           bulkPriceMap = (productToUpdate['bulkPriceMap']['india'] as any[]).filter((bulk) =>
           {
               return bulk['active'] && updateQtyTo >= bulk['minQty'] && updateQtyTo <= bulk['maxQty']
           });
           if (bulkPriceMap.length) {
               newCartSession['itemsList'][itemIndex]['bulkPrice'] = bulkPriceMap[0]['bulkSellingPrice'];
               newCartSession['itemsList'][itemIndex]['bulkPriceWithoutTax'] = bulkPriceMap[0]['bulkSPWithoutTax'];
           } else {
               newCartSession['itemsList'][itemIndex]['bulkPrice'] = null;
               newCartSession['itemsList'][itemIndex]['bulkPriceWithoutTax'] = null;
           }
       }
       this.updateCart(msn, newCartSession, errorMsg);
   }

   updateCart(msn, newCartSession, errorMsg)
   {
       let totalOffer = null;
       const updateCart$ = this.cartService.updateCartSession(newCartSession).pipe(
           switchMap((newCartSession) =>
           {
               return this.cartService.verifyAndApplyPromocode(newCartSession, this.cartService.appliedPromoCode, true)
           }),
           switchMap((response) =>
           {
               totalOffer = response.cartSession['cart']['totalOffer'] || null;
               return this.cartService.verifyShippingCharges(response.cartSession);
           }));
       const setValidationMessages$ = this.cartService.removeNotificationsByMsns([msn], true);
       forkJoin([updateCart$, setValidationMessages$]).subscribe((responses) =>
       {
           this.globalLoader.setLoaderState(false);
           let cartSession = responses[0];
           if (responses[0]) {
               const cartSession = this.cartService.generateGenericCartSession(responses[0]);
               cartSession['cart']['totalOffer'] = totalOffer;
               cartSession['extraOffer'] = null;
               this.cartService.setGenericCartSession(cartSession);
               this.cartService.publishCartUpdateChange(cartSession);
               this.cartService.orderSummary.next(cartSession);
               this._tms.show({ type: 'success', text: errorMsg || "Cart quantity updated successfully" });
              // this.sendMessageAfterCartAction(cartSession);
               return;
           }
           this._tms.show({ type: 'error', text: cartSession["message"] || "Cart quanity is not updated." });
       }, (error) => { this.globalLoader.setLoaderState(false); })
   }

   sendMessageOnQuantityChanges(cartSession, quantityTarget, index, label)
   {
       var taxonomy = cartSession["itemsList"][index]['taxonomyCode'];
       var trackingData = {
           event_type: "click",
           label: "quantity_updated",//quantity_updated, increment_quantity, decrement_quantity
           product_name: cartSession["itemsList"][index]['productName'],
           msn: cartSession["itemsList"][index]['productId'],
           brand: cartSession["itemsList"][index]['brandName'],
           price: cartSession["itemsList"][index]['totalPayableAmount'],
           quantity: parseInt(quantityTarget),
           channel: "Cart",
           category_l1: taxonomy.split("/")[0] ? taxonomy.split("/")[0] : null,
           category_l2: taxonomy.split("/")[1] ? taxonomy.split("/")[1] : null,
           category_l3: taxonomy.split("/")[2] ? taxonomy.split("/")[2] : null,
           page_type: "Cart"
       }
      // this._globalAnalyticsService.sendToClicstreamViaSocket(trackingData);
   }

  placeOrder() {
    const minValue = CONSTANTS.GLOBAL.codMin
    const maxValue = CONSTANTS.GLOBAL.codMax
    if (this.totalPayableAmount < minValue) {
      this._tms.show({ type: 'error', text: `COD not applicable on orders below Rs.${minValue}` });
    }
    else if (this.totalPayableAmount > maxValue) {
      this._tms.show({ type: 'error', text: `COD not applicable on orders above Rs.${maxValue}`});
    } else{
      this.validateCart();
    }
  }

  validateCart() {
    this.globalLoader.setLoaderState(true);
    const _cartSession = this.cartService.getCartSession();
    const _shippingAddress = this.cartService.shippingAddress ?? null;
    //console.log("validate--",this.cartService.shippingAddress);
    const _billingAddress = this.cartService.billingAddress ?? null;
    let cart = _cartSession.cart;
    let obj = {
        "shoppingCartDto": {
            "cart":
            {
                "cartId": cart["cartId"],
                "sessionId": cart["sessionId"],
                "userId": cart["userId"],
                "agentId": cart["agentId"] ? cart["agentId"] : null,
                "isPersistant": true,
                "createdAt": null,
                "updatedAt": null,
                "closedAt": null,
                "orderId": null,
                "totalAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                "totalOffer": cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                "totalAmountWithOffer": cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                "taxes": cart["taxes"] == null ? 0 : cart["taxes"],
                "totalAmountWithTaxes": cart["totalAmountWithTax"],
                "shippingCharges": cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                "currency": cart["currency"] == null ? "INR" : cart["currency"],
                "isGift": cart["gift"] == null ? false : cart["gift"],
                "giftMessage": cart["giftMessage"],
                "giftPackingCharges": cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                "totalPayableAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"]
            },
            "itemsList": this.cartService.getItemsList(_cartSession.itemsList),
            "addressList": [
                {
                    "addressId": _shippingAddress['addressId'], 
                    "type": "shipping",
                    "invoiceType": this.cartService.invoiceType
                }
            ],
            "payment": null,
            "deliveryMethod": { "deliveryMethodId": 77, "type": "kjhlh" },
            "offersList": (_cartSession.offersList != undefined && _cartSession.offersList.length > 0) ? _cartSession.offersList : null
        }
    };
    if (this.cartService.buyNow) { obj['shoppingCartDto']['cart']['buyNow'] = true; }
    if (_billingAddress != null) {
        obj.shoppingCartDto.addressList.push({
            "addressId": _billingAddress["addressId"],
            "type": "billing",
            "invoiceType": this.cartService.invoiceType

        })
    }
    this.cartService.validateCartBeforePayment(obj).subscribe((res) => {
      this.globalLoader.setLoaderState(false);
      console.log("validateCartBeforePayment validate api---------> ,",res)
      if (res.status && res.statusCode == 200) {
        if (res.codAvailable == true) {
          //paymentId api called here
          this.confirmOrder();
        } else {
          this._tms.show({ type: "error", text: "invalid product for quick checkout " });
          this.close();
        }
      } else {
        this._tms.show({ type: "error", text: "invalid product for quick checkout " });
        this.close();
      }
    });
  }

  // order-confirmation ,, flow ,, functions generate paymentId ////

  confirmOrder() {
    // this.isShowLoader = true;
    this.globalLoader.setLoaderState(true);
    this.getPaymentId({ userId: this.currUser["userId"] }).subscribe((res) => {
      if (res && res["status"]) {
        this.transactionId = res["data"]["transactionId"];
        this.pay();
      } else {
        this.globalLoader.setLoaderState(false);
        this._tms.show({
          type: "error",
          text: "Something went wrong, Please try again.",
        });
      }
    });
  }

  getPaymentId(data) {
    return this._dataService
      .callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/payment/getPaymentId", {
        params: data,
      })
      .pipe(
        catchError((e) =>
          of({
            status: false,
            data: { transactionId: null },
            description: null,
          })
        )
      );
  }

  pay() {
    //this.isShowLoader = true;
    
    let invoiceType = this.cartService.invoiceType;
    let cartSession = this.cartService.getCartSession();
    let addressList = this.cartService.shippingAddress;
    let newdata = {};

    let shippingInformation = {
      shippingCost: cartSession["cart"]["shippingCharges"],
      couponUsed: cartSession["cart"]["totalOffer"] || 0,
      GST: addressList["isGstInvoice"] != null ? "Yes" : "No",
    };

    this._analytics.sendGTMCall({
      event: "checkoutStarted",
      shipping_Information: shippingInformation,
      city: addressList["city"],
      paymentMode: "COD",
    });

    let extra = {
      mode: "COD",
      paymentId: 13,
      addressList: addressList,
    };
    if (invoiceType === "retail") {
      newdata = {
        transactionId: this.transactionId,
        platformCode: "online",
        mode: extra.mode,
        paymentId: extra.paymentId,
        requestParams: null,
        validatorRequest: this.cartService.createValidatorRequest(extra),
      };
    } else {
      newdata = {
        transactionId: this.transactionId,
        platformCode: "online",
        mode: extra.mode,
        paymentId: extra.paymentId,
        paymentGateway: "razorpay",
        requestParams: null,
        validatorRequest: this.cartService.createValidatorRequest(extra),
      };
    }
    this.commonService.isBrowser &&
      this._analytics.sendAdobeOrderRequestTracking(
        newdata,
        "pay-initiated:cash on delivery"
      );
    this.cartService.pay(newdata).subscribe((res): void => {
      if (res.status != true) {
        // this.submittedOnce = false;
        //this.isShowLoader = false;
        this.globalLoader.setLoaderState(false);
        return;
      }
      let data = res.data;
      let extras = {
        queryParams: {
          mode: "COD",
          orderId: data.orderId,
          transactionAmount: data.orderAmount,
        },
        replaceUrl: true,
      };
      this.globalLoader.setLoaderState(false);
      this.commonService.isBrowser && this.updateBuyNowToLocalStorage();
      this._router.navigate(["order-confirmation"], extras);
      //this.isShowLoader=false;
    });
  }

  /**
   * Set buyNow state to localstorage for removing buyNow
   * item from cart after successfull/failure of payment.
   * also remove existing buynow flag, if user tries to place order without buynow.
   */
  updateBuyNowToLocalStorage() {
    const buyNow = this.cartService.buyNow;
    if (buyNow) {
      this.localStorageService.store("flashData", { buyNow: true });
    } else {
      this.localStorageService.clear("flashData");
    }
  }

  openOfferPopUp()
{
  this.cartService.getPromoCodesByUserId(this.currUser['userId']);
  // need to setup this url 
    this.showPromoOfferPopup = true;
    this.localAuthService.setBackURLTitle('/quickorder', null);
      let navigationExtras: NavigationExtras = {
          queryParams: { 'backurl': '/quickorder' },
    };
}

closePromoSuccessPopUp() { this.showPromoSuccessPopup = false; }

closePromoListPopUp(flag) { this.showPromoOfferPopup = flag }

ngOnDestroy(): void
{
    if (this.cartSubscription) this.cartSubscription.unsubscribe()
    if (this.promoSubscription) this.promoSubscription.unsubscribe()
}
    

}



@NgModule({
  declarations: [PdpQuickCheckoutComponent],
  imports: [CommonModule, BottomMenuModule, PromoCodeModule, MathFloorPipeModule, MathCeilPipeModule, PromoCodeModule, CartModule],
  exports: [PdpQuickCheckoutComponent],
})
export class PdpQuickCheckoutModule {}
