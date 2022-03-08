import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { AddressService } from '@app/utils/services/address.service';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver, Injector, EventEmitter, Output } from '@angular/core';
import { AddressListActionModel, AddressListModel, CreateEditAddressModel, SelectedAddressModel } from '@app/utils/models/shared-checkout.models';
import { SharedCheckoutAddressUtil } from '../shared-checkout-address-util';

@Component({
    selector: 'all-addresses',
    templateUrl: './all-addresses.component.html',
    styleUrls: ['./../common-checkout.scss']
})
export class AllAddressesComponent implements OnInit, OnDestroy
{
    readonly INVOICE_TYPES = { RETAIL: "retail", TAX: "tax" };
    readonly ADDRESS_TYPES = { DELIVERY: "Delivery", BILLING: "Billing" };
    readonly USER_SESSION = null;

    @Output("emitAddressSelectEvent$") emitAddressSelectEvent$: EventEmitter<any> = new EventEmitter<any>();

    invoiceType: FormControl = null;
    addressListInstance = null;
    createEditAddressInstance = null;
    selectedDeliveryAddress = null
    selectedBillingAddress = null

    deliveryAddressList = [];
    billingAddressList = [];

    @ViewChild("addressListRef", { read: ViewContainerRef })
    addressListRef: ViewContainerRef;

    @ViewChild("createEditAddressRef", { read: ViewContainerRef })
    createEditAddressRef: ViewContainerRef;

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
        this.invoiceType = new FormControl(this.INVOICE_TYPES.RETAIL);
        this.updateAddressTypes(this.USER_SESSION.userId, this.INVOICE_TYPES.TAX);
    }

    updateInvoiceType(isGST)
    {
        this.invoiceType.patchValue(isGST ? this.INVOICE_TYPES.TAX : this.INVOICE_TYPES.RETAIL);
        this.emitAddressEvent(null, null);
    }

    updateAddressTypes(userId, type: string)
    {
        const params = { customerId: userId, invoiceType: type };
        this._addressService.getAddressList(params).subscribe((response: AddressListModel) =>
        {
            this.deliveryAddressList = response.deliveryAddressList;
            this.billingAddressList = response.billingAddressList;
            this.emitAddressEvent(this.deliveryAddressList[0], this.billingAddressList[0]);
        });
    }

    async displayAddressListPopup(addressType: string)
    {
        const { AddressListComponent } = await import("./../address-list/address-list.component").finally(() => { });
        const factory = this.cfr.resolveComponentFactory(AddressListComponent);
        this.addressListInstance = this.addressListRef.createComponent(factory, null, this.injector);
        let ADDRESSES = null;
        let cIdAddress = null;
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            ADDRESSES = this.deliveryAddressList;
            cIdAddress = this.selectedDeliveryAddress['idAddress'];
        } else {
            ADDRESSES = this.billingAddressList;
            cIdAddress = this.selectedBillingAddress['idAddress'];
        }
        this.addressListInstance.instance['addresses'] = ADDRESSES;
        this.addressListInstance.instance['cIdAddress'] = cIdAddress;
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
                this.displayAddressFormPopup(addressType, actionInfo.address);
                return;
            }
            if (actionInfo.action === "SELECTED") {
                this.closeAddressListPopup();
                this.updateDeliveryOrBillingAddress(addressType, actionInfo.address);
                return;
            }
        });
    }

    async displayAddressFormPopup(addressType: string, address?)
    {
        let factory = null;
        let verifiedPhones = null;
        verifiedPhones = this._addressService.getVerifiedPhones(this.deliveryAddressList);
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
        this.createEditAddressInstance = this.addressListRef.createComponent(factory, null, this.injector);
        this.createEditAddressInstance.instance['isAddMode'] = !(address);
        this.createEditAddressInstance.instance['invoiceType'] = this.invoiceType.value;
        this.createEditAddressInstance.instance['verifiedPhones'] = verifiedPhones;
        this.createEditAddressInstance.instance['address'] = address || null;
        this.createEditAddressInstance.instance['displayCreateEditPopup'] = true;
        this.createEditAddressSubscription = (this.createEditAddressInstance.instance["closeAddressPopUp$"] as EventEmitter<any>).subscribe((response: CreateEditAddressModel) =>
        {
            if (response.action) {
                const ADDRESSES = response['addresses'];
                this.updateAddressAfterAction(addressType, ADDRESSES);
            }
            this.createEditAddressInstance.instance['displayCreateEditPopup'] = false;
            this.createEditAddressRef.remove();
        });
    }

    updateDeliveryOrBillingAddress(addressType, address)
    {
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            this.emitAddressEvent(address, null);
            return;
        }
        this.emitAddressEvent(null, address);
    }

    closeAddressListPopup()
    {
        if (!this.addressListInstance) return
        this.addressListInstance.instance['displayAddressListPopup'] = false;
        this.addressListRef.remove();
        this.addressListInstance = null;
    }

    updateAddressAfterAction(addressType, addresses)
    {
        if (!addresses) return
        if (this.addressListInstance) {
            this.addressListInstance.instance['addresses'] = addresses;
        }
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            this.deliveryAddressList = addresses;
            return;
        }
        this.billingAddressList = addresses;
    }

    emitAddressEvent(deliveryAddress, billingAddress)
    {
        const INVOICE_TYPE = this.invoiceType.value;
        this.selectedDeliveryAddress = deliveryAddress ? deliveryAddress : this.selectedDeliveryAddress;
        this.selectedBillingAddress = billingAddress ? billingAddress : this.selectedBillingAddress;
        const DATA: SelectedAddressModel = { invoiceType: INVOICE_TYPE, deliveryAddress: this.selectedDeliveryAddress, billingAddress: this.selectedBillingAddress }
        this.emitAddressSelectEvent$.emit(DATA);
    }

    get displayBillingAddresses() { return this.invoiceType.value === this.INVOICE_TYPES.TAX ? 'block' : 'none'; }

    ngOnDestroy(): void
    {
        if (this.addressListCloseSubscription) this.addressListCloseSubscription.unsubscribe();
        if (this.addressListCloseSubscription) this.addressListCloseSubscription.unsubscribe();
        if (this.createEditAddressSubscription) this.createEditAddressSubscription.unsubscribe();
    }
}
