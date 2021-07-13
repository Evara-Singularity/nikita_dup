import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, EventEmitter, ComponentFactoryResolver, ViewChild, ViewContainerRef, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'product-horizontal-card',
  templateUrl: './product-horizontal-card.component.html',
  styleUrls: ['./product-horizontal-card.component.scss']
})
export class ProductHorizontalCardComponent implements OnInit {

  readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
  @Input() product: ProductsEntity;
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

  constructor(
    private _cartService: CartService,
    private _http: HttpClient,
    private _loader: GlobalLoaderService,
    private _router: Router,
    private _cfr: ComponentFactoryResolver,
    private _injector: Injector,
    private modalService: ModalService,
    private _localAuthService: LocalAuthService,
  ) {

  }

  ngOnInit(): void {
    this.isOutOfStockByQuantity = !this.product.quantityAvailable;
    this.isOutOfStockByPrice = !this.product.salesPrice && !this.product.mrp;
    // randomize product feature
    this.product['keyFeatures'] = this.getRandomValue(this.product['keyFeatures'] || [],2) 
  }

  buyNow(buyNow = false) {
    this._loader.setLoaderState(true);
    const productMsnId = this.product['moglixPartNumber'];
    this.getProductGroupDetails(productMsnId).pipe(
      map(productRawData => {
        // console.log('data ==> ', productRawData);
        if (productRawData['productBO']) {
          return this.getAddToCartProductRequest(productRawData['productBO'], buyNow);
        } else {
          return null;
        }
      })
    ).subscribe((productDetails: AddToCartProductSchema) => {
      if (productDetails) {
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
    this.getProductGroupDetails(data.msn).pipe(
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
        const productRequest = this.getAddToCartProductRequest(productBO, data.buyNow);
        const product = this.productEntityFromProductBO(productBO);
        console.log('changeVariant product ==>', product);
        this.variantPopupInstance.instance['productGroupData'] = productRequest;
        this.variantPopupInstance.instance['product'] = product; 
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
    //console.log('variantAddToCart ==>', data)
    this.addToCart(data.product, data.buyNow)
  }

  navigateToPDP() {
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
      (this.addToCartToastInstance.instance['removed'] as EventEmitter<boolean>).subscribe(status => {
        this.addToCartToastInstance = null;
        this.addToCartToastContainerRef.detach();
      });
    }
  }

  openRfqForm() {
    const user = this._localAuthService.getUserSession();
    const isUserLogin = user && user.authenticated && ((user.authenticated) === 'true') ? true : false;
    if (isUserLogin) {
      const productMsnId = this.product['moglixPartNumber'];
      this.getProductGroupDetails(productMsnId).pipe(
        map(productRawData => {
          return this.getRFQProduct(productRawData['productBO'])
        })
      ).subscribe(productDetails => {
        // console.log('openRfqForm productDetails', productDetails);
        this.intiateRFQQuote(productDetails).then(res => {
          this._loader.setLoaderState(false);
        });
      })
    } else {
      this._router.navigateByUrl('/login');
    }

  }


  async showYTVideo(link) {
    // console.log(link);
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
      (this.variantPopupInstance.instance['selectedVariant$'] as EventEmitter<boolean>).subscribe(data => {
        this.changeVariant(data);
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

  async intiateRFQQuote(product) {
    this._loader.setLoaderState(true);
    const { ProductRFQComponent } = await import('../../components/product-rfq/product-rfq.component');
    const factory = this._cfr.resolveComponentFactory(ProductRFQComponent);
    this.productRFQInstance = this.productRFQContainerRef.createComponent(factory, null, this._injector);
    this.productRFQInstance.instance['isOutOfStock'] = false;
    this.productRFQInstance.instance['isPopup'] = true;
    this.productRFQInstance.instance['product'] = product;
    (this.productRFQInstance.instance['isLoading'] as EventEmitter<boolean>).subscribe(loaderStatus => {
      this._loader.setLoaderState(loaderStatus);
    });
    (this.productRFQInstance.instance['onRFQSuccess'] as EventEmitter<boolean>).subscribe((status) => {
      const headerText = 'Thanks for submitting the query.';
      const subHeaderText = 'Our support member will get in touch with you within 24 hours. For further assistance either Call or Whatsapp @ +91 99996 44044. You can also mail us at salesenquiry@moglix.com.';
      this.loadAlertBox(headerText, subHeaderText, null);
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

  private setOutOfStockFlag(priceQuantityCountry) {
    let productOutOfStock = false
    if (priceQuantityCountry) {
      // incase outOfStockFlag of is avaliable then set its value
      productOutOfStock = priceQuantityCountry['outOfStockFlag'];
      // apart from outOfStockFlag if mrp is exist and is zero set product of OOS
      if (priceQuantityCountry['mrp']) {
        if (parseInt(priceQuantityCountry['mrp']) == 0) {
          productOutOfStock = true;
        }
        if (parseInt(priceQuantityCountry['quantityAvailable']) == 0) {
          productOutOfStock = true;
        }
      } else {
        productOutOfStock = true;
      }
    } else {
      // incase priceQuantityCountry element not present in API
      productOutOfStock = true;
    }
    return productOutOfStock;
  }

  private getRFQProduct(product) {
    const partNumber = product['partNumber'] || product['defaultPartNumber'];
    const isProductPriceValid = product['productPartDetails'][partNumber]['productPriceQuantity'] != null;
    const priceQuantityCountry = (isProductPriceValid) ? Object.assign({}, product['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
    const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
    const productMinimmumQuantity = (priceQuantityCountry && priceQuantityCountry['moq']) ? priceQuantityCountry['moq'] : 1;
    const productBrandDetails = product['brandDetails'];
    const productCategoryDetails = product['categoryDetails'][0];

    return {
      url: product['friendlyUrl'],
      price: productPrice,
      msn: partNumber,
      moq: productMinimmumQuantity,
      brand: productBrandDetails['brandName'],
      taxonomyCode: productCategoryDetails['taxonomy'],
      productName: product['productName'],
      adobeTags: '',
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
          if (!buyNow) {
            this._cartService.setCartSession(result);
            this._cartService.cart.next({ count: result['noOfItems'], currentlyAdded: productDetails });
            this.showAddToCartToast();
          } else {
            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
          }
        } else {
          this.showAddToCartToast('Product already added');
        }
      }
    })
  }

  private getProductGroupDetails(productMsnId): Observable<any> {
    const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
    return this._http.get(PRODUCT_URL)
  }

  productEntityFromProductBO(productBO) {
    // console.log('productEntityFromProductBO ==>', productBO);
    const partNumber = productBO['partNumber'] || productBO['defaultPartNumber'];
    const isProductPriceValid = productBO['productPartDetails'][partNumber]['productPriceQuantity'] != null;
    const productPartDetails = productBO['productPartDetails'][partNumber];
    const priceQuantityCountry = (isProductPriceValid) ? Object.assign({}, productBO['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
    const productMrp = (isProductPriceValid && priceQuantityCountry) ? priceQuantityCountry['mrp'] : null;
    const productTax = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice']) && !isNaN(priceQuantityCountry['sellingPrice'])) ?
      (Number(priceQuantityCountry['sellingPrice']) - Number(priceQuantityCountry['sellingPrice'])) : 0;
    const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
    const priceWithoutTax = (priceQuantityCountry) ? priceQuantityCountry['priceWithoutTax'] : null;
    const productBrandDetails = productBO['brandDetails'];
    const productCategoryDetails = productBO['categoryDetails'][0];

    console.log("productEntityFromProductBO productPartDetails ==>", productPartDetails['images'], productPartDetails['images'][0]);

    const product: ProductsEntity = {
      moglixPartNumber: partNumber,
      moglixProductNo: null,
      mrp: productMrp,
      salesPrice: productPrice,
      priceWithoutTax: priceWithoutTax,
      productName: productBO['productName'],
      variantName: productBO['productName'],
      productUrl: productBO['defaultCanonicalUrl'],
      shortDesc: productBO['shortDesc'],
      brandId: productBrandDetails['idBrand'],
      brandName: productBrandDetails['brandName'],
      quantityAvailable: priceQuantityCountry['quantityAvailable'],
      discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(0),
      rating: this.product.rating,
      categoryCodes: productCategoryDetails['categoryCode'],
      taxonomy: productCategoryDetails['taxonomyCode'],
      mainImageLink: (productPartDetails['images']) ? productPartDetails['images'][0]['links']['default'] : '',
      productTags: [],
      filterableAttributes: {},
      avgRating: this.product.avgRating,
      itemInPack: null,
      ratingCount: this.product.ratingCount,
      reviewCount: this.product.reviewCount
    };
  
    return product;
  }

  private getAddToCartProductRequest(productGroupData, buyNow): AddToCartProductSchema {
    const partNumber = productGroupData['partNumber'] || productGroupData['defaultPartNumber'];
    const isProductPriceValid = productGroupData['productPartDetails'][partNumber]['productPriceQuantity'] != null;
    const priceQuantityCountry = (isProductPriceValid) ? Object.assign({}, productGroupData['productPartDetails'][partNumber]['productPriceQuantity']['india']) : null;
    const productMrp = (isProductPriceValid && priceQuantityCountry) ? priceQuantityCountry['mrp'] : null;
    const productTax = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice']) && !isNaN(priceQuantityCountry['sellingPrice'])) ?
      (Number(priceQuantityCountry['sellingPrice']) - Number(priceQuantityCountry['sellingPrice'])) : 0;
    const productPrice = (priceQuantityCountry && !isNaN(priceQuantityCountry['sellingPrice'])) ? Number(priceQuantityCountry['sellingPrice']) : 0;
    const priceWithoutTax = (priceQuantityCountry) ? priceQuantityCountry['priceWithoutTax'] : null;
    const productBrandDetails = productGroupData['brandDetails'];
    const productCategoryDetails = productGroupData['categoryDetails'][0];

    return {
      cartId: null,
      productId: partNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      amount: Number(productMrp),
      offer: null,
      amountWithOffer: null,
      taxes: productTax,
      amountWithTaxes: null,
      totalPayableAmount: productPrice,
      productName: this.product['productName'],
      brandName: this.product['brandName'],
      priceWithoutTax: priceWithoutTax,
      taxPercentage: priceQuantityCountry['taxRule']['taxPercentage'],
      productImg: this.imageCdnPath + "" + this.product['mainImageLink'],
      isPersistant: true,
      productQuantity: 1,
      productUnitPrice: productPrice,
      expireAt: null,
      productUrl: this.product['productUrl'],
      bulkPriceMap: priceQuantityCountry['bulkPricesIndia'],
      bulkPrice: null,
      bulkPriceWithoutTax: null,
      categoryCode: productCategoryDetails['categoryCode'],
      taxonomyCode: productCategoryDetails['taxonomyCode'],
      buyNow: buyNow,
      filterAttributesList: productGroupData['filterAttributesList'] || null,
      isOutOfStock: this.setOutOfStockFlag(priceQuantityCountry)
    } as AddToCartProductSchema;


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


}
