import { Component, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@services/auth.service';
import { CartService } from '@services/cart.service';
import { CommonService } from '@services/common.service';

@Component({
    selector: 'quick-order',
    templateUrl: './quickOrder.html',
    styleUrls: ['./quickOrder.scss'],
    encapsulation: ViewEncapsulation.None
})

export class QuickOrderComponent {

    itemChanges: { status: boolean, message: string } = null;

    constructor(
        private _localAuthService: LocalAuthService,
        public _cartService: CartService,
        public _commonService: CommonService,
        private _tms: ToastMessageService,
        public router: Router) {
            this._cartService.getGenericCartSession;
        }

    navigateToCheckout() {
        if(!this.itemChanges.status){
            this._tms.show({ type: 'error', text: this.itemChanges.message });
            return;
        }
        const invalidIndex = this._cartService.findInvalidItem();
        if (invalidIndex > -1) return;
        this._localAuthService.setBackURLTitle(this.router.url, 'Continue to checkout');
        this.router.navigate(['/checkout/login'], { queryParams: { title: 'Continue to checkout' } });
        this._commonService.updateUserSession();
    }

    handleItemChanges(change: { status: boolean, message:string})
    {
        this.itemChanges = change;
    }

    /**@description triggers the unavailbel item pop-up from notfications */
    viewUnavailableItemsFromNotifacions(types: string[]) { if (types && types.length) this._cartService.viewUnavailableItems(types); }
}