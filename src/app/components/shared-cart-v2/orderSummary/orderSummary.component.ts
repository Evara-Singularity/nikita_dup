import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { OrderSummaryService } from './orderSummary.service';
import { Subject } from 'rxjs';
import { ToastMessageService } from '@modules/toastMessage/toast-message.service';
import { NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '@utils/services/data.service';
import { CartService } from '@utils/services/cart.service';
import { GlobalLoaderService } from '@utils/services/global-loader.service';
import { mergeMap } from 'rxjs/operators';
import { LocalAuthService } from '@app/utils/services/auth.service';
declare let dataLayer: any;


@Component({
    templateUrl: 'orderSummary.html',
    selector: 'order-summary',
    styleUrls: ['./orderSummary.scss'],
})
export class OrderSummaryComponent {

    constructor(
        public router: Router,
        public _dataService: DataService,
        public orderSummaryService: OrderSummaryService,
        public _cartService: CartService,
        private _tms: ToastMessageService,
        private localStorageService: LocalStorageService,
        private _localAuthService: LocalAuthService,
        private loaderService: GlobalLoaderService) {
    }

    @Input('orderSummaryData') orderSummaryData;

    ngOnInit() {
        console.log(this.orderSummaryData);    
    }
}
