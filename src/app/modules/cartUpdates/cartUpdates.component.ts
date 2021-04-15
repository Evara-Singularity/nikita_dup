import { ViewEncapsulation } from '@angular/core';
/**
 * Created by kuldeep on 09/05/17.
 */
import { Component, Input, EventEmitter, Output, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { GlobalState } from 'src/app/utils/global.state';
import { ModalService } from '../modal/modal.service';
import { CartService } from 'src/app/utils/services/cart.service';
import { CommonService } from 'src/app/utils/services/common.service';
import { UnAvailableItemsComponent } from '../unAvailableItems/unAvailableItems.component';

@Component({
    selector: 'cart-updates',
    templateUrl: 'cartUpdates.html',
    styleUrls: ['./cartUpdates.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CartUpdatesComponent {

    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    // @Input() data: any;
    @Input() user: {};
    globalConstants: {};
    @Input() itemsValidationMessage: Array<{}>;
    isServer: boolean;
    isBrowser: boolean;
    private cDistroyed = new Subject();
    itemsList: [] = [];
    constructor(        
        @Inject(PLATFORM_ID) platformId,
        private _commonService: CommonService,
        private _cartService: CartService,
        private _modalService: ModalService,
        public _state: GlobalState,
    ) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.itemsValidationMessage = [];
    };

    ngOnInit() {
        //debugger;
    }

    ngAfterViewInit() {

    }

    viewUnavailableItems() {
        debugger;
        const cartSession = JSON.parse(JSON.stringify(this._cartService.getCartSession()));
        let itemsList = cartSession['itemsList']; 
        const unservicableMsns = JSON.parse(JSON.stringify(this._commonService.itemsValidationMessage))
        .filter(item=>item['type'] == 'unservicable')
        .reduce((acc, cv)=>{
            return [...acc, ...[cv['msnid']]]
        }, []);
        // const unservicableMsns = this.unServicableItems.map((item) => item['msnid']);
        // const unservicableMsns = this.unServicableItems.map((item) => item['msnid']);
        itemsList = itemsList.filter(item => item['oos'] || unservicableMsns.indexOf(item['productId']) != -1);
        this._modalService.show({
            component: UnAvailableItemsComponent,
            inputs: { data: { page: 'all', items: itemsList, removeUnavailableItems: this.removeUnavailableItems.bind(this) } },
            outputs: {},
            mConfig:{className:'ex'}
        });
    }

    removeUnavailableItems(items){
        this._state.notifyDataChanged('cart.rui', items);
    }
    
    ngOnDestroy() {
        this.cDistroyed.next();
        this.cDistroyed.unsubscribe();
    }
}
