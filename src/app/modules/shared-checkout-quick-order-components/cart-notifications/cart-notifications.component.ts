import { UnAvailableItemsComponent } from './unAvailableItems/unAvailableItems.component';
import { ModalService } from '@app/modules/modal/modal.service';
import { GlobalState } from '@utils/global.state';
import { CommonService } from '@app/utils/services/common.service';
import { Component } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';

@Component({
    selector: 'cart-notifications',
    templateUrl: 'cart-notifications.html',
    styleUrls: ['./cart-notifications.scss'],
})

export class CartNotificationsComponent
{
    constructor(
        public _cartService: CartService,
        private _commonService: CommonService,
        private _modalService: ModalService,
        public _state: GlobalState,
    ) { }

    ngOnInit()
    {
    }

    viewUnavailableItems()
    {
        const cartSession = JSON.parse(JSON.stringify(this._cartService.getGenericCartSession));
        const unServiceableMSNs = JSON.parse(JSON.stringify(this._commonService.itemsValidationMessage))
            .filter(item => item['type'] == 'unservicable')
            .reduce((acc, cv) =>
            {
                return [...acc, ...[cv['msnid']]]
            }, []);
        let itemsList = cartSession.itemsList.filter(item => item['oos'] || unServiceableMSNs.indexOf(item['productId']) != -1);
        this._modalService.show({
            component: UnAvailableItemsComponent,
            inputs: { data: { page: 'all', items: itemsList, removeUnavailableItems: this.removeUnavailableItems.bind(this) } },
            outputs: {},
            mConfig: { className: 'ex' }
        });
    }

    removeUnavailableItems(items)
    {
        this._state.notifyDataChanged('cart.rui', items);
    }
}
