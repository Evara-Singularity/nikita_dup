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
  ChangeDetectorRef,
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
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
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
  productStaticData = this.commonService.defaultLocaleValue;
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
  animationStart:boolean=false


  @Output("firstImageClickedEvent") firstImageClickedEvent = new EventEmitter();
  @Output("removeWindowScrollListenerEvent") removeWindowScrollListenerEvent = new EventEmitter();
  @Output("showAllKeyFeatureClickEvent") showAllKeyFeatureClickEvent =
    new EventEmitter();
  @Output("ratingReviewClickEvent") ratingReviewClickEvent =
    new EventEmitter();
  @Output("checkEventToStopLoader") checkEventToStopLoader =
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
  rawProductData: any;
  // ondemad loaded components for quick order popUp
  quickOrderInstance = null;
  @ViewChild("quickOrder", { read: ViewContainerRef })
  quickOrderContainerRef: ViewContainerRef;
  productRawData: Subject<any> = new Subject();
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
    private _analytic: GlobalAnalyticsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getStaticSubjectData();
    if (this.productMsn) {
      this.createSiemaOption(this.index);
      this.getProductData();
    }
  }
  getStaticSubjectData(){
    this.commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  get similarProductData() {
    return this.productService.oosSimilarProductsData.similarData;
  }

  navigateTo(link: string) {
    this.removeWindowScrollListenerEvent.emit(true);
    this.commonService.navigateTo(link, true);
  }

  getProductData() {
    // this._loader.setLoaderState(true);
    // Product API url
    forkJoin([
      this.productService.getProduct(this.productMsn),
      this.productService.getProductPageBreadcrum(this.productMsn),
      this.productService
        .getProductStatusCount(this.productMsn)
    ]).subscribe((rawData) => {
      this.breadcrumData = rawData[1];
      if (this.breadcrumData.length > 0) {
        // this.commonService.triggerAttachHotKeysScrollEvent('oos-card-' + this.index);
      }
      if (
        rawData[0]["productBO"] &&
        Object.values(rawData[0]["productBO"]["productPartDetails"])[0][
        "images"
        ] !== null
      ) {
        this.rawProductData = rawData[0]["productBO"];
        this.productService.processProductData(
          {
            productBO: this.rawProductData,
            refreshCrousel: true,
            subGroupMsnId: null,
          },
          this.index
        );
        this.qunatityFormControl.setValue(this.productService.getSimilarProductInfoByIndex(this.index).productMinimmumQuantity);
        this.showProduct = true;
        this.setRecentlyBought(rawData[2]);
        this.checkEventToStopLoader.next(this.index);
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

  checkCartQuantityAndUpdate(value): void {
    this.animationStart=false
    if (!value) {
      this._toastMessageService.show({
        type: 'error',
        text: (value == 0) ? 'Minimum qty can be ordered is: 1' : 'Please enter a valid quantity',
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
        this.qunatityFormControl.setValue(this.similarProduct.priceQuantityCountry['quantityAvailable']);
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
      // let obj = {
      //   review_type: "PRODUCT_REVIEW",
      //   item_type: "PRODUCT",
      //   item_id: (this.productService.oosSimilarProductsData.similarData[this.index]['defaultPartNumber']).toLowerCase(),
      //   user_id: ""
      // }
      let obj = {
        reviewType: "PRODUCT_REVIEW",
        itemType: "PRODUCT",
        itemId: (this.productService.oosSimilarProductsData.similarData[this.index]['defaultPartNumber']).toLowerCase(),
        userId: ""
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
       loop:true,   
      onInit: () => {
        setTimeout(() => {
          this.carouselInitialized = true;
        }, 0);
      },
    };
  }

  async loadProductCrousel(slideIndex) {
    this.commonService.enableNudge = false;
    if (!this.productCrouselInstance) {
      this.isProductCrouselLoaded = true;
      const { ProductCrouselComponent } = await import(
        "../../product-crousel/ProductCrousel.component"
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
      this.productCrouselInstance.instance["productBo"] = this.rawProductData;
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
    // console.log(this.productService.oosSimilarProductsData.similarData ,"a");
    this.loadProductCrousel( this.productService.oosSimilarProductsData.similarData[this.index].productAllImages.length - 1);
  }

  onRotateNext() {
    this.loadProductCrousel(1);
  }

  firstImageClicked() {
    this.firstImageClickedEvent.emit(this.index);
  }

  goToCart(){
  this.commonService.navigateTo('/quickorder', true) 
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
            setTimeout(() => { this._loader.setLoaderState(false); }, 1000);
          this._toastMessageService.show({ type: 'error', text: "Quantity not available" });
          return;
        }
        if (productDetails.filterAttributesList) {
          // incase grouped product ask for variant
          const productEntity = this.productService.productEntityFromProductBO(this.productService.getSimilarProductBoByIndex(this.index));
            setTimeout(() => { this._loader.setLoaderState(false); }, 1000);
          this.loadVariantPop(productEntity, productDetails, buyNow, this.productService.getSimilarProductBoByIndex(this.index));
        } else {
          this.addToCart(productDetails, buyNow, this.productService.getSimilarProductBoByIndex(this.index))
        }
      } else {
          setTimeout(() => { this._loader.setLoaderState(false);}, 1000);
          this.showAddToCartToast('Product does not exist');
      }
    }, error => {
      console.log('buyNow ==>', error);
    })
  }

  private addToCart(productDetails, buyNow, rawData = this.productService.getSimilarProductBoByIndex(this.index)): void {
    if(buyNow) {
      this.productService.validateQuickCheckout(rawData).subscribe((res) => {
        if (res != null) {
          this.quickCheckoutPopUp(res.address, rawData);
          // this._loader.setLoaderState(false);
          this.commonService.setBodyScroll(null, false);
          // this.analyticAddToCart(buyNow, this.cartQunatityForProduct, true);
      } else {
        this.proceedToCart(productDetails, buyNow)
      }
      })
    } else {
      this.proceedToCart(productDetails, buyNow)
      this.animationStart=true
    }
    
  }

  async quickCheckoutPopUp(address, rawProductData) {
    console.log(rawProductData);
    if (!this.quickOrderInstance) {
        this._loader.setLoaderState(true);
        const { PdpQuickCheckoutComponent } = await import(
            "../../../components/pdp-quick-checkout/pdp-quick-checkout.component"
        ).finally(() => {
            this._loader.setLoaderState(false);
            this.cdr.detectChanges();
        });
        const factory = this.cfr.resolveComponentFactory(PdpQuickCheckoutComponent);
        this.quickOrderInstance = this.quickOrderContainerRef.createComponent(
            factory,
            null,
            this.injector
        );

        this.quickOrderInstance.instance["rawProductData"] = rawProductData;
        this.quickOrderInstance.instance["productPrice"] = rawProductData.productPrice;
        this.quickOrderInstance.instance["selectedProductBulkPrice"] = null;
        this.quickOrderInstance.instance["cartQunatityForProduct"] = 1;
        this.quickOrderInstance.instance["address"] = address;
        this.quickOrderInstance.instance['isFrompdp'] = false;
        (
            this.quickOrderInstance.instance["isClose"] as EventEmitter<boolean>
        ).subscribe((status) => {
            this._router.navigate(["/checkout"]);
        });
        this.quickOrderInstance = null;
        this.cdr.detectChanges();
    }
}
  proceedToCart(productDetails, buyNow) {
    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
      if (!result && this._cartService.buyNowSessionDetails) {
        // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
        //use locaauthservice as it is hard to carry back url in otp
        this.localAuthService.setBackURLTitle(this._router.url, "Continue to place order");
        this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
      } else {
        if (result) {
          // this.resetVariantData();
          this._productListService.analyticAddToCart(buyNow ? '/checkout' : '/quickorder', productDetails, 'PRODUCT_SIMILAR_OUT_OF_STOCK');
          if (!buyNow) {
            this._cartService.setGenericCartSession(result);
            this._cartService.cart.next({
              count: result['noOfItems'] || (result['itemsList'] ? result['itemsList'].length : 0),
              currentlyAdded: productDetails
            });
            this.showAddToCartToast();
            // analytics call
          } else {
            //use locaauthservice as it is hard to carry back url in otp
            this.localAuthService.setBackURLTitle(this._router.url, "Continue to place order");
            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
          }
        } else {
          this.showAddToCartToast('Product already added');
        }
      }
    })
  }
  variantAddToCart(data, productRawData = {}) {
    this.addToCart(data.product, data.buyNow, productRawData)
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
      this.cdr.detectChanges();
    }
  }

  async loadVariantPop(productEntity, productAddToCartSchema, buyNow = false, productRawData=null) {
    if (!this.variantPopupInstance) {
      this._loader.setLoaderState(true);
      const { ProductVariantSelectListingPageComponent } = await import('../../../components/product-variant-select-listing-page/product-variant-select-listing-page.component').finally(() => {
        this._loader.setLoaderState(false);
      });
      this.productRawData.subscribe((data) => {
        if(data) {
          productRawData = data;
        }
      })
      const factory = this.cfr.resolveComponentFactory(ProductVariantSelectListingPageComponent);
      this.variantPopupInstance = this.variantPopupInstanceRef.createComponent(factory, null, this.injector);
      this.variantPopupInstance.instance['product'] = productEntity;
      this.variantPopupInstance.instance['productGroupData'] = productAddToCartSchema;
      this.variantPopupInstance.instance['buyNow'] = buyNow;
      this.variantPopupInstance.instance['isSelectedVariantOOO'] = false; // on first load always instock and value is passed as false
      this.commonService.enableNudge = false;

      (this.variantPopupInstance.instance['selectedVariant$'] as EventEmitter<boolean>).subscribe(data => {
        this.commonService.enableNudge = false;
        this.changeVariant(data);
      });
      (this.variantPopupInstance.instance['selectedVariantOOO$'] as EventEmitter<boolean>).subscribe(msnId => {
        this.openRfqFormCore(msnId);
        this.variantPopupInstance = null;
        this.productRawData.unsubscribe();
        this.variantPopupInstanceRef.detach();
        this.commonService.enableNudge = false;
      });
      (this.variantPopupInstance.instance['continueToCart$'] as EventEmitter<boolean>).subscribe(data => {
        this.variantAddToCart(data, productRawData);
        this.variantPopupInstance = null;
        this.productRawData.unsubscribe();
        this.variantPopupInstanceRef.detach();
        this.commonService.enableNudge = false;
      });
      (this.variantPopupInstance.instance['hide$'] as EventEmitter<boolean>).subscribe(data => {
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
        this.commonService.enableNudge = false;
        this.productRawData.unsubscribe();
        // this.commonService.resetSearchNudgeTimer();
      });
      this.cdr.detectChanges()
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
        this.productRawData.next(productBO);
        this.cdr.detectChanges()
      }
    }, error => {
      console.log('changeVariant ==>', error);
    }, () => {
      this._loader.setLoaderState(false);
    })
    this.cdr.detectChanges()
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
        //use locaauthservice as it is hard to carry back url in otp
        this.localAuthService.setBackURLTitle(this._router.url, "Continue to raise RFQ");
      let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this._router.url } };
      this._router.navigate(['/login'], navigationExtras);
    }
    this.cdr.detectChanges();
  }

  async intiateRFQQuote(product) {
    this.commonService.enableNudge = false;
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
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  getBrandLink(brandDetails: {}) {
    if (brandDetails == undefined) {
      return [];
    }
    return [`/brands/${brandDetails["friendlyUrl"]}`]
  }

  navigateLink(link) {
    this._router.navigate([link]);
  }

  onVisibleInViewPort() {
    const anaytics = this.productService.getAdobeAnalyticsObjectData(this.index, 'ooo:similar:pdp');
    anaytics.page.channel = 'pdp:' + this.index;
    this._analytic.sendAdobeCall(anaytics, 'genericPageLoad');
  }

  get similarData(){
    return this.productService.oosSimilarProductsData.similarData
  }


}
