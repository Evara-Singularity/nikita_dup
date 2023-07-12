import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Injector,
  Input,
  NgModule,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { AddToCartProductSchema } from "@app/utils/models/cart.initial";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductService } from "@app/utils/services/product.service";
import { ProductListService } from "@app/utils/services/productList.service";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "add-to-cart",
  templateUrl: "./add-to-cart.component.html",
  styleUrls: ["./add-to-cart.component.scss"],
})
export class AddToCartComponent implements OnDestroy {
  productGroupData: any = null;
  @Input("isOutOfStock") isOutOfStock: false;
  @Input("moglixPartNumber") moglixPartNumber: string = null;
  @Input("product") product: object = null;
  @Input("moduleUsedIn") moduleUsedIn: string = null;
  isAddedToCartSubscription: Subscription;

  // ondemad loaded components for select variant popup
  variantPopupInstance = null;
  @ViewChild("variantPopup", { read: ViewContainerRef })
  variantPopupInstanceRef: ViewContainerRef;
  productReviewCount: string;
  // add to cart toast msg
  addToCartToastInstance = null;
  @ViewChild("addToCartToast", { read: ViewContainerRef })
  addToCartToastContainerRef: ViewContainerRef;
  // ondemand loaded components for product RFQ
  productRFQInstance = null;
  @ViewChild("productRFQ", { read: ViewContainerRef })
  productRFQContainerRef: ViewContainerRef;
  // ondemad loaded components for green aleart box as success messge
  rfqThankyouInstance = null;
  @ViewChild("rfqThankyou", { read: ViewContainerRef })
  rfqThankyouContainerRef: ViewContainerRef;

  constructor(
    public _cartService: CartService,
    public _productListService: ProductListService,
    public _loader: GlobalLoaderService,
    public _router: Router,
    private _productService: ProductService,
    private _toastMessageService: ToastMessageService,
    private _commonService: CommonService,
    private _cfr: ComponentFactoryResolver,
    private _injector: Injector,
    private _localAuthService: LocalAuthService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    if (this.variantPopupInstance && this.variantPopupInstanceRef != null) {
      this.variantPopupInstance = null;
      this.variantPopupInstanceRef.remove();
    }
    if (this.rfqThankyouInstance && this.rfqThankyouContainerRef != null) {
      this.rfqThankyouInstance = null;
      this.rfqThankyouContainerRef.remove();
    }
    if (
      this.addToCartToastInstance &&
      this.addToCartToastContainerRef != null
    ) {
      this.addToCartToastInstance = null;
      this.addToCartToastContainerRef.remove();
    }
    if (this.productRFQInstance && this.productRFQContainerRef != null) {
      this.productRFQInstance = null;
      this.productRFQContainerRef.remove();
    }
  }

  buyNow(buyNow = false) {
    this._loader.setLoaderState(true);
    const productMsnId = this.moglixPartNumber;
    this._productService
      .getProductGroupDetails(productMsnId)
      .pipe(
        map((productRawData) => {
          if (productRawData["productBO"]) {
            return this._cartService.getAddToCartProductItemRequest({
              productGroupData: productRawData["productBO"],
              buyNow,
            });
          } else {
            return null;
          }
        })
      )
      .subscribe(
        (productDetails: AddToCartProductSchema) => {
          if (productDetails) {
            if (
              productDetails["productQuantity"] &&
              productDetails["quantityAvailable"] <
                productDetails["productQuantity"]
            ) {
              this._toastMessageService.show({
                type: "error",
                text: "Quantity not available",
              });
              return;
            }
            if (productDetails.filterAttributesList) {
              this.loadVariantPop(this.product, productDetails, buyNow);
            } else {
              this.addToCart(productDetails, buyNow);
            }
          } else {
            this.showAddToCartToast("Product does not exist");
          }
        },
        (error) => {
          // console.log('buyNow ==>', error);
        },
        () => {
          this._loader.setLoaderState(false);
        }
      );
  }

  private addToCart(productDetails, buyNow): void {
    this._cartService.addToCart({ buyNow, productDetails }).subscribe(
      (result) => {
        if (!result && this._cartService.buyNowSessionDetails) {
          // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
          this._productListService.analyticAddToCart(
            buyNow ? "/checkout" : "/quickorder",
            productDetails,
            this.moduleUsedIn
          );
          this._localAuthService.setBackURLTitle(
            this._router.url,
            "Continue to place order"
          );
          this._router.navigate(["/checkout/login"], {
            queryParams: {
              title: "Continue to place order",
            },
            state: buyNow ? { buyNow: buyNow } : {},
          });
        } else {
          if (result) {
            this.resetVariantData();
            // analytics call
            this._productListService.analyticAddToCart(
              buyNow ? "/checkout" : "/quickorder",
              productDetails,
              this.moduleUsedIn
            );
            if (!buyNow) {
              this._cartService.setGenericCartSession(result);
              this._cartService.isAddedToCartSubject.next(productDetails);
              this.showAddToCartToast();
            } else {
              this._router.navigateByUrl("/checkout", {
                state: buyNow ? { buyNow: buyNow } : {},
              });
            }
          } else {
            this.showAddToCartToast("Product already added");
          }
        }
      },
      (error) => {
        this._cartService.isAddedToCartSubject.next(productDetails);
      }
    );
    this._commonService.enableNudge = false;
  }

  changeVariant(data) {
    this._loader.setLoaderState(true);
    this._productService.getProductGroupDetails(data.msn).pipe(
      map(productRawData => {
        if (productRawData['productBO']) {
          return productRawData['productBO'];
        } else {
          return Error('Valid token not returned');
        }
      })
    ).subscribe((productBO) => {
      // productDetails will always have variants as it can be called by variant popup only
      if (this.variantPopupInstance) {
        const productRequest = this._cartService.getAddToCartProductItemRequest({ productGroupData: productBO, buyNow: data.buyNow });
        const product = this._productService.productEntityFromProductBO(productBO, { rating: this.product['rating'], ratingCount: this.product['ratingCount'], });
        const outOfStockCheck: boolean = (productBO && productBO['outOfStock'] == true) ? true : false;

        this.variantPopupInstance.instance['productGroupData'] = productRequest;
        this.variantPopupInstance.instance['product'] = product;
        this.variantPopupInstance.instance['isSelectedVariantOOO'] = outOfStockCheck;
        this.cdr.detectChanges();
      }
    }, error => {
      console.log('changeVariant ==>', error);
    }, () => {
      this._loader.setLoaderState(false);
    })
  }

  async loadVariantPop(product, productGroupData, buyNow = false) {
    if (!this.variantPopupInstance) {
      this._loader.setLoaderState(true);
      const { ProductVariantSelectListingPageComponent } = await import(
        "../product-variant-select-listing-page/product-variant-select-listing-page.component"
      ).finally(() => {
        this._loader.setLoaderState(false);
        this._commonService.enableNudge = false;
      });
      const factory = this._cfr.resolveComponentFactory(
        ProductVariantSelectListingPageComponent
      );
      this.variantPopupInstance = this.variantPopupInstanceRef.createComponent(
        factory,
        null,
        this._injector
      );
      this.variantPopupInstance.instance["product"] = product;
      this.variantPopupInstance.instance["productGroupData"] = productGroupData;
      this.variantPopupInstance.instance["buyNow"] = buyNow;
      this.variantPopupInstance.instance["isSelectedVariantOOO"] = false; // on first load always instock and value is passed as false
      this._commonService.enableNudge = false;
      (
        this.variantPopupInstance.instance[
          "selectedVariant$"
        ] as EventEmitter<boolean>
      ).subscribe((data) => {
         this.changeVariant(data);
        this._commonService.enableNudge = false;
      });
      (
        this.variantPopupInstance.instance[
          "selectedVariantOOO$"
        ] as EventEmitter<boolean>
      ).subscribe((msnId) => {
        this.openRfqFormCore(msnId);
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
        this._commonService.enableNudge = false;
      });
      (
        this.variantPopupInstance.instance[
          "continueToCart$"
        ] as EventEmitter<boolean>
      ).subscribe((data) => {
        this.variantAddToCart(data);
        this._commonService.enableNudge = false;
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
      (
        this.variantPopupInstance.instance["hide$"] as EventEmitter<boolean>
      ).subscribe((data) => {
        this._commonService.enableNudge = false;
        // this._commonService.resetSearchNudgeTimer();
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
      this.cdr.detectChanges();
    }
  }

  async showAddToCartToast(message = null) {
    if (!this.addToCartToastInstance) {
      const { GlobalToastComponent } = await import(
        "../global-toast/global-toast.component"
      );
      const factory = this._cfr.resolveComponentFactory(GlobalToastComponent);
      this.addToCartToastInstance =
        this.addToCartToastContainerRef.createComponent(
          factory,
          null,
          this._injector
        );
      this.addToCartToastInstance.instance["text"] =
        message || "Product added successfully";
      this.addToCartToastInstance.instance["btnText"] = "VIEW CART";
      this.addToCartToastInstance.instance["btnLink"] = "/quickorder";
      this.addToCartToastInstance.instance["showTime"] = 4000;
      this.addToCartToastInstance.instance["positionBottom"] = true;
      (
        this.addToCartToastInstance.instance["removed"] as EventEmitter<boolean>
      ).subscribe((status) => {
        this.addToCartToastInstance = null;
        this.addToCartToastContainerRef.detach();
      });
      this.cdr.detectChanges();
    }
  }

  async intiateRFQQuote(product) {
    let hasGstin = null;
    let rfqValue = 0;
    this._loader.setLoaderState(true);
    this._commonService.enableNudge = false;
    const { ProductRFQComponent } = await import(
      "../product-rfq/product-rfq.component"
    );
    const factory = this._cfr.resolveComponentFactory(ProductRFQComponent);
    this.productRFQInstance = this.productRFQContainerRef.createComponent(
      factory,
      null,
      this._injector
    );
    this.productRFQInstance.instance["isOutOfStock"] = false;
    this.productRFQInstance.instance["extraOutOfStock"] = true;
    this.productRFQInstance.instance["isPopup"] = true;
    this.productRFQInstance.instance["product"] = product;
    (
      this.productRFQInstance.instance["isLoading"] as EventEmitter<boolean>
    ).subscribe((loaderStatus) => {
      this._loader.setLoaderState(loaderStatus);
    });
    (
      this.productRFQInstance.instance["hasGstin"] as EventEmitter<boolean>
    ).subscribe((value) => {
      hasGstin = value;
    });
    //productPrice
    (
      this.productRFQInstance.instance["rfqQuantity"] as EventEmitter<string>
    ).subscribe((rfqQuantity) => {
      rfqValue = rfqQuantity * Math.floor(this.product["salesPrice"] || 0);
    });
    (
      this.productRFQInstance.instance["onRFQSuccess"] as EventEmitter<boolean>
    ).subscribe((status) => {
      this.loadRFQThankyouPopup(hasGstin, rfqValue);
      this._productListService.analyticRFQ(true, product);
    });
    this.cdr.detectChanges();
  }

  async loadRFQThankyouPopup(hasGstin, rfqValue) {
    if (!this.rfqThankyouInstance) {
      this._loader.setLoaderState(true);
      const { ProductRfqThanksPopupComponent } = await import(
        "../product-rfq-thanks-popup/product-rfq-thanks-popup.component"
      ).finally(() => {
        this._loader.setLoaderState(false);
      });
      const factory = this._cfr.resolveComponentFactory(
        ProductRfqThanksPopupComponent
      );
      this.rfqThankyouInstance = this.rfqThankyouContainerRef.createComponent(
        factory,
        null,
        this._injector
      );
      this.rfqThankyouInstance.instance["rfqTotalValue"] = rfqValue;
      this.rfqThankyouInstance.instance["hasGstin"] = hasGstin;
      this.rfqThankyouInstance.instance["getWhatsText"] = this.getWhatsText;
      this.rfqThankyouInstance.instance["imagePathAsset"] =
        CONSTANTS.IMAGE_ASSET_URL;
      this.rfqThankyouInstance.instance["productOutOfStock"] = true;
      this.rfqThankyouInstance.instance["isRFQSuccessfull"] = true;
      (
        this.rfqThankyouInstance.instance[
          "closeRFQAlert$"
        ] as EventEmitter<boolean>
      ).subscribe((status) => {
        this.rfqThankyouInstance.instance["isRFQSuccessfull"] = false;
        this.rfqThankyouInstance = null;
        this.rfqThankyouContainerRef.detach();
      });
      this.cdr.detectChanges();
    }
  }

  openRfqFormCore(productMsnId) {
    const user = this._localAuthService.getUserSession();
    const isUserLogin =
      user && user.authenticated && user.authenticated === "true"
        ? true
        : false;
    if (isUserLogin) {
      this._productService
        .getProductGroupDetails(productMsnId)
        .pipe(
          map((productRawData) => {
            return this._productService.getRFQProductSchema(
              productRawData["productBO"]
            );
          })
        )
        .subscribe((productDetails) => {
          this.intiateRFQQuote(productDetails).then((res) => {
            this._loader.setLoaderState(false);
          });
        });
    } else {
      this._localAuthService.setBackURLTitle(this._router.url, "Continue to raise RFQ");
      let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this._router.url, title: 'Continue to raise RFQ' } };
      this._router.navigate(['/login'], navigationExtras);
    }
    this.cdr.detectChanges(); 
  }

  variantAddToCart(data) {
    this.addToCart(data.product, data.buyNow);
  }

  resetVariantData() {
    this.productGroupData = null;
  }

  openRfqForm() {
    const productMsnId = this.product["moglixPartNumber"];
    this.openRfqFormCore(productMsnId);
  }

  get getWhatsText() {
    return `Hi, I want to buy ${this.product["productName"]} (${this.product["moglixPartNumber"]})`;
  }
}

@NgModule({
  declarations: [AddToCartComponent],
  exports: [AddToCartComponent],
  imports: [CommonModule],
})
export class AddToCartModule {}
