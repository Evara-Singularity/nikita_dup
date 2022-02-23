import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { AddressService } from '@app/utils/services/address.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, EventEmitter } from '@angular/core';
import { AddressListModal } from '@app/utils/models/shared-checkout.modals';

@Component({
    selector: 'all-addresses',
    templateUrl: './all-addresses.component.html',
    styleUrls: ['./../common-checkout.scss']
})
export class AllAddressesComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    readonly ADDRESS_TYPES = { DELIVERY: "Delivery", BILLING: "Billing" };
    readonly USER_SESSION = null;

    invoiceValue: FormControl = null;
    isGSTInvoice: FormControl = null;
    addressListInstance = null;
    createEditAddressInstance = null;

    deliveryAddressList = [];
    billingAddressList = [];

    @ViewChild("addressListRef", { read: ViewContainerRef })
    addressListRef: ViewContainerRef;

    @ViewChild("createEditAddressRef", { read: ViewContainerRef })
    createEditAddressRef: ViewContainerRef;


    invoiceSubscription: Subscription = null;
    addressListSubscription: Subscription = null;
    createEditAddressSubscription: Subscription = null;



    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService, private cfr: ComponentFactoryResolver,
        private injector: Injector) 
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
            this.deliveryAddressList = response.deliveryAddressList;
            this.billingAddressList = response.billingAddressList;
        });
    }

    async displayAddressListPopup($event, addressType: string)
    {
        $event.stopPropagation();
        const { AddressListComponent } = await import("./../address-list/address-list.component").finally(() => { });
        const factory = this.cfr.resolveComponentFactory(AddressListComponent);
        this.addressListInstance = this.addressListRef.createComponent(factory, null, this.injector);
        this.addressListInstance.instance['addresses'] = (addressType === this.ADDRESS_TYPES.DELIVERY) ? this.deliveryAddressList : this.billingAddressList;
        this.addressListInstance.instance['addressType'] = addressType;
        this.addressListInstance.instance['displayAddressListPopup'] = true;
        this.addressListSubscription = (this.addressListInstance.instance["closeAddressPopUp$"] as EventEmitter<any>).subscribe((data) =>
        {
            console.log('Address List',data);
            this.addressListInstance.instance['displayAddressListPopup'] = false;
            this.addressListRef.remove();
        });
    }

    async displayAddressFormPopup($event, addressType: string, idAddress?: number)
    {
        $event.stopPropagation();
        let factory = null;
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            const { CreateEditDeliveryAddressComponent } = await import("./../create-edit-delivery-address/create-edit-delivery-address.component").finally(() => { });
            factory = this.cfr.resolveComponentFactory(CreateEditDeliveryAddressComponent);
        }
        else {
            const { CreateEditBillingAddressComponent } = await import("./../create-edit-billing-address/create-edit-billing-address.component").finally(() => { });
            factory = this.cfr.resolveComponentFactory(CreateEditBillingAddressComponent);
        }
        this.addressListInstance = this.addressListRef.createComponent(factory, null, this.injector);
        this.addressListInstance.instance['addressType'] = addressType;
        this.addressListInstance.instance['isAddMode'] = !(idAddress);
        this.addressListInstance.instance['address'] = null ;
        this.addressListInstance.instance['displayCreateEditPopup'] = true;
        this.createEditAddressSubscription = (this.addressListInstance.instance["closeAddressPopUp$"] as EventEmitter<any>).subscribe((data) =>
        {
            console.log('Create Edit', data);
            this.addressListInstance.instance['displayCreateEditPopup'] = false;
            this.addressListRef.remove();
        });
    }

    get displayBillingAddresses() { return this.isGSTInvoice.value ? 'block' : 'none'; }

    ngOnDestroy(): void
    {
        this.invoiceSubscription.unsubscribe();
        if (this.addressListSubscription) this.addressListSubscription.unsubscribe();
        if (this.createEditAddressSubscription) this.createEditAddressSubscription.unsubscribe();
    }

    consoleValues()
    {
        console.log(this.isGSTInvoice.value);
        console.log(this.invoiceValue.value);
    }
}
