import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, EventEmitter, ComponentFactoryResolver, ViewChild, ViewContainerRef, Injector } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';
import { ProductsEntity } from '@app/utils/models/product.listing.search';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'product-horizontal-card',
  templateUrl: './product-horizontal-card.component.html',
  styleUrls: ['./product-horizontal-card.component.scss']
})
export class ProductHorizontalCardComponent implements OnInit {

  readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
  @Input() product: ProductsEntity;
  productGroupData: null;

  isOutOfStockByQuantity: boolean = false;
  isOutOfStockByPrice: boolean = false;
  // add to cart toast msg
  addToCartToastInstance = null;
  @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;
  // ondemand loaded components for product RFQ
  productRFQInstance = null;
  @ViewChild('productRFQ', { read: ViewContainerRef }) productRFQContainerRef: ViewContainerRef;

  constructor(
    private _cartService: CartService,
    private _http: HttpClient,
    private _loader: GlobalLoaderService,
    private _router: Router,
    private _cfr: ComponentFactoryResolver,
    private _injector: Injector,
  ) {

  }

  ngOnInit(): void {
    this.isOutOfStockByQuantity = !this.product.quantityAvailable;
    this.isOutOfStockByPrice = !this.product.salesPrice && !this.product.mrp
  }

  buyNow(buyNow = false) {
    this._loader.setLoaderState(true);
    this.getProductGroupDetails().pipe(
      map(productRawData => {
        return this.getAddToCartProductRequest(productRawData['productBO'], buyNow);
      })
    ).subscribe(productDetails => {
      this._loader.setLoaderState(false);
      this.addToCart(productDetails, buyNow)
    })
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
    this.getProductGroupDetails().pipe(
      map(productRawData => {
        return this.getRFQProduct(productRawData['productBO'])
      })
    ).subscribe(productDetails => {
      console.log('openRfqForm productDetails', productDetails);
      this.intiateRFQQuote(productDetails).then(res=>{
        this._loader.setLoaderState(false);
      });
    })
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
      // this.analyticRFQ(true);
      // this.isRFQSuccessfull = true;
      this._loader.setLoaderState(false);
    });
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
      adobeTags:'',
    }

  }

  private addToCart(productDetails, buyNow): void {
    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
      if (!result && this._cartService.buyNowSessionDetails) {
        // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
        this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
      } else {
        if (result) {
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

  private getProductGroupDetails(): Observable<any> {
    const productMsnId = this.product['moglixProductNo'] || this.product['moglixPartNumber'];
    const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
    return this._http.get(PRODUCT_URL)
  }

  private getAddToCartProductRequest(productGroupData, buyNow): any {
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

    const product: AddToCartProductSchema = {
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
    };

    return product;
  }


}
