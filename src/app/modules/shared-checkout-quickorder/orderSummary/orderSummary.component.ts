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
import { CommonService } from '@app/utils/services/common.service';
declare let dataLayer: any;


@Component({
    templateUrl: 'orderSummary.html',
    selector: 'order-summary',
    styleUrls: ['./orderSummary.scss'],
})
export class OrderSummaryComponent {
    shippingCharges: number = 0;
    showPromoOfferPopup: boolean = false;
    @Input('orderSummaryData') orderSummaryData;

    constructor(
        public router: Router,
        private _commonService: CommonService,
    ) {}

    openOfferPopUp() {
        if (this._commonService.userSession.authenticated == "true") {
            this.showPromoOfferPopup = true;
        } else {
            this.router.navigate(["/login"]);
        }
    }
}
