import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientUtility } from '@app/utils/client.utility';
import { SelectedAddressModel } from '@app/utils/models/shared-checkout.models';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { AddressService } from '@services/address.service';
import { CartService } from '@services/cart.service';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';
import { CheckoutUtil } from '../checkout-util';

@Component({
    selector: 'checkout-address',
    templateUrl: './checkout-address.component.html',
    styleUrls: ['./checkout-address.component.scss']
})
export class CheckoutAddressComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly IMG_PATH: string = environment.IMAGE_ASSET_URL;
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    readonly SECTIONS = { "ADDRESS": "ADDRESS", "CART-UPDATES": "CART-UPDATES", "CART-LIST": "CART-LIST", "OFFERS": "OFFERS", "PAYMENT-SUMMARY": "PAYMENT-SUMMARY", "PAYMENT": "PAYMENT" };

    @Input("addDeliveryorBilling") addDeliveryorBilling: Subject<boolean> = new Subject();

    invoiceType = this.INVOICE_TYPES.RETAIL;
    payableAmount = 0;
    isUserLoggedIn = false;
    canDisplayCTA = false;

    deliveryAddress = null;
    billingAddress = null;
    moveSectionTo = null;

    orderSummarySubscription; Subscription = null;
    loginSubscription: Subscription = null;
    logoutSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _cartService: CartService, private _localAuthService: LocalAuthService,
        private _router: Router) { }

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
        const CART = this._cartService.getCartSession() && this._cartService.getCartSession()['cart'];
        if (CART) {
            const TOTAL_AMOUNT = CART['totalAmount'] || 0;
            const SHIPPPING_CHARGES = CART['shippingCharges'] || 0;
            const TOTAL_OFFER = CART['totalOffer'] || 0;
            this.payableAmount = (TOTAL_AMOUNT + SHIPPPING_CHARGES) - TOTAL_OFFER;
        }
    }

    scrollPaymentSummary()
    {
        if (document.getElementById('payment_summary')) {
            let footerOffset = document.getElementById('payment_summary').offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset - 30);
        }
    }

    continueCheckout()
    {
        if(this.canContinue())
        {
            this._router.navigate(['/checkout/payment']);
        }
    }

    canContinue()
    {
        //TODO:CHECK for atleast one address is selected.
        //Cart validity
        let returnValue = true;
        //address check
        if (!this.deliveryAddress) 
        {
            this.addDeliveryorBilling.next(true);
            returnValue  = false;
        }
        return returnValue;
    }

    handleInvoiceTypeEvent(invoiceType: string)
    {
        this.invoiceType = invoiceType;
    }

    //Address Information
    handleAddressEvent(addressInformation: SelectedAddressModel)
    {
        //TODO:updating index logic
        //TODO:Serviceable & COD available logic.
        this.invoiceType = addressInformation.invoiceType;
        this.deliveryAddress = addressInformation.deliveryAddress;
        this.billingAddress = addressInformation.billingAddress;
        this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress, this.billingAddress);
    }

    verifyDeliveryAndBillingAddress(invoiceType, deliveryAddress, billingAddress)
    {
        const POST_CODE = deliveryAddress && deliveryAddress['postCode'];
        if (!POST_CODE) return;
        if (invoiceType === this.INVOICE_TYPES.TAX && (!billingAddress)) return;
        this.verifyServiceablityAndCashOnDelivery(POST_CODE);
    }

    verifyServiceablityAndCashOnDelivery(postCode)
    {
        const cartSession = this._cartService.getCartSession();
        const cartItems: any[] = cartSession && cartSession['itemsList'];
        if ((!cartItems) || (cartItems.length === 0)) return;
        const MSNS = cartItems.map(item => item.productId);
        this._addressService.getServiceabilityAndCashOnDelivery({ productId: MSNS, toPincode: postCode }).subscribe((response) =>
        {
            if (!response) return;
            const AGGREGATES = CheckoutUtil.formatAggregateValues(response);
            const NON_SERVICEABLE_MSNS: any[] = CheckoutUtil.getNonServiceableMsns(AGGREGATES);
            const NON_CASH_ON_DELIVERABLE_MSNS: any[] = CheckoutUtil.getNonCashOnDeliveryMsns(AGGREGATES);
            this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
            this.updateNonDeliverableItems(cartItems, NON_CASH_ON_DELIVERABLE_MSNS);
        })
    }

    updateNonServiceableItems(cartItems: any[], nonServiceableMsns: any[])
    {
        //TODO:handle in case of all are serviceable
        if (nonServiceableMsns.length) {
            const ITEMS = CheckoutUtil.filterCartItemsByMSNs(cartItems, nonServiceableMsns);
            const NON_SERVICEABLE_ITEMS = CheckoutUtil.formatNonServiceableFromCartItems(ITEMS);
            this._cartService.updateNonServiceableItems(NON_SERVICEABLE_ITEMS);
            return;
        }
        this._cartService.updateNonServiceableItems(null);
    }

    updateNonDeliverableItems(cartItems: any[], nonCashonDeliverableMsns: any[])
    {
        if (nonCashonDeliverableMsns.length) {
            this._cartService.updateNonCashonDeliveryItems(nonCashonDeliverableMsns);
            return;
        }
        this._cartService.updateNonCashonDeliveryItems(null);
    }

    //getters
    get hasCartSession() { return this._cartService.getCartSession() ? true : false; }

    get hasCartItems()
    {
        if (!this.hasCartSession) return false;
        const CART_ITEMS = (this._cartService.getCartSession().itemsList) || [];
        return CART_ITEMS.length > 0;
    }

    ngOnDestroy(): void
    {
        if (this.orderSummarySubscription) this.orderSummarySubscription.unsubscribe()
        if (this.loginSubscription) this.loginSubscription.unsubscribe()
        if (this.logoutSubscription) this.logoutSubscription.unsubscribe()
    }
}
