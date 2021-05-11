import { DOCUMENT } from '@angular/common';
import { PageScrollService } from 'ngx-page-scroll-core';
import { Component, Input, EventEmitter, Output, ViewEncapsulation, Inject } from '@angular/core';
import { LocalStorageService } from "ngx-webstorage";
import CONSTANTS from '../../config/constants';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';

@Component({
    selector: 'continue',
    templateUrl: 'continue.html',
    styleUrls: ['./continue.scss'],
    encapsulation: ViewEncapsulation.None

})

export class ContinueComponent {

    @Output() updateTabIndex: EventEmitter<number> = new EventEmitter<number>();
    @Input() tabIndex: number;
    @Input() isContinue: boolean = true;
    @Input() isDisabled: boolean = false;
    totalAmount: number = 0;
    globalConstants: {};
    userLoggedIn: any = false;

    constructor(
        public cartService: CartService,
        public localStorageService: LocalStorageService,
        private _localAuthService: LocalAuthService,
        private _pageScrollService: PageScrollService,
        @Inject(DOCUMENT) private _document) {
    };

    ngOnInit() {
        this.globalConstants = CONSTANTS.GLOBAL;
        let cart = this.cartService.getCartSession();
        let user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            this.userLoggedIn = user;
        }
        this.totalAmount = cart['cart']['totalAmount'] + cart['cart']['shippingCharges'] - cart['cart']['totalOffer'];
        this.cartService.orderSummary.subscribe(data => {

            this.totalAmount = data['cart']['totalAmount'] + data['cart']['shippingCharges'] - data['cart']['totalOffer'];
        });
        this._localAuthService.login$.subscribe(
            () => {
                this.userLoggedIn = this._localAuthService.getUserSession();
            }
        );

        /*Subscribe below event when user log out*/
        this._localAuthService.logout$.subscribe(
            () => {
                this.userLoggedIn = false;//this._localAuthService.getUserSession();
            }
        );

    }

    ngOnChange(changes) {
        ////console.log(changes);
    }

    continueCheckout(tabIndex) {
        this.updateTabIndex.emit(tabIndex);
    }

    scrollPaymentSummary() {
        this._pageScrollService.scroll({
            document: this._document,
            scrollTarget: '#payment_summary'
        });
    }

}
