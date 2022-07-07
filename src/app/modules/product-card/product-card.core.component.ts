import { Component, ComponentFactoryResolver, EventEmitter, HostBinding, Injector, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import CONSTANTS from '@app/config/constants';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { ProductService } from '@app/utils/services/product.service';
import { ProductListService } from '@app/utils/services/productList.service';
import { map } from 'rxjs/operators';
import { ModalService } from '../modal/modal.service';
import { ToastMessageService } from '../toastMessage/toast-message.service';

@Component({
  template: `
    <ng-template #productCardBaseComponent ></ng-template>
  `,
})
export class ProductCardCoreComponent implements OnInit {

  readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
  readonly defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  prodUrl=CONSTANTS.PROD;
  @Input("pageName") pageName = "";
  @Input() product: ProductsEntity;
  @Input() cardFeaturesConfig: ProductCardFeature = {
    // feature config
    enableAddToCart: true,
    enableBuyNow: true,
    enableFeatures: true,
    enableRating: true,
    enableVideo: true,
    // design config
    enableCard: false,
    verticalOrientation: false,
    horizontalOrientation: true,
    verticalOrientationV2: false,
    lazyLoadImage: true,
  }
  // currently being used in PDP similar product
  @Input() cardMetaInfo: ProductCardMetaInfo = {
    redirectedSectionName: '',
    redirectedIdentifier: '',
  }
  @Input() isAd: boolean = false;
  @Input() fullBrandNameMode: boolean = false;
  @Input() hideAd: boolean = false;
  @Input() isPDPImageLazyLoaded: boolean = false;
  @Input() pIndex = 0;
  @Input('section') section: string = '';
  @Input() enableTracking = false;
  @Input() analytics = null;
  @Input() isOosSimilarCard = null;
  @Input() moduleUsedIn: 'PRODUCT' | 'LISTING_PAGES' | 'PRODUCT_SIMILAR_OUT_OF_STOCK_TOP' | 'PRODUCT_SIMILAR_OUT_OF_STOCK' | 'SEACRH_SUGGESTION' | 'PRODUCT_PAST_ORDER' | 'HOME_RECENT' = 'LISTING_PAGES';
  productGroupData: any = null;
  @Input() @HostBinding("class.blue-color") public isBlue = false;
  @Output() remove$:EventEmitter<any> = new EventEmitter<any>();

  isOutOfStockByQuantity: boolean = false;
  isOutOfStockByPrice: boolean = false;
  // add to cart toast msg
  addToCartToastInstance = null;
  @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;
  // ondemand loaded components for product RFQ
  productRFQInstance = null;
  @ViewChild('productRFQ', { read: ViewContainerRef }) productRFQContainerRef: ViewContainerRef;
  // ondemad loaded components for green aleart box as success messge
  rfqThankyouInstance = null;
  @ViewChild('rfqThankyou', { read: ViewContainerRef }) rfqThankyouContainerRef: ViewContainerRef;
  // ondemand load of youtube video player in modal
  youtubeModalInstance = null;
  // ondemad loaded components for select variant popup
  variantPopupInstance = null;
  @ViewChild('variantPopup', { read: ViewContainerRef }) variantPopupInstanceRef: ViewContainerRef;
  productReviewCount: string;

  constructor(
    public _cartService: CartService,
    public _productListService: ProductListService,
    public _loader: GlobalLoaderService,
    public _router: Router,
    public _cfr: ComponentFactoryResolver,
    public _injector: Injector,
    public modalService: ModalService,
    public _localAuthService: LocalAuthService,
    public _commonService: CommonService,
    public _analytics: GlobalAnalyticsService,
    public _toastMessageService: ToastMessageService,
    public _productService: ProductService,
  ) {
  }

  ngOnInit(): void {
    this.isOutOfStockByQuantity = !this.product.quantityAvailable || this.product.outOfStock;
    this.isOutOfStockByPrice = !this.product.salesPrice && !this.product.mrp;
    // randomize product feature
    this.product['keyFeatures'] = this.getRandomValue(this.product['keyFeatures'] || [], 2)
    this.isAd = !this.product.internalProduct
    this.productReviewCount = this.product.ratingCount > 1 ? this.product.ratingCount + ' Reviews' : this.product.ratingCount + ' Review';
    this.prodUrl = CONSTANTS.PROD;
  }

  buyNow(buyNow = false) {
    this._loader.setLoaderState(true);
    const productMsnId = this.product['moglixPartNumber'];
    this._productService.getProductGroupDetails(productMsnId).pipe(
      map(productRawData => {
        // console.log('data ==> ', productRawData);
        if (productRawData['productBO']) {
          return this._cartService.getAddToCartProductItemRequest({ productGroupData: productRawData['productBO'], buyNow });
        } else {
          return null;
        }
      })
    ).subscribe((productDetails: AddToCartProductSchema) => {
      if (productDetails) {
        if (productDetails['productQuantity'] && (productDetails['quantityAvailable'] < productDetails['productQuantity'])) {
          this._toastMessageService.show({ type: 'error', text: "Quantity not available" });
          return;
        }
        if (productDetails.filterAttributesList) {
          this.loadVariantPop(this.product, productDetails, buyNow);
        } else {
          this.addToCart(productDetails, buyNow)
        }
      } else {
        this.showAddToCartToast('Product does not exist');
      }
    }, error => {
      // console.log('buyNow ==>', error);
    }, () => {
      this._loader.setLoaderState(false);
    })
  }

  changeVariant(data) {
    this._productService.getProductGroupDetails(data.msn).pipe(
      map(productRawData => {
        if (productRawData['productBO']) {
          return productRawData['productBO'];
        } else {
          return Error('Valid token not returned');
        }
      })
    ).subscribe((productBO) => {
      // console.log('productBO ==>', productBO);
      // productDetails will always have variants as it can be called by variant popup only
      if (this.variantPopupInstance) {
        const productRequest = this._cartService.getAddToCartProductItemRequest({ productGroupData: productBO, buyNow: data.buyNow });
        const product = this._productService.productEntityFromProductBO(productBO, { rating: this.product.rating, ratingCount: this.product.ratingCount, });
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

  resetVariantData() {
    this.productGroupData = null;
  }

  variantAddToCart(data) {
    this.addToCart(data.product, data.buyNow)
  }

  navigateToPDP() {
    // incase of promotional ad we need to fire GTM event for tracking
    if (this.isAd && this._commonService.isBrowser) {
      this.onlineSalesClickTrackUsingGTM();
    }
    this._commonService.setSectionClickInformation(this.cardMetaInfo.redirectedSectionName, this.cardMetaInfo.redirectedIdentifier);
    this._router.navigateByUrl(this.product.productUrl);
  }

  async showAddToCartToast(message = null) {
    if (!this.addToCartToastInstance) {
      const { GlobalToastComponent } = await import('../../components/global-toast/global-toast.component');
      const factory = this._cfr.resolveComponentFactory(GlobalToastComponent);
      this.addToCartToastInstance = this.addToCartToastContainerRef.createComponent(factory, null, this._injector);
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


  async showYTVideo(link) {
    if (!this.youtubeModalInstance) {
      const PRODUCT = this._analytics.basicPLPTracking(this.product);
      this.product['sellingPrice'] = this.product['salesPrice'];
      let analyticsDetails = this._analytics.getCommonTrackingObject(PRODUCT, "listing");
      let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
      let videoDetails = { url: link, params: ytParams };
      let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
      modalData.inputs = { videoDetails: videoDetails, analyticsDetails: analyticsDetails};
      this.modalService.show(modalData);
    }
  }

  async loadVariantPop(product, productGroupData, buyNow = false) {
    if (!this.variantPopupInstance) {
      this._loader.setLoaderState(true);
      const { ProductVariantSelectListingPageComponent } = await import('../../components/product-variant-select-listing-page/product-variant-select-listing-page.component').finally(() => {
        this._loader.setLoaderState(false);
        this._commonService.enableNudge = false;
      });
      const factory = this._cfr.resolveComponentFactory(ProductVariantSelectListingPageComponent);
      this.variantPopupInstance = this.variantPopupInstanceRef.createComponent(factory, null, this._injector);
      this.variantPopupInstance.instance['product'] = product;
      this.variantPopupInstance.instance['productGroupData'] = productGroupData;
      this.variantPopupInstance.instance['buyNow'] = buyNow;
      this.variantPopupInstance.instance['isSelectedVariantOOO'] = false; // on first load always instock and value is passed as false
      this._commonService.enableNudge = false;
      (this.variantPopupInstance.instance['selectedVariant$'] as EventEmitter<boolean>).subscribe(data => {
        this.changeVariant(data);
        this._commonService.enableNudge = false;
      });
      (this.variantPopupInstance.instance['selectedVariantOOO$'] as EventEmitter<boolean>).subscribe(msnId => {
        this.openRfqFormCore(msnId);
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
        this._commonService.enableNudge = false;
      });
      (this.variantPopupInstance.instance['continueToCart$'] as EventEmitter<boolean>).subscribe(data => {
        this.variantAddToCart(data);
        this._commonService.enableNudge = false;
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
      (this.variantPopupInstance.instance['hide$'] as EventEmitter<boolean>).subscribe(data => {
        this._commonService.enableNudge = false;
        // this._commonService.resetSearchNudgeTimer();
        this.variantPopupInstance = null;
        this.variantPopupInstanceRef.detach();
      });
    }
  }


  openRfqForm() {
    const productMsnId = this.product['moglixPartNumber'];
    this.openRfqFormCore(productMsnId);
  }

  openRfqFormCore(productMsnId) {
    const user = this._localAuthService.getUserSession();
    const isUserLogin = user && user.authenticated && ((user.authenticated) === 'true') ? true : false;
    if (isUserLogin) {
      this._productService.getProductGroupDetails(productMsnId).pipe(
        map(productRawData => {
          return this._productService.getRFQProductSchema(productRawData['productBO'])
        })
      ).subscribe(productDetails => {
        this.intiateRFQQuote(productDetails).then(res => {
          this._loader.setLoaderState(false);
        });
      })
    } else {
      this._localAuthService.setBackURLTitle(this._router.url, "Continue to raise RFQ");
      let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this._router.url, title: 'Continue to raise RFQ' } };
      this._router.navigate(['/login'], navigationExtras);
    }
  }

  async intiateRFQQuote(product) {
    let hasGstin = null;
    let rfqValue = 0;
    this._loader.setLoaderState(true);
    this._commonService.enableNudge = false;
    const { ProductRFQComponent } = await import('../../components/product-rfq/product-rfq.component');
    const factory = this._cfr.resolveComponentFactory(ProductRFQComponent);
    this.productRFQInstance = this.productRFQContainerRef.createComponent(factory, null, this._injector);
    this.productRFQInstance.instance['isOutOfStock'] = false;
    this.productRFQInstance.instance['extraOutOfStock'] = true;
    this.productRFQInstance.instance['isPopup'] = true;
    this.productRFQInstance.instance['product'] = product;
    (this.productRFQInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus => {
      this._loader.setLoaderState(loaderStatus);
    });
    (this.productRFQInstance.instance["hasGstin"] as EventEmitter<boolean>).subscribe((value) =>{hasGstin=value});
    //productPrice
    (this.productRFQInstance.instance["rfqQuantity"] as EventEmitter<string>).subscribe((rfqQuantity) => { rfqValue = rfqQuantity * Math.floor(this.product['salesPrice'] || 0);    });
    (this.productRFQInstance.instance['onRFQSuccess'] as EventEmitter<boolean>).subscribe((status) => {
      this.loadRFQThankyouPopup(hasGstin, rfqValue);
      this._productListService.analyticRFQ(true, product);
    });
  }


  async loadRFQThankyouPopup(hasGstin, rfqValue) {
    if (!this.rfqThankyouInstance) {
      this._loader.setLoaderState(true);
      const { ProductRfqThanksPopupComponent } = await import('../../components/product-rfq-thanks-popup/product-rfq-thanks-popup.component').finally(() => {
        this._loader.setLoaderState(false);
      });
      const factory = this._cfr.resolveComponentFactory(ProductRfqThanksPopupComponent);
      this.rfqThankyouInstance = this.rfqThankyouContainerRef.createComponent(factory, null, this._injector);
      this.rfqThankyouInstance.instance['rfqTotalValue'] = rfqValue;
      this.rfqThankyouInstance.instance['hasGstin'] = hasGstin;
      this.rfqThankyouInstance.instance['getWhatsText'] = this.getWhatsText;
      this.rfqThankyouInstance.instance['imagePathAsset'] = CONSTANTS.IMAGE_ASSET_URL;
      this.rfqThankyouInstance.instance['productOutOfStock'] = true;
      this.rfqThankyouInstance.instance['isRFQSuccessfull'] = true;
      (this.rfqThankyouInstance.instance['closeRFQAlert$'] as EventEmitter<boolean>).subscribe(status => {
        this.rfqThankyouInstance.instance['isRFQSuccessfull'] = false;
        this.rfqThankyouInstance = null;
        this.rfqThankyouContainerRef.detach();
      });
    }
  }


  private addToCart(productDetails, buyNow): void {
    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
      if (!result && this._cartService.buyNowSessionDetails) {
        // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
        this._productListService.analyticAddToCart(buyNow ? '/checkout' : '/quickorder', productDetails, this.moduleUsedIn);
        this._localAuthService.setBackURLTitle(this._router.url, "Continue to place order");
        this._router.navigate(['/checkout/login'], {          queryParams: {
            title: 'Continue to place order',
          },
          state: (buyNow ? { buyNow: buyNow } : {})
        });
      } else {
        if (result) {
          this.resetVariantData();
          // analytics call
          this._productListService.analyticAddToCart(buyNow ? '/checkout' : '/quickorder', productDetails, this.moduleUsedIn);
          if (!buyNow) {
            this._cartService.setGenericCartSession(result);
            this.showAddToCartToast();
          } else {
            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
          }
        } else {
          this.showAddToCartToast('Product already added');
        }
      }
    });
    this._commonService.enableNudge = false;
  }

  remove(product) { this.remove$.emit(product)}

  getRandomValue(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      return arr;
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  cardVisisble(htmlElement) {
    if (this.isAd && this._commonService.isBrowser) {

      this.onlineSalesImpressionTrackUsingGTM();
    }
  }

  onlineSalesImpressionTrackUsingGTM() {
    this._analytics.sendGTMCall({
      'event': 'AdImpression',
      'uclids': (this.product.uclid) ? [this.product.uclid] : [],
    })
  }

  onlineSalesClickTrackUsingGTM() {
    this._analytics.sendGTMCall({
      'event': 'AdClick',
      'uclids': (this.product.uclid) ? [this.product.uclid] : [],
    })
  }

  trackProductTitle(title) {
    this.sendTracking(title);
    this.navigateToPDP();
  }

  sendTracking(info) {
    if (this.analytics) {
      if (!this.enableTracking) return;
      const page = this.analytics['page'];
      page['linkName'] = this.section ? `productClick:${info}:${this.section}` : `productClick:${info}`;
      page['productunit'] = this.pIndex;
      const custData = this.analytics['custData'];
      const order = this.analytics['order'];
      this._analytics.sendAdobeCall({ page, custData, order }, "genericClick")
    }
  }

  get getWhatsText() { return `Hi, I want to buy ${this.product['productName']} (${this.product['moglixPartNumber']})`; }

  get isWishlist() { return this.pageName === "Wishlist";}

}
