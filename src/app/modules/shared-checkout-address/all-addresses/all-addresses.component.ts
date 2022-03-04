import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { AddressService } from '@app/utils/services/address.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, EventEmitter } from '@angular/core';
import { AddressListActionModel, AddressListModel } from '@app/utils/models/shared-checkout.models';
import { SharedCheckoutAddressUtil } from '../shared-checkout-address-util';

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
    addressListCloseSubscription: Subscription = null;
    addressListActionSubscription: Subscription = null;
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
        this.updateAddressTypes(this.USER_SESSION.userId, this.INVOICE_TYPES.TAX);
    }

    ngAfterViewInit(): void
    {
        this.invoiceSubscription = this.isGSTInvoice.valueChanges.subscribe((isTax) =>
        {
            this.invoiceValue.patchValue(isTax ? this.INVOICE_TYPES.RETAIL : this.INVOICE_TYPES.RETAIL);
        })
    }

    updateAddressTypes(userId, type: string)
    {
        const params = { customerId: userId, invoiceType: type };
        this._addressService.getAddressList(params).subscribe((response: AddressListModel) =>
        {
            this.deliveryAddressList = response.deliveryAddressList;
            this.billingAddressList = response.billingAddressList;
        });
    }

    async displayAddressListPopup(addressType: string)
    {
        const { AddressListComponent } = await import("./../address-list/address-list.component").finally(() => { });
        const factory = this.cfr.resolveComponentFactory(AddressListComponent);
        this.addressListInstance = this.addressListRef.createComponent(factory, null, this.injector);
        const ADDRESSES = (addressType === this.ADDRESS_TYPES.DELIVERY) ? this.deliveryAddressList : this.billingAddressList;
        this.addressListInstance.instance['addresses'] = ADDRESSES;
        this.addressListInstance.instance['addressType'] = addressType;
        this.addressListInstance.instance['displayAddressListPopup'] = true;
        this.addressListCloseSubscription = (this.addressListInstance.instance["emitCloseEvent$"] as EventEmitter<any>).subscribe((actionInfo: AddressListActionModel) =>
        {
            this.closeAddressListPopup();
        });
        this.addressListActionSubscription = (this.addressListInstance.instance["emitActionEvent$"] as EventEmitter<any>).subscribe((actionInfo: AddressListActionModel) =>
        {
            //EXPECTED ACTIONS: ADD or EDIT or SELECTED;
            if (actionInfo.action === "ADD" || actionInfo.action === "EDIT") {
                const ADDRESS_FOR_ACTION = SharedCheckoutAddressUtil.filterAddressesById(ADDRESSES, actionInfo.idAddress);
                this.displayAddressFormPopup(addressType, ADDRESS_FOR_ACTION);
                return;
            }
            if (actionInfo.action === "SELECTED")
            {
                //TODO:update the delivery address as selected
                this.closeAddressListPopup();
                return;
            }
        });
    }

    closeAddressListPopup()
    {
        if (!this.addressListInstance) return
        this.addressListInstance.instance['displayAddressListPopup'] = false;
        this.addressListRef.remove();
        this.addressListInstance = null;
    }

    async displayAddressFormPopup(addressType: string, address?)
    {
        let factory = null;
        let verifiedPhones = null;
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            const { CreateEditDeliveryAddressComponent } = await import("./../create-edit-delivery-address/create-edit-delivery-address.component").finally(() => { });
            factory = this.cfr.resolveComponentFactory(CreateEditDeliveryAddressComponent);
            verifiedPhones = this._addressService.getVerifiedPhones(this.deliveryAddressList);
        }
        else {
            const { CreateEditBillingAddressComponent } = await import("./../create-edit-billing-address/create-edit-billing-address.component").finally(() => { });
            factory = this.cfr.resolveComponentFactory(CreateEditBillingAddressComponent);
            verifiedPhones = this._addressService.getVerifiedPhones(this.billingAddressList);
        }
        this.addressListInstance = this.addressListRef.createComponent(factory, null, this.injector);
        this.addressListInstance.instance['isAddMode'] = !(address);
        this.addressListInstance.instance['invoiceType'] = this.isGSTInvoice ? "tax" : "retail";
        this.addressListInstance.instance['verifiedPhones'] = verifiedPhones;
        this.addressListInstance.instance['address'] = address || null;
        this.addressListInstance.instance['displayCreateEditPopup'] = true;
        this.createEditAddressSubscription = (this.addressListInstance.instance["closeAddressPopUp$"] as EventEmitter<any>).subscribe((data) =>
        {
            this.addressListInstance.instance['displayCreateEditPopup'] = false;
            this.addressListRef.remove();
            //TODO:update the addresses based on addresstype
            if (this.addressListInstance)
            {
                //TODO:update list of addresses in address list pop-up
            }
        });
    }


    get displayBillingAddresses() { return this.isGSTInvoice.value ? 'block' : 'none'; }

    ngOnDestroy(): void
    {
        this.invoiceSubscription.unsubscribe();
        if (this.addressListCloseSubscription) this.addressListCloseSubscription.unsubscribe();
        if (this.addressListCloseSubscription) this.addressListCloseSubscription.unsubscribe();
        if (this.createEditAddressSubscription) this.createEditAddressSubscription.unsubscribe();
    }
}
