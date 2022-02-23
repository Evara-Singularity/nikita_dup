
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
        public dataService: DataService,
        public commonService: CommonService,
        public checkOutService: CheckoutService,
        public localStorageService: LocalStorageService,
        public router: Router,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _productService: ProductService,
        private _loaderService: GlobalLoaderService,
        private _tms: ToastMessageService) {}

        ngOnInit() {
            console.log(this.cartData);
        }
}
