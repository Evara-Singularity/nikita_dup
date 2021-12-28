import { HttpClient } from "@angular/common/http";
import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  Input,
  EventEmitter,
  ViewChild,
  ViewContainerRef,
  Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { NavigationExtras, Router } from "@angular/router";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ModalService } from "@app/modules/modal/modal.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { AddToCartProductSchema } from "@app/utils/models/cart.initial";
import { ProductInfoSection } from '@app/utils/pipes/product-oos-similar-card-section.pipe';
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductService } from "@app/utils/services/product.service";
import { ProductListService } from "@app/utils/services/productList.service";
import { forkJoin, of, Subject } from "rxjs";
import { map } from 'rxjs/operators';
@Component({
  selector: "app-product-oos-similar-card",
  templateUrl: "./product-oos-similar-card.component.html",
  styleUrls: ["./product-oos-similar-card.component.scss"],
})
export class ProductOosSimilarCardComponent {
  breadcrumData: any;
  @Input("productMsn") productMsn;
  @Input("index") index: number;
  refreshSiemaItems$ = new Subject<{
    items: Array<{}>;
    type: string;
    currentSlide: number;
  }>();
  moveToSlide$ = new Subject<number>();
  carouselInitialized: boolean = false;
  isProductCrouselLoaded: boolean = false;

  // ondemand product crousel
  productCrouselInstance = null;
  @ViewChild("productCrousel", { read: ViewContainerRef })
  productCrouselContainerRef: ViewContainerRef;
  @ViewChild("productCrouselPseudo", { read: ElementRef })
  productCrouselPseudoContainerRef: ElementRef;
  selectedProductBulkPrice: null

  @Output("firstImageClickedEvent") firstImageClickedEvent = new EventEmitter();
  @Output("removeWindowScrollListenerEvent") removeWindowScrollListenerEvent = new EventEmitter();
  @Output("showAllKeyFeatureClickEvent") showAllKeyFeatureClickEvent =
    new EventEmitter();
  @Output("ratingReviewClickEvent") ratingReviewClickEvent =
    new EventEmitter();

  iOptions: any = null;
  showProduct: boolean = false;
  // quntity && bulk prices related
  qunatityFormControl: FormControl = new FormControl(1, []); // setting a default quantity to 1

  // add to cart toast msg
  addToCartToastInstance = null;
  @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;
  // ondemand loaded components for product RFQ
  productRFQInstance = null;
  @ViewChild('productRFQ', { read: ViewContainerRef }) productRFQContainerRef: ViewContainerRef;
  // ondemad loaded components for green aleart box as success messge
  alertBoxInstance = null;
  @ViewChild('alertBox', { read: ViewContainerRef }) alertBoxContainerRef: ViewContainerRef;
  // ondemad loaded components for select variant popup
  variantPopupInstance = null;
  @ViewChild('variantPopup', { read: ViewContainerRef }) variantPopupInstanceRef: ViewContainerRef;
  GLOBAL_CONSTANT = GLOBAL_CONSTANT;


  constructor(
    public productService: ProductService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    public commonService: CommonService,
    private _cartService: CartService,
    public _productListService: ProductListService,
    private _loader: GlobalLoaderService,
    private localAuthService: LocalAuthService,
    private _toastMessageService: ToastMessageService,
    private _router: Router,
  ) { }

  ngOnInit() {
    if (this.productMsn) {
      this.createSiemaOption(this.index);
      this.getProductData();
    }
  }

  navigateTo(link: string) {
    this.removeWindowScrollListenerEvent.emit(true);
    this.commonService.navigateTo(link, true);
  }

  getProductData() {
    // Product API url
    forkJoin([
      this.productService.getProduct(this.productMsn),
      this.productService.getProductPageBreadcrum(this.productMsn),
      this.productService
        .getProductStatusCount(this.productMsn)
    ]).subscribe((rawData) => {
      this.breadcrumData = rawData[1];
      if (
        rawData[0]["productBO"] &&
        Object.values(rawData[0]["productBO"]["productPartDetails"])[0][
        "images"
        ] !== null
      ) {
        this.productService.processProductData(
          {
            productBO: rawData[0]["productBO"],
            refreshCrousel: true,
            subGroupMsnId: null,
          },
          this.index
        );
        this.qunatityFormControl.setValue(this.productService.getSimilarProductInfoByIndex(this.index).productMinimmumQuantity);
        this.showProduct = true;
        this.setRecentlyBought(rawData[2]);
        
      }
    });
  }

  get cartQunatityForProduct() {
    return parseInt(this.qunatityFormControl.value) || 1;
  }

  get similarProduct() {
    return this.productService.getSimilarProductInfoByIndex(this.index);
  }

  onChangeCartQuanityValue() {
    this.checkCartQuantityAndUpdate(this.qunatityFormControl.value);
  }

  private checkCartQuantityAndUpdate(value): void {
    if (!value) {
      this._toastMessageService.show({
        type: 'error',
        text: 'Please enter valid quantity'
      })
      this.qunatityFormControl.setValue(this.similarProduct.productMinimmumQuantity);
    } else {
      if (parseInt(value) < parseInt(this.similarProduct.productMinimmumQuantity)) {
        this._toastMessageService.show({
          type: 'error',
          text: 'Minimum qty can be ordered is: ' + this.similarProduct.productMinimmumQuantity
        })
        this.qunatityFormControl.setValue(this.similarProduct.productMinimmumQuantity);
      } else if (parseInt(value) > parseInt(this.similarProduct.priceQuantityCountry['quantityAvailable'])) {
        this._toastMessageService.show({
          type: 'error',
          text: 'Maximum qty can be ordered is: ' + this.similarProduct.priceQuantityCountry['quantityAvailable']
        })
      } else if (isNaN(parseInt(value))) {
        this.qunatityFormControl.setValue(this.similarProduct.productMinimmumQuantity);
        this.checkBulkPriceMode();
      } else {
        this.qunatityFormControl.setValue(value);
        this.checkBulkPriceMode();
      }
    }
  }

  checkBulkPriceMode() {
    if (this.similarProduct.isBulkPricesProduct) {
      const selectedProductBulkPrice = this.similarProduct.productBulkPrices.filter(prices => (this.cartQunatityForProduct >= prices.minQty && this.cartQunatityForProduct <= prices.maxQty));
      this.selectedProductBulkPrice = (selectedProductBulkPrice.length > 0) ? selectedProductBulkPrice[0] : null;
    }
  }

  updateProductQunatity(type: 'INCREMENT' | 'DECREMENT') {
    switch (type) {
      case 'DECREMENT':
        this.checkCartQuantityAndUpdate((this.cartQunatityForProduct - 1))
        break;
      case 'INCREMENT':
        this.checkCartQuantityAndUpdate((this.cartQunatityForProduct + 1))
        break;
      default:
        break;
    }
  }

  setRecentlyBought(data) {
    if (data && data.status && data.data.hasOwnProperty('message') && data.data.message) {
      this.productService.oosSimilarProductsData.similarData[this.index].recentBoughtMessage = data.data.message;
    }
  }

  getReviewsAndRatings() {
    if (!this.productService.oosSimilarProductsData.similarData[this.index].hasOwnProperty('reviewRatingApiData')) {
      let obj = {
        review_type: "PRODUCT_REVIEW",
        item_type: "PRODUCT",
        item_id: (this.productService.oosSimilarProductsData.similarData[this.index]['defaultPartNumber']).toLowerCase(),
        user_id: " "
      }

      this.productService.getReviewsRating(obj).subscribe(data => {
        this.productService.oosSimilarProductsData.similarData[this.index].reviewRatingApiData = data['data'];
        this.ratingReviewClickEvent.emit(this.index);
      });
    } else {
      this.ratingReviewClickEvent.emit(this.index);
    }
  }

  changeBulkPriceQuantity(val, type?) {

  }

  createSiemaOption(index) {
    // if (!this.rawProductData) {
    //   return;
    // }
    this.iOptions = {
      selector: ".img-siema-" + index,
      perPage: 1,
      productNew: true,
      pager: true,
      imageAlt:
        this.productService.oosSimilarProductsData.similarData[this.index]
          .productName,
      onInit: () => {
        setTimeout(() => {
          this.carouselInitialized = true;
        }, 0);
      },
    };
  }

  async loadProductCrousel(slideIndex) {
    if (!this.productCrouselInstance) {
      this.isProductCrouselLoaded = true;
      const { ProductCrouselComponent } = await import(
        "../../../modules/product-crousel/ProductCrousel.component"
      ).finally(() => {
        this.clearPseudoImageCrousel();
      });
      const factory = this.cfr.resolveComponentFactory(ProductCrouselComponent);
      this.productCrouselInstance =
        this.productCrouselContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.productCrouselInstance.instance["options"] = this.iOptions;
      this.productCrouselInstance.instance["clickedIndexOfOosProduct"] =
        this.index;
      this.productCrouselInstance.instance["items"] =
        this.productService.oosSimilarProductsData.similarData[
          this.index
        ].productAllImages;
      this.productCrouselInstance.instance["moveToSlide$"] = this.moveToSlide$;
      this.productCrouselInstance.instance["refreshSiemaItems$"] =
        this.refreshSiemaItems$;
      this.productCrouselInstance.instance["productName"] =
        this.productService.oosSimilarProductsData.similarData[
          this.index
        ].productName;
      setTimeout(() => {
        (
          this.productCrouselInstance.instance[
          "moveToSlide$"
          ] as Subject<number>
        ).next(slideIndex);
      }, 100);
    }
  }

  clearPseudoImageCrousel() {
    this.isProductCrouselLoaded = false;
    this.productCrouselPseudoContainerRef.nativeElement.remove();
  }

  onRotatePrevious() {
    this.loadProductCrousel(1);
  }

  onRotateNext() {
    this.loadProductCrousel(1);
  }

  firstImageClicked() {
    this.firstImageClickedEvent.emit(this.index);
  }

  buyNow(buyNow) {
    this._loader.setLoaderState(true);
    of(this._cartService.getAddToCartProductItemRequest({
      productGroupData: this.productService.getSimilarProductBoByIndex(this.index),
      buyNow,
      selectPriceMap: this.selectedProductBulkPrice,
      quantity: this.cartQunatityForProduct
    })).subscribe((productDetails: AddToCartProductSchema) => {
      if (productDetails) {
        if (productDetails['productQuantity'] && (productDetails['quantityAvailable'] < productDetails['productQuantity'])) {
          this._toastMessageService.show({ type: 'error', text: "Quantity not available" });
          return;
        }
        if (productDetails.filterAttributesList) {
          // incase grouped product ask for variant
          const productEntity = this.productService.productEntityFromProductBO(this.productService.getSimilarProductBoByIndex(this.index));
          this.loadVariantPop(productEntity, productDetails, buyNow);
        } else {
          this.addToCart(productDetails, buyNow)
        }
      } else {
        this.showAddToCartToast('Product does not exist');
      }
    }, error => {
      console.log('buyNow ==>', error);
    }, () => {
      this._loader.setLoaderState(false);
    })
  }

  private addToCart(productDetails, buyNow): void {
    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
      if (!result && this._cartService.buyNowSessionDetails) {
        // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
        this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
      } else {
        if (result) {
          // this.resetVariantData();
          this._productListService.analyticAddToCart(buyNow ? '/checkout' : '/quickorder', productDetails);
          if (!buyNow) {
            this._cartService.setCartSession(result);
            this._cartService.cart.next({
              count: result['noOfItems'] || (result['itemsList'] ? result['itemsList'].length : 0),
              currentlyAdded: productDetails
            });
            this.showAddToCartToast();
            // analytics call
          } else {
            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
          }
        } else {
          this.showAddToCartToast('Product already added');
        }
      }
    })
  }

  variantAddToCart(data) {
    this.addToCart(data.product, data.buyNow)
  }

  async showAddToCartToast(message = null) {
    if (!this.addToCartToastInstance) {
      const { GlobalToastComponent } = await import('../../../components/global-toast/global-toast.component');
      const factory = this.cfr.resolveComponentFactory(GlobalToastComponent);
      this.addToCartToastInstance = this.addToCartToastContainerRef.createComponent(factory, null, this.injector);
      this.addToCartToastInstance.instance['text'] = message || 'Product added successfully';
      this.addToCartToastInstance.instance['btnText'] = 'VIEW CART';
      this.addToCartToastInstance.instance['btnLink'] = '/quickorder';
      this.addToCartToastInstance.instance['showTime'] = 4000;
      this.addToCartToastInstance.instance['positionBottom'] = true;
      (this.addToCartToastInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
        this.addToCartToastInstance = null;
        this.addToCartToastContainerRef.detach();
      });
    }
  }

  async loadVariantPop(productEntity, productAddToCartSchema, buyNow = false) {
    if (!this.variantPopupInstance) {
      this._loader.setLoaderState(true);
      const { ProductVariantSelectListingPageComponent } = await import('../../../components/product-variant-select-listing-page/product-variant-select-listing-page.component').finally(() => {
        this._loader.setLoaderState(false);
      });
      const factory = this.cfr.resolveComponentFactory(ProductVariantSelectListingPageComponent);
      this.variantPopupInstance = this.variantPopupInstanceRef.createComponent(factory, null, this.injector);
      this.variantPopupInstance.instance['product'] = productEntity;
      this.variantPopupInstance.instance['productGroupData'] = productAddToCartSchema;
      this.variantPopupInstance.instance['buyNow'] = buyNow;
      this.variantPopupInstance.instance['isSelectedVariantOOO'] = false; // on first load always instock and value is passed as false
      (this.variantPopupInstance.instance['selectedVariant$'] as EventEmitter<boolean>).subscribe(data => {
        this.changeVariant(data);
      });
      (this.variantPopupInstance.instance['selectedVariantOOO$'] as EventEmitter<boolean>).subscribe(msnId => {
        this.openRfqFormCore(msnId);
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
      (this.variantPopupInstance.instance['continueToCart$'] as EventEmitter<boolean>).subscribe(data => {
        this.variantAddToCart(data);
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
      (this.variantPopupInstance.instance['hide$'] as EventEmitter<boolean>).subscribe(data => {
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
    }
  }

  changeVariant(data) {
    this.productService.getProductGroupDetails(data.msn).pipe(
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
        const product = this.productService.productEntityFromProductBO(productBO);
        const outOfStockCheck: boolean = (productBO && productBO['outOfStock'] == true) ? true : false;
        this.variantPopupInstance.instance['productGroupData'] = productRequest;
        this.variantPopupInstance.instance['product'] = product;
        this.variantPopupInstance.instance['isSelectedVariantOOO'] = outOfStockCheck;
      }
    }, error => {
      console.log('changeVariant ==>', error);
    }, () => {
      this._loader.setLoaderState(false);
    })
  }

  // handle RFQ form is variant is out of stock

  openRfqFormCore(productMsnId) {
    const user = this.localAuthService.getUserSession();
    const isUserLogin = user && user.authenticated && ((user.authenticated) === 'true') ? true : false;
    if (isUserLogin) {
      this.productService.getProductGroupDetails(productMsnId).pipe(
        map(productRawData => {
          return this.productService.getRFQProductSchema(productRawData['productBO'])
        })
      ).subscribe(productDetails => {
        this.intiateRFQQuote(productDetails).then(res => {
          this._loader.setLoaderState(false);
        });
      })
    } else {
      let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this._router.url } };
      this._router.navigate(['/login'], navigationExtras);
    }
  }

  async intiateRFQQuote(product) {
    this._loader.setLoaderState(true);
    const { ProductRFQComponent } = await import('../../../components/product-rfq/product-rfq.component');
    const factory = this.cfr.resolveComponentFactory(ProductRFQComponent);
    this.productRFQInstance = this.productRFQContainerRef.createComponent(factory, null, this.injector);
    this.productRFQInstance.instance['isOutOfStock'] = false;
    this.productRFQInstance.instance['extraOutOfStock'] = true;
    this.productRFQInstance.instance['isPopup'] = true;
    this.productRFQInstance.instance['product'] = product;
    (this.productRFQInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus => {
      this._loader.setLoaderState(loaderStatus);
    });
    (this.productRFQInstance.instance['onRFQSuccess'] as EventEmitter<boolean>).subscribe((status) => {
      const headerText = 'Thanks for submitting the query.';
      const subHeaderText = 'Our support member will get in touch with you within 24 hours. For further assistance either Call or Whatsapp @ +91 99996 44044. You can also mail us at salesenquiry@moglix.com.';
      this.loadAlertBox(headerText, subHeaderText, null);
      this._productListService.analyticRFQ(true, product);
    });
  }


  async loadAlertBox(mainText, subText = null, extraSectionName: string = null) {
    if (!this.alertBoxInstance) {
      this._loader.setLoaderState(true);
      const { AlertBoxToastComponent } = await import('../../../components/alert-box-toast/alert-box-toast.component').finally(() => {
        this._loader.setLoaderState(false);
      });
      const factory = this.cfr.resolveComponentFactory(AlertBoxToastComponent);
      this.alertBoxInstance = this.alertBoxContainerRef.createComponent(factory, null, this.injector);
      this.alertBoxInstance.instance['mainText'] = mainText;
      this.alertBoxInstance.instance['subText'] = subText;
      if (extraSectionName) {
        this.alertBoxInstance.instance['extraSectionName'] = extraSectionName;
      }
      (this.alertBoxInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
        this.alertBoxInstance = null;
        this.alertBoxContainerRef.detach();
      });
      setTimeout(() => {
        this.alertBoxInstance = null;
        this.alertBoxContainerRef.detach();
      }, 2000);
    }
  }

    getBrandLink(brandDetails: {})
    {
        if (brandDetails == undefined) {
            return [];
        }
        return [`/brands/${brandDetails["friendlyUrl"]}`]
    }

    navigateLink(link)
    {
        this._router.navigate([link]);
    }


}
