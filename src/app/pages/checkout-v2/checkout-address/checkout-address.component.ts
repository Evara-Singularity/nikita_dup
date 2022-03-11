import { CartNotificationsModel } from './../../../utils/models/shared-checkout.models';
import { CartService } from '@services/cart.service';
import { AddressService } from '@services/address.service';
import { Component, OnInit } from '@angular/core';
import { SelectedAddressModel } from '@app/utils/models/shared-checkout.models';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CheckoutUtil } from '../checkout-util';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-checkout-address',
    templateUrl: './checkout-address.component.html',
    styleUrls: ['./checkout-address.component.css']
})
export class CheckoutAddressComponent implements OnInit
{
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    readonly SECTIONS = { "ADDRESS": "ADDRESS", "CART-UPDATES": "CART-UPDATES", "CART-LIST": "CART-LIST", "OFFERS": "OFFERS", "PAYMENT-SUMMARY": "PAYMENT-SUMMARY", "PAYMENT": "PAYMENT" };

    invoiceType = this.INVOICE_TYPES.RETAIL;
    deliveryAddress = null;
    billingAddress = null;

    constructor(private _addressService: AddressService, private _cartService: CartService, private _localAuthService: LocalAuthService,) { }

    ngOnInit(): void
    {
        
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
}
