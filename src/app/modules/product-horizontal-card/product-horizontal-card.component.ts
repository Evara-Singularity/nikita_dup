import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, EventEmitter, ComponentFactoryResolver, ViewChild, ViewContainerRef, Injector } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ProductCardFeature, ProductCardMetaInfo, ProductsEntity } from '@app/utils/models/product.listing.search';
import { EnhanceImgByNetworkPipe } from '@app/utils/pipes/enhanceImgByNetwork.pipe';
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
  selector: 'product-horizontal-card',
  templateUrl: './product-horizontal-card.component.html',
  styleUrls: ['./product-horizontal-card.component.scss'],
  providers: [EnhanceImgByNetworkPipe]
})
export class ProductHorizontalCardComponent implements OnInit {

  readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
  readonly defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
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
    lazyLoadImage: true,
  }
  // currently being used in PDP similar product
  @Input() cardMetaInfo: ProductCardMetaInfo = {
    redirectedSectionName: '',
    redirectedIdentifier: '',
  }
  @Input() isAd: boolean = false;
  @Input() hideAd: boolean = false;
  @Input() isFirstView: boolean = false;
  @Input() pIndex = 0;
  @Input('section') section: string = '';
  @Input() enableTracking = false;
  @Input() analytics = null;
  productGroupData: any = null;

  isOutOfStockByQuantity: boolean = false;
  isOutOfStockByPrice: boolean = false;
  // add to cart toast msg
  addToCartToastInstance = null;
  @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;
  // ondemand loaded components for product RFQ
  productRFQInstance = null;
  @ViewChild('productRFQ', { read: ViewContainerRef }) productRFQContainerRef: ViewContainerRef;
  // ondemad loaded components for green aleart box as success messge
  alertBoxInstance = null;
  @ViewChild('alertBox', { read: ViewContainerRef }) alertBoxContainerRef: ViewContainerRef;
  // ondemand load of youtube video player in modal
  youtubeModalInstance = null;
  // ondemad loaded components for select variant popup
  variantPopupInstance = null;
  @ViewChild('variantPopup', { read: ViewContainerRef }) variantPopupInstanceRef: ViewContainerRef;
  productReviewCount: string;

  constructor(
    private _cartService: CartService,
    private _http: HttpClient,
    public _productListService: ProductListService,
    private _loader: GlobalLoaderService,
    private _router: Router,
    private _cfr: ComponentFactoryResolver,
    private _injector: Injector,
    private modalService: ModalService,
    private _localAuthService: LocalAuthService,
    private _commonService: CommonService,
    private _enhanceImagePipe: EnhanceImgByNetworkPipe,
    private _analytics: GlobalAnalyticsService,
    private _toastMessageService: ToastMessageService,
    private _productService: ProductService,
  ) {
  }

  ngOnInit(): void {
    this.isOutOfStockByQuantity = !this.product.quantityAvailable || this.product.outOfStock;
    this.isOutOfStockByPrice = !this.product.salesPrice && !this.product.mrp;
    // randomize product feature
    this.product['keyFeatures'] = this.getRandomValue(this.product['keyFeatures'] || [], 2)
    this.product['discount'] = Math.floor(+(((this.product.mrp - this.product.priceWithoutTax) / this.product.mrp) * 100));

    this.changeThumbImage(this._commonService.getNetworkSpeed());
    this._commonService.getNetworkSpeedState().subscribe(speed => {
      this.changeThumbImage(speed);
    })
    this.isAd = !this.product.internalProduct
    this.productReviewCount = this.product.ratingCount > 1 ? this.product.ratingCount + ' Reviews' : this.product.ratingCount + ' Review';
  }


  private changeThumbImage(speed: Number) {
    if (!this.isFirstView && speed && (speed > CONSTANTS.NETWORK_SPEED_THRESHOD_LIMIT)) {
      this.product.mainImageThumnailLink = this._enhanceImagePipe.transform(this.product.mainImageThumnailLink);
    }
  }

  buyNow(buyNow = false) {
    this._loader.setLoaderState(true);
    const productMsnId = this.product['moglixPartNumber'];
    this._productService.getProductGroupDetails(productMsnId).pipe(
      map(productRawData => {
        console.log('data ==> ', productRawData);
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
        const product = this._productService.productEntityFromProductBO(productBO, {rating: this.product.rating, ratingCount: this.product.ratingCount, });
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
      let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
      let videoDetails = { url: link, params: ytParams };
      let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
      modalData.inputs = { videoDetails: videoDetails };
      this.modalService.show(modalData);
    }
  }

  async loadVariantPop(product, productGroupData, buyNow = false) {
    if (!this.variantPopupInstance) {
      this._loader.setLoaderState(true);
      const { ProductVariantSelectListingPageComponent } = await import('../../components/product-variant-select-listing-page/product-variant-select-listing-page.component').finally(() => {
        this._loader.setLoaderState(false);
      });
      const factory = this._cfr.resolveComponentFactory(ProductVariantSelectListingPageComponent);
      this.variantPopupInstance = this.variantPopupInstanceRef.createComponent(factory, null, this._injector);
      this.variantPopupInstance.instance['product'] = product;
      this.variantPopupInstance.instance['productGroupData'] = productGroupData;
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
      let navigationExtras: NavigationExtras = { queryParams: { 'backurl': this._router.url } };
      this._router.navigate(['/login'], navigationExtras);
    }
  }

  async intiateRFQQuote(product) {
    this._loader.setLoaderState(true);
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
      const { AlertBoxToastComponent } = await import('../../components/alert-box-toast/alert-box-toast.component').finally(() => {
        this._loader.setLoaderState(false);
      });
      const factory = this._cfr.resolveComponentFactory(AlertBoxToastComponent);
      this.alertBoxInstance = this.alertBoxContainerRef.createComponent(factory, null, this._injector);
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


  private addToCart(productDetails, buyNow): void {
    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
      if (!result && this._cartService.buyNowSessionDetails) {
        // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
        this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
      } else {
        if (result) {
          this.resetVariantData();
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
    if (!this.enableTracking) return;
    const page = this.analytics['page'];
    page['linkName'] = this.section ? `productClick:${info}:${this.section}` : `productClick:${info}`;
    page['productunit'] = this.pIndex;
    const custData = this.analytics['custData'];
    const order = this.analytics['order'];
    this._analytics.sendAdobeCall({ page, custData, order }, "genericClick")
  }

}
