import { map } from 'rxjs/operators';
import { AddToCartProductSchema } from '@app/utils/models/cart.initial';

import { DOCUMENT, Location } from '@angular/common';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { ViewChild, Renderer2 } from '@angular/core';
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

    constructor(
        private _location: Location,
        public _state: GlobalState,
        public meta: Meta,
        public pageTitle: Title,
        @Inject(DOCUMENT) private _document,
        private _renderer2: Renderer2,
        public objectToArray: ObjectToArray,
        private _tState: TransferState,
        public footerService: FooterService,
        public activatedRoute: ActivatedRoute,
        private _loader: GlobalLoaderService,
        public dataService: DataService,
        public commonService: CommonService,
        public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService,
        public _router: Router,
        private _localAuthService: LocalAuthService,
        private _toastMessageService: ToastMessageService,
        private _cartService: CartService,
        private _productService: ProductService,
        private _loaderService: GlobalLoaderService) {}

        ngOnInit() {
            console.log(this.cartData);
        }

        // added dummy function to resolve compile time error
        redirectToProductURL(showLink, productUrl){

        }

        updateCartItemQuantity(quantityTarget, index, action, buyNow = false) {
            alert(action);
            if (quantityTarget < 1) return;
            if (action = 'increment') {
                this.cartData.itemsList[index].productQuantity = this.cartData.itemsList[index].productQuantity + 1;
            } else if (action = 'decrement') {
                this.cartData.itemsList[index].productQuantity = this.cartData.itemsList[index].productQuantity - 2;
            } else if (action = 'update'){
                this.cartData.itemsList[index].productQuantity = parseInt(quantityTarget);
            }
            alert(action + ' : ' + this.cartData.itemsList[index].productQuantity);
            return;
            this._loader.setLoaderState(true);
            const productMsnId = this.cartData.itemsList[index].productId;
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
                console.log(productDetails);
                if (productDetails) {
                    if (productDetails['productQuantity'] && (productDetails['quantityAvailable'] < productDetails['productQuantity'])) {
                        this._toastMessageService.show({ type: 'error', text: "Quantity not available" });
                        return;
                    }
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
                                    // this.showAddToCartToast();
                                } else {
                                    this._router.navigateByUrl('/checkout', { state: buyNow ? { buyNow: buyNow } : {} });
                                }
                            } else {
                                // this.showAddToCartToast('Product already added');
                            }
                        }
                    });
                } else {
                    // this.showAddToCartToast('Product does not exist');
                }
                this._loader.setLoaderState(false);
            }, error => {}, () => {
                this._loader.setLoaderState(false);
            });
        }
}
