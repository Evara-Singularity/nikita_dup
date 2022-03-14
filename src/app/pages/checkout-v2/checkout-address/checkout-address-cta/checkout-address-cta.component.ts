import { Subscription } from 'rxjs';
import { LocalAuthService } from './../../../../utils/services/auth.service';
import { Component, EventEmitter, OnInit, Output, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { ClientUtility } from '@app/utils/client.utility';
import { environment } from 'environments/environment';
import { CartService } from '@app/utils/services/cart.service';

@Component({
    selector: 'checkout-address-cta',
    templateUrl: './checkout-address-cta.component.html',
    styleUrls: ['./checkout-address-cta.component.scss']
})
export class CheckoutAddressCtaComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly IMG_PATH: string = environment.IMAGE_ASSET_URL;

    @Input("canDisplayCTA") canDisplayCTA = false;
    @Input("moveSectionTo") moveSectionTo = null;
    @Output() updateSection$: EventEmitter<string> = new EventEmitter<string>();

    payableAmount = 0;
    isUserLoggedIn = false;

    orderSummarySubscription; Subscription = null;
    loginSubscription: Subscription = null;
    logoutSubscription: Subscription = null;

    constructor(private _localAuthService: LocalAuthService, public _cartService: CartService) { }


    ngOnInit(): void
    {
        this.updateUserStatus();
        this.updatePayableAmount();
    }

    ngAfterViewInit(): void
    {
        this.orderSummarySubscription = this._cartService.orderSummary.subscribe((data) => { this.updatePayableAmount() });
        this.logoutSubscription = this._localAuthService.logout$.subscribe(() => { this.isUserLoggedIn = false; });
        if (!this.isUserLoggedIn) {
            this.loginSubscription = this._localAuthService.login$.subscribe(() => { this.updateUserStatus(); });
        }
    }

    updateUserStatus()
    {
        const USER_SESSION = this._localAuthService.getUserSession();
        if (USER_SESSION && USER_SESSION.authenticated == "true") {
            this.isUserLoggedIn = true;
        }
    }

    updatePayableAmount()
    {
        const CART = this._cartService.getGenericCartSession && this._cartService.getGenericCartSession['cart'];
        if (CART) {
            const TOTAL_AMOUNT = CART['totalAmount'] || 0;
            const SHIPPPING_CHARGES = CART['shippingCharges'] || 0;
            const TOTAL_OFFER = CART['totalOffer'] || 0;
            this.payableAmount = (TOTAL_AMOUNT + SHIPPPING_CHARGES) - TOTAL_OFFER;
        }

    }

    continueCheckout()
    {
        this.updateSection$.emit(this.moveSectionTo);
    }

    scrollPaymentSummary()
    {
        if (document.getElementById('payment_summary')) {
            let footerOffset = document.getElementById('payment_summary').offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset - 30);
        }
    }

    ngOnDestroy(): void
    {
        if (this.orderSummarySubscription) this.orderSummarySubscription.unsubscribe()
        if (this.loginSubscription) this.loginSubscription.unsubscribe()
        if (this.logoutSubscription) this.logoutSubscription.unsubscribe()
    }

}
