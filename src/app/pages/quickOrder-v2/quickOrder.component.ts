
import { LocalStorageService } from 'ngx-webstorage';
import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { QuickOrderService } from './quickOrder.service';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CONSTANTS } from '@config/constants';
import { GlobalState } from '../../utils/global.state';
import { LocalAuthService } from '../../utils/services/auth.service';
import { FooterService } from '../../utils/services/footer.service';
import { CartService } from '../../utils/services/cart.service';
import { CommonService } from '../../utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'quick-order',
    templateUrl: './quickOrder.html',
    styleUrls: ['./quickOrder.scss'],
    encapsulation: ViewEncapsulation.None
})

export class QuickOrderComponent {

    // New Variables
    API_RESPONSE: any;

    constructor(
        private _gState: GlobalState,
        private meta: Meta,
        private _activatedRoute: ActivatedRoute,
        private _localAuthService: LocalAuthService,
        private title: Title,
        private localStorageService: LocalStorageService,
        public footerService: FooterService,
        public cartService: CartService,
        private _quickOrderService: QuickOrderService,
        public _commonService: CommonService,
        private _analytics: GlobalAnalyticsService,
        public router: Router) {
    }

    ngOnInit() {
        this.setDataFromResolver();
    }

    setDataFromResolver() {
        this._activatedRoute.data.pipe(
            mergeMap((data: any) => {
                console.clear();
                const cartSession = data.data;
                //  ;
                if (this._commonService.isServer) {
                    return of(null);
                }
                /**
                 * return cartsession, if session id missmatch
                 */
                if (data['statusCode'] !== undefined && data['statusCode'] === 202) {
                    return of(cartSession);
                }
                return this.getShippingValue(cartSession);
            }),
        ) .subscribe(result => {
            this.API_RESPONSE = result;
            this.API_RESPONSE = this.cartService.updateCart(result);
            this.cartService.setCartSession(this.API_RESPONSE);
        });
    }

    getShippingValue(cartSession) {
        let sro = this.cartService.getShippingObj(cartSession);
        return this.cartService.getShippingValue(sro)
            .pipe(
                map((sv: any) => {
                    if (sv && sv['status'] && sv['statusCode'] == 200) {
                        cartSession['cart']['shippingCharges'] = sv['data']['totalShippingAmount'];
                        if (sv['data']['totalShippingAmount'] != undefined && sv['data']['totalShippingAmount'] != null) {
                            let itemsList = cartSession['itemsList'];
                            for (let i = 0; i < itemsList.length; i++) {
                                cartSession['itemsList'][i]['shippingCharges'] = sv['data']['itemShippingAmount'][cartSession['itemsList'][i]['productId']];
                            }
                        }
                    }
                    return cartSession;
                })
            );
    }

    navigateToCheckout() {
        this._localAuthService.setBackURLTitle(null, 'Continue to checkout');
        this.router.navigate(['/checkout'], { queryParams: { title: 'Continue to checkout' } });
    }
}