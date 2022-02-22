import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { AddressService } from '@app/utils/services/address.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AddressListModal } from '@app/utils/models/shared-checkout.modals';

@Component({
    selector: 'all-addresses',
    templateUrl: './all-addresses.component.html',
    styleUrls: ['./all-addresses.component.scss']
})
export class AllAddressesComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    readonly USER_SESSION = null;

    invoiceValue: FormControl = null;
    isGSTInvoice: FormControl = null;
    invoiceSubscription: Subscription = null;


    shippingAddressList = [];
    billingAddressList = [];

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService) 
    {
        this.USER_SESSION = this._localAuthService.getUserSession();
    }

    ngOnInit()
    {
        this.isGSTInvoice = new FormControl(false);
        this.invoiceValue = new FormControl(this.INVOICE_TYPES.RETAIL);
        this.updateAddressType(this.USER_SESSION.userId, this.INVOICE_TYPES.TAX);
    }

    ngAfterViewInit(): void
    {
        this.invoiceSubscription = this.isGSTInvoice.valueChanges.subscribe((isTax) =>
        {
            this.invoiceValue.patchValue(isTax ? this.INVOICE_TYPES.RETAIL : this.INVOICE_TYPES.RETAIL);
            this.consoleValues();
        })
    }

    updateAddressType(userId, type: string)
    {
        const params = { customerId: userId, invoiceType: type };
        this._addressService.getAddressList(params).subscribe((response: AddressListModal) =>
        {
            this.shippingAddressList = response.shippingAddressList;
            this.billingAddressList = response.billingAddressList;
        });
    }

    displayAddress(address)
    {
        const a = [];
        if (address.addressLine !== undefined) {
            a.push(address.addressLine);
        }
        if (address.city !== undefined) {
            a.push(address.city);
        }
        if (address.state !== undefined && address.state.name !== undefined) {
            a.push(address.state.name);
        }
        if (address.country !== undefined && address.country.name !== undefined) {
            a.push(address.country.name);
        }
        return a.join(', ') + ' - ' + address.postCode;
    }

    getAddressessCount(addressList, type)
    {
        return addressList.filter(a => a['addressType']['idAddressType'] === type).length;
    }

    get displayBillingAddresses() { return this.isGSTInvoice.value ? 'block' : 'none'; }

    ngOnDestroy(): void
    {
        this.invoiceSubscription.unsubscribe();
    }

    consoleValues()
    {
        console.log(this.isGSTInvoice.value);
        console.log(this.invoiceValue.value);
    }
}
