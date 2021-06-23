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
  addToCartToastInstance = null;
  @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;

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
    const productMsnId = this.product['moglixProductNo'] || this.product['moglixPartNumber'];
    const PRODUCT_URL = environment.BASE_URL + ENDPOINTS.PRODUCT_INFO + `?productId=${productMsnId}&fetchGroup=true`;
    this._loader.setLoaderState(true);
    this._http.get(PRODUCT_URL).subscribe(productGroupData => {
      this._loader.setLoaderState(false);
      this.addToCart(productGroupData['productBO'], buyNow);
    })
  }

  private addToCart(productGroupData, buyNow) {

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
    this._cartService.addToCart({
      productDetails: product,
      redirectUrl: '/checkout',
      quantity: 1,
      buyNow: buyNow
    }).subscribe(result => {
      if (!result && this._cartService.buyNowSessionDetails) {
        // case: if user is not logged in then buyNowSessionDetails holds temp cartsession request and used after user logged in to called updatecart api
        this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
      } else {
        if (result) {
          if(!buyNow){
            this._cartService.setCartSession(result);
            this._cartService.cart.next({ count: result['noOfItems'], currentlyAdded: product });
            this.showAddToCartToast();
          }else{
            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
          }
        }else{
          this.showAddToCartToast('Product already added');
        }
      }
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


  clearCartSession() {
    this._cartService.setCartSession(null);
  }

}
