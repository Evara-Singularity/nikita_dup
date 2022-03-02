import { map } from 'rxjs/operators';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';

import { DOCUMENT, Location } from '@angular/common';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ViewChild, Renderer2, ViewContainerRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Component, EventEmitter, Output, Input, ViewEncapsulation, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { HttpErrorResponse } from '@angular/common/http';

import CONSTANTS from '@config/constants';
import { SiemaCarouselComponent } from '@modules/siemaCarousel/siemaCarousel.component';
import { ToastMessageService } from '@modules/toastMessage/toast-message.service';
import { ProductService } from '@utils/services/product.service';
import { CartService } from '@utils/services/cart.service';
import { LocalAuthService } from '@utils/services/auth.service';
import { CheckoutService } from '@utils/services/checkout.service';
import { CommonService } from '@utils/services/common.service';
import { DataService } from '@utils/services/data.service';
import { ObjectToArray } from '@utils/pipes/object-to-array.pipe';
import { FooterService } from '@utils/services/footer.service';
import { GlobalState } from '@utils/global.state';
import { ENDPOINTS } from '@config/endpoints';
import { GlobalLoaderService } from '@utils/services/global-loader.service';

@Component({
    selector: 'cart',
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss'],
})

export class CartComponent {
    @Input('cartData') cartData;
    addToCartToastInstance = null;
    @ViewChild('addToCartToast', { read: ViewContainerRef }) addToCartToastContainerRef: ViewContainerRef;

    constructor(
        private _location: Location,
        public _state: GlobalState,
        public meta: Meta,
        public pageTitle: Title,
        @Inject(DOCUMENT) private _document,
        private _renderer2: Renderer2,
        private _injector: Injector,
        public objectToArray: ObjectToArray,
        private _tState: TransferState,
        public footerService: FooterService,
        private _cfr: ComponentFactoryResolver,
        public activatedRoute: ActivatedRoute,
        private _loader: GlobalLoaderService,
        public dataService: DataService,
        public commonService: CommonService,
        public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService,
        public _router: Router,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _tms: ToastMessageService,
        private _productService: ProductService,
        private _loaderService: GlobalLoaderService
    ) {}

    ngOnInit() {
        console.log(this.cartData);
    }

    redirectToProductURL(url) {
        this.commonService.setSectionClickInformation('cart', 'pdp');
        this._router.navigateByUrl('/' + url);
        return false;
    }

    updateCartItemQuantity(quantityTarget, index, action, buyNow = false) {
        if (quantityTarget < 1) return;

        let updatedCartItemCount = this.cartData.itemsList[index].productQuantity;
        let incrementOrDecrementBy = 0;
        
        if (action === 'increment') {
            incrementOrDecrementBy = 1;
            updatedCartItemCount = this.cartData.itemsList[index].productQuantity + 1;
        } else if (action === 'decrement') {
            if (quantityTarget < 2) return;
            incrementOrDecrementBy = -1;
            updatedCartItemCount = this.cartData.itemsList[index].productQuantity - 1;
        }
        this._loader.setLoaderState(true);
        const productMsnId = this.cartData.itemsList[index].productId;
        this._productService.getProductGroupDetails(productMsnId).pipe(
            map(productRawData => {
                if (productRawData['productBO']) {
                    let productData = this._cartService.getAddToCartProductItemRequest({ productGroupData: productRawData['productBO'], buyNow });
                    if (action === 'update'){
                        updatedCartItemCount = +quantityTarget;
                        productData.isProductUpdate = quantityTarget;
                    }
                    return productData;
                } else {
                    return null;
                }
            })).subscribe((productDetails: AddToCartProductSchema) => {
                if (productDetails) {
                    if (productDetails['productQuantity'] && (productDetails['quantityAvailable'] < productDetails['productQuantity'])) {
                        this._tms.show({ type: 'error', text: "Quantity not available" });
                        return;
                    }
                    productDetails.productQuantity = incrementOrDecrementBy; 
                    this._cartService.addToCart({ buyNow, productDetails }).subscribe(result => {
                        if (!result && this._cartService.buyNowSessionDetails) {
                            this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                        } else {
                            if (result) {
                                if (!buyNow) {
                                    this._cartService.setCartSession(result);
                                    this._cartService.cart.next({
                                        count: result['noOfItems'] || (result['itemsList'] ? result['itemsList'].length : 0),
                                        currentlyAdded: productDetails
                                    });
                                    this.cartData.itemsList[index].productQuantity = updatedCartItemCount;
                                    this.cartData.itemsList[index]['message'] = "Cart quantity updated successfully";
                                    this._tms.show({ type: 'success', text: this.cartData.itemsList[index]['message'] });
                                } else {
                                    this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                                }
                            } else {
                                this._tms.show(('Product already added'));
                            }
                        }
                    });
                } else {
                    this._tms.show('Product does not exist');
                }
                this._loader.setLoaderState(false);
            }, error => {}, () => {
                this._loader.setLoaderState(false);
            });
        }

}
