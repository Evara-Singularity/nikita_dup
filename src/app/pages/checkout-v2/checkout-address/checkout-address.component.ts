import { CartService } from '@services/cart.service';
import { AddressService } from '@services/address.service';
import { Component, OnInit } from '@angular/core';
import { SelectedAddressModel } from '@app/utils/models/shared-checkout.models';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CheckoutUtil } from '../checkout-util';

@Component({
    selector: 'app-checkout-address',
    templateUrl: './checkout-address.component.html',
    styleUrls: ['./checkout-address.component.css']
})
export class CheckoutAddressComponent implements OnInit
{
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    readonly SECTIONS = { "ADDRESS": "ADDRESS", "CART-UPDATES": "CART-UPDATES", "CART-LIST": "CART-LIST", "OFFERS": "OFFERS", "PAYMENT-SUMMARY": "PAYMENT-SUMMARY", "PAYMENT": "PAYMENT" };


    constructor(private _addressService: AddressService, private _cartService: CartService, private _localAuthService: LocalAuthService,) { }

    ngOnInit(): void
    {
    }

    //Address Information
    handleAddressEvents(addressInformation: SelectedAddressModel)
    {
        //TODO:updating index logic
        //TODO:Serviceable & COD available logic.
        const INVOICE_TYPE = addressInformation.invoiceType;
        const DELIVERY_ADDRESS = addressInformation.deliveryAddress;
        const BILLING_ADDRESS = addressInformation.billingAddress;
        this.verifyDeliveryAndBillingAddress(INVOICE_TYPE, DELIVERY_ADDRESS, BILLING_ADDRESS);
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
            if (NON_CASH_ON_DELIVERABLE_MSNS.length) {
                this.updateNonServiceableItems(cartItems, NON_SERVICEABLE_MSNS);
            }
        })
    }

    updateNonServiceableItems(cartItems: any[], nonServiceableMsns: any[])
    {
        //TODO:handle in case of all are serviceable
        if (nonServiceableMsns.length) {
            const ITEMS = CheckoutUtil.filterCartItemsByMSNs(cartItems, nonServiceableMsns);
            const NON_SERVICEABLE_ITEMS = CheckoutUtil.formatNonServiceableFromCartItems(ITEMS);
            console.log(NON_SERVICEABLE_ITEMS);
        }
    }
}
