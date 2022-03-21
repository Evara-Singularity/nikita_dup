import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '@app/modules/modal/modal.service';
import { SharedCheckoutUnavailableItemsComponent } from '@app/modules/shared-checkout-unavailable-items/shared-checkout-unavailable-items.component';
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

    @Input("addDeliveryorBilling") addDeliveryorBilling: Subject<boolean> = new Subject();

    invoiceType = this.INVOICE_TYPES.RETAIL;
    payableAmount = 0;
    isUserLoggedIn = false;

    deliveryAddress = null;
    billingAddress = null;
    moveSectionTo = null;
    cartSession = null;

    orderSummarySubscription; Subscription = null;
    loginSubscription: Subscription = null;
    logoutSubscription: Subscription = null;
    cartUpdatesSubscription: Subscription = null;

    constructor(private _addressService: AddressService, public _cartService: CartService, private _localAuthService: LocalAuthService,
        private _router: Router, private _modalService: ModalService) { }

    ngOnInit(): void
    {
        this.updateUserStatus();
    }
    
    ngAfterViewInit(): void
    {
        this.cartUpdatesSubscription = this._cartService.getCartUpdatesChanges().subscribe(cartSession => { 
            this.cartSession = cartSession; 
            this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress, this.billingAddress);
        });
        this.logoutSubscription = this._localAuthService.logout$.subscribe(() => { this.isUserLoggedIn = false; });
        if (!this.isUserLoggedIn) {
            this.loginSubscription = this._localAuthService.login$.subscribe(() => { this.updateUserStatus(); });
        }
    }

    /** @description updates user status and is used to display the continue CTA*/
    updateUserStatus()
    {
        const USER_SESSION = this._localAuthService.getUserSession();
        if (USER_SESSION && USER_SESSION.authenticated == "true") {
            this.isUserLoggedIn = true;
        }
    }

    //Address Information
    handleAddressEvent(addressInformation: SelectedAddressModel)
    {
        this.invoiceType = addressInformation.invoiceType;
        this.deliveryAddress = addressInformation.deliveryAddress;
        this.billingAddress = addressInformation.billingAddress;
        this.verifyDeliveryAndBillingAddress(this.invoiceType, this.deliveryAddress, this.billingAddress);
    }

    /**
     * @description initiates the non-serviceable & non COD items processing
     * @param invoiceType containes retail | tax
     * @param deliveryAddress contains deliverable address
     * @param billingAddress contains billing address and optional for 'retail' case
     */
    verifyDeliveryAndBillingAddress(invoiceType, deliveryAddress, billingAddress)
    {
        this._cartService.shippingAddress = deliveryAddress
        this._cartService.billingAddress = billingAddress;
        this._cartService.invoiceType = invoiceType;
        const POST_CODE = deliveryAddress && deliveryAddress['postCode'];
        if (!POST_CODE) return;
        if (invoiceType === this.INVOICE_TYPES.TAX && (!billingAddress)) return;
        this.verifyServiceablityAndCashOnDelivery(POST_CODE);
    }

    /**
     * @description to extract non-serviceable and COD msns
     * @param postCode deliverable post code
     */
    verifyServiceablityAndCashOnDelivery(postCode)
    {
        const cartItems: any[] = this.cartSession['itemsList'] || [];
        if ((!cartItems) || (cartItems.length === 0)) return;
        const MSNS = cartItems.map(item => item.productId);
        this._addressService.getServiceabilityAndCashOnDelivery({ productId: MSNS, toPincode: postCode }).subscribe((response) =>
        {
            if (!response) return;
            const AGGREGATES = CheckoutUtil.formatAggregateValues(response);
            const NON_SERVICEABLE_MSNS: any[] = CheckoutUtil.getNonServiceableMsns(AGGREGATES);
            const NON_CASH_ON_DELIVERABLE_MSNS: any[] = CheckoutUtil.getNonCashOnDeliveryMsns(AGGREGATES);
            this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
            this.updateNonDeliverableItems(NON_CASH_ON_DELIVERABLE_MSNS);
        })
    }

    /**
     * @description to update the non serviceable items which are used in cart notfications
     * @param contains items is cart
     * @param nonServiceableMsns containes non serviceable msns
     */
    updateNonServiceableItems(cartItems: any[], nonServiceableMsns: any[])
    {
        if (nonServiceableMsns.length) {
            const ITEMS = CheckoutUtil.filterCartItemsByMSNs(cartItems, nonServiceableMsns);
            const NON_SERVICEABLE_ITEMS = CheckoutUtil.formatNonServiceableFromCartItems(ITEMS);
            this.updateValidationMessage(NON_SERVICEABLE_ITEMS);
            return;
        }
        this.updateValidationMessage([]);
    }

    /**@description updates global object to set in COD is available or not and used in payment section */
    updateNonDeliverableItems(nonCashonDeliverableMsns: any[])
    {
        this._cartService.codNotAvailableObj['itemsArray'] = nonCashonDeliverableMsns.length || nonCashonDeliverableMsns;
        this._cartService.cashOnDeliveryStatus.isEnable = nonCashonDeliverableMsns.length > 0;
    }

    /**@description updates global validation messages which are used in cart notifications */
    updateValidationMessage(unServicableItems)
    {
        let itemsValidationMessage = this._cartService.itemsValidationMessage;
        itemsValidationMessage = itemsValidationMessage.filter(item => item['type'] != 'unservicable')
        this._cartService.itemsValidationMessage = [...unServicableItems, ...itemsValidationMessage];
    }

    /**@description scrolls to payment summary section on click of info icon*/
    scrollPaymentSummary()
    {
        if (document.getElementById('payment_summary')) {
            let footerOffset = document.getElementById('payment_summary').offsetTop;
            ClientUtility.scrollToTop(1000, footerOffset - 30);
        }
    }

    /**@description decides whether to procees to payment or not.*/
    continueToPayment()
    {
        //address verification
        if (!this.deliveryAddress) {
            this.addDeliveryorBilling.next(true);
            return;
        }
        if (this.invoiceType === this.INVOICE_TYPES.TAX) {
            if (!this.billingAddress) {
                this.addDeliveryorBilling.next(true);
                return;
            } else if (this.billingAddress['gstinVerified']) {
                this.addDeliveryorBilling.next(true);
                return;
            }
        }
        //cart verification
        const INVALID_CART_TYPES = ['unservicable', 'oos'];
        const CART_MESSAGES = JSON.parse(JSON.stringify(this._cartService.itemsValidationMessage));
        const INVALID_CART_MESSAGES: any[] = CART_MESSAGES.filter(item => INVALID_CART_TYPES.includes(item['type']));
        if (INVALID_CART_MESSAGES.length) {
            this.viewUnavailableItems()
            return;
        }
        this._router.navigate(['/checkout/payment']);
    }

    /**@description display unavailable items in pop-up */
    viewUnavailableItems()
    {
        const itemsList: any[] = this.cartSession['itemsList'];
        const unservicableMsns = JSON.parse(JSON.stringify(this._cartService.itemsValidationMessage))
            .filter(item => item['type'] == 'unservicable').reduce((acc, cv) => { return [...acc, ...[cv['msnid']]] }, []);
        const LIST: any[] = itemsList.filter(item => item['oos'] || unservicableMsns.indexOf(item['productId']) != -1);
        if (LIST.length === 0) return;
        this._modalService.show({
            component: SharedCheckoutUnavailableItemsComponent,
            inputs: { data: { page: 'all', items: LIST, removeUnavailableItems: this.removeUnavailableItems.bind(this) } },
            outputs: {},
            mConfig: { className: 'ex' }
        });
    }

    removeUnavailableItems(items: any[])
    {
        const MSNS = items.map(item => item['productId']);
        this._cartService.removeItemsFromCartByMsns(MSNS);
    }

    /**@description triggers the unavailbel item pop-up from notfications */
    viewUnavailableItemsFromNotifacions(display) { if (display) this.viewUnavailableItems(); }

    handleInvoiceTypeEvent(invoiceType: string) { this.invoiceType = invoiceType; }

    //getters
    get hasCartItems()
    {
        if (!this.cartSession) return false;
        const CART_ITEMS = (this.cartSession['itemsList']) || [];
        return CART_ITEMS.length > 0;
    }

    ngOnDestroy()
    {
        if (this.orderSummarySubscription) this.orderSummarySubscription.unsubscribe();
        if (this.loginSubscription) this.loginSubscription.unsubscribe();
        if (this.logoutSubscription) this.logoutSubscription.unsubscribe();
        if (this.cartUpdatesSubscription) this.cartUpdatesSubscription.unsubscribe();
    }
}
