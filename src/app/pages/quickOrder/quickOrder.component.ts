import { Component, ViewEncapsulation, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalAuthService } from '@services/auth.service';
import { CartService } from '@services/cart.service';
import { CommonService } from '@services/common.service';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'quick-order',
    templateUrl: './quickOrder.html',
    styleUrls: ['./quickOrder.scss'],
    encapsulation: ViewEncapsulation.None
})

export class QuickOrderComponent implements OnInit, AfterViewInit, OnDestroy {

    isCartNoItems: boolean = false;
    cartSubscription: Subscription;

    constructor(
        private _localAuthService: LocalAuthService,
        public _cartService: CartService,
        public _commonService: CommonService,
        private _loaderService: GlobalLoaderService,
        public router: Router) {
        this._cartService.getGenericCartSession;
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this._loaderService.setLoaderState(false);
        this.cartSubscription = this._cartService.getCartUpdatesChanges().pipe(
            delay(800)
        )
            .subscribe((cartSession) => {
                console.log('cartSession ==>', cartSession)
                if ((cartSession && cartSession.itemsList && cartSession.itemsList.length === 0)) {
                    this.isCartNoItems = true;
                }else{
                    this.isCartNoItems = false;
                }
            });
    }

    ngOnDestroy() {
        if (this.cartSubscription) this.cartSubscription.unsubscribe();
    }

    navigateToCheckout() {
        const invalidIndex = this._cartService.findInvalidItem();
        if (invalidIndex > -1) return;
        this._localAuthService.setBackURLTitle(this.router.url, 'Continue to checkout');
        this.router.navigate(['/checkout/login'], { queryParams: { title: 'Continue to checkout' } });
        this._commonService.updateUserSession();
    }

    /**@description triggers the unavailbel item pop-up from notfications */
    viewUnavailableItemsFromNotifacions(types: string[]) { if (types && types.length) this._cartService.viewUnavailableItems(types); }
}