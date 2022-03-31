/**
 * This is cemtralised component in which shipping & billing address can be viewed, added & edited.
 * AddressListComponent: to display all the address list for selection as pop-up
 * CreateEditDeliveryComponent/CreateEditDeliveryComponent: to handle add or edit of shipping or billing details as pop-up
 */

import { AfterViewInit } from '@angular/core';
import { Component, ComponentFactoryResolver, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AddressListActionModel, AddressListModel, CountryListModel, CreateEditAddressModel, SelectedAddressModel } from '@app/utils/models/shared-checkout.models';
import { AddressService } from '@app/utils/services/address.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { Subject, Subscription } from 'rxjs';
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

    //trigger to display pop-up for delivery or billing address.
    @Input("addDeliveryOrBilling") addDeliveryOrBilling: Subject<string> = null;
    //emits invoicetype, selected delivery & billing address which is to used for checkout
    @Output("emitAddressSelectEvent$") emitAddressSelectEvent$: EventEmitter<SelectedAddressModel> = new EventEmitter<SelectedAddressModel>();
    @Output("emitInvoiceTypeEvent$") emitInvoiceTypeEvent$: EventEmitter<string> = new EventEmitter<string>();

    invoiceType: FormControl = null;
    addressListInstance = null;
    createEditAddressInstance = null;
    selectedDeliveryAddress = null
    selectedBillingAddress = null

    deliveryAddressList = [];
    billingAddressList = [];
    countryList = [];

    @ViewChild("addressListRef", { read: ViewContainerRef })
    addressListRef: ViewContainerRef;

    @ViewChild("createEditAddressRef", { read: ViewContainerRef })
    createEditAddressRef: ViewContainerRef;

    addressListCloseSubscription: Subscription = null;
    addressListActionSubscription: Subscription = null;
    createEditAddressSubscription: Subscription = null;
    triggerDeliveryOrBillingSubscription: Subscription = null;

    constructor(private _addressService: AddressService, private _localAuthService: LocalAuthService, private cfr: ComponentFactoryResolver,
        private injector: Injector, private _cartService:CartService) 
    {
        this.USER_SESSION = this._localAuthService.getUserSession();
    }

    ngOnInit()
    {
        this.fetchCountryList();
        const INVOICE_TYPE = this._cartService.invoiceType ? this._cartService.invoiceType : this.INVOICE_TYPES.RETAIL;
        this.invoiceType = new FormControl(INVOICE_TYPE);
        this.updateAddressTypes(this.USER_SESSION.userId, INVOICE_TYPE);
    }

    ngAfterViewInit(): void
    {
        if (this.addDeliveryOrBilling) {
            this.triggerDeliveryOrBillingSubscription = this.addDeliveryOrBilling.subscribe((addressType: string) =>
            {
                if (!addressType) return;
                this.displayAddressFormPopup(addressType, null);
            })
        }
    }

    /**@description to fetch country list which is used in future */
    fetchCountryList()
    {
        this._addressService.getCountryList().subscribe((countryList: CountryListModel[]) =>
        {
            this.countryList = countryList;
        })
    }

    /**
     * @description:to trace invoicetype as 'tax' or 'retail'
     * @param isGST: comes from template by event binding 
     */
    updateInvoiceType(isGST: boolean)
    {
        this.invoiceType.patchValue(isGST ? this.INVOICE_TYPES.TAX : this.INVOICE_TYPES.RETAIL);
        this.emitInvoiceTypeEvent$.emit(this.invoiceType.value);
        this.updateAddressTypes(this.USER_SESSION.userId, this.invoiceType.value);
    }

    /**
     * @description:to fetch delivery & billing address list
     * @param userId : comes local storage
     * @param type: TODO:can be removed after discussion with Pritam
     */
    updateAddressTypes(userId: number, type: string)
    {
        const params = { customerId: userId, invoiceType: type };
        this._addressService.getAddressList(params).subscribe((response: AddressListModel) =>
        {
            this.deliveryAddressList = response.deliveryAddressList;
            this.billingAddressList = response.billingAddressList;
            const DELIVERY_ADDRESS = this._cartService.shippingAddress ? this._cartService.shippingAddress : this.deliveryAddressList[0];
            const BILLING_ADDRESS = this._cartService.billingAddress ? this._cartService.billingAddress : this.billingAddressList[0];
            this.emitAddressEvent(DELIVERY_ADDRESS, BILLING_ADDRESS);
        });
    }

    /**
     * @description:displays list of delivery or billing addreses depending on 'addressType'
     * @param addressType :Delivery or Billing
     */
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
            //Expected Actions from Address List component are : ADD or EDIT or SELECTED;
            //Below code is to handle "Add or Edit".
            if (actionInfo.action === "ADD" || actionInfo.action === "EDIT") {
                this.displayAddressFormPopup(addressType, actionInfo.address);
                return;
            }
            //Below code is to handle "Deliver Here".
            if (actionInfo.action === "SELECTED") {
                this.closeAddressListPopup();
                this.updateDeliveryOrBillingAddress(addressType, actionInfo.address);
                return;
            }
        });
    }

    /**
     * @description: to add or edit existing delivery or billing address
     * @param addressType: Delivery or Billing
     * @param address: can be delivery or billing address or 'null' in case of addition
     */
    async displayAddressFormPopup(addressType: string, address)
    {
        let factory = null;
        let verifiedPhones = null;
        verifiedPhones = SharedCheckoutAddressUtil.getVerifiedPhones(this.USER_SESSION, this.deliveryAddressList);
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            const { CreateEditDeliveryAddressComponent } = await import("./../create-edit-delivery-address/create-edit-delivery-address.component").finally(() => { });
            factory = this.cfr.resolveComponentFactory(CreateEditDeliveryAddressComponent);
            verifiedPhones = SharedCheckoutAddressUtil.getVerifiedPhones(this.USER_SESSION, this.deliveryAddressList);
        }
        else {
            const { CreateEditBillingAddressComponent } = await import("./../create-edit-billing-address/create-edit-billing-address.component").finally(() => { });
            factory = this.cfr.resolveComponentFactory(CreateEditBillingAddressComponent);
            verifiedPhones = SharedCheckoutAddressUtil.getVerifiedPhones(this.USER_SESSION, this.billingAddressList);
        }
        this.createEditAddressInstance = this.addressListRef.createComponent(factory, null, this.injector);
        this.createEditAddressInstance.instance['isAddMode'] = !(address);
        this.createEditAddressInstance.instance['invoiceType'] = this.invoiceType.value;
        this.createEditAddressInstance.instance['verifiedPhones'] = verifiedPhones;
        this.createEditAddressInstance.instance['displayCreateEditPopup'] = true;
        this.createEditAddressInstance.instance['address'] = address;
        this.createEditAddressInstance.instance['countryList'] = this.countryList;
        this.createEditAddressSubscription = (this.createEditAddressInstance.instance["closeAddressPopUp$"] as EventEmitter<any>).subscribe((response: CreateEditAddressModel) =>
        {
            //Expected Actions: "Add or Edit or null", null implies no action to be taken
            if (response.action) {
                const ADDRESSES = response['addresses'];
                this.updateAddressAfterAction(addressType, ADDRESSES);
            }
            this.createEditAddressInstance.instance['displayCreateEditPopup'] = false;
            this.createEditAddressRef.remove();
        });
    }

    /**
     * @description : to handle case in which address list pop-up is opened & to update list of addresses depending on address type
     * @param addressType:Delivery or Billing
     * @param addresses :can be delivery or billing address or 'null' in case of addition
     */
    updateAddressAfterAction(addressType, addresses)
    {
        if (!addresses) return;
        const IS_DEVLIVERY = addressType === this.ADDRESS_TYPES.DELIVERY;
        const SEPARATED_ADDRESS:AddressListModel = this._addressService.separateDeliveryAndBillingAddress(addresses);
        this.deliveryAddressList = SEPARATED_ADDRESS.deliveryAddressList;
        this.billingAddressList = SEPARATED_ADDRESS.billingAddressList;
        if (this.addressListInstance) {
            this.addressListInstance.instance['addresses'] = IS_DEVLIVERY ? this.deliveryAddressList : this.billingAddressList;
        }
        if (IS_DEVLIVERY) {
            const ADDRESS = this._cartService.shippingAddress ? this._cartService.shippingAddress : this.deliveryAddressList[0];
            this.updateDeliveryOrBillingAddress(addressType, ADDRESS);
            return;
        }
        const ADDRESS = this._cartService.billingAddress ? this._cartService.billingAddress : this.billingAddressList[0];
        this.updateDeliveryOrBillingAddress(addressType, ADDRESS);
    }

    /**
     * @description decides which event to be updated
     * @param addressType: Delivery or Billing
     * @param address: can be delivery or billing address 
     */
    updateDeliveryOrBillingAddress(addressType, address)
    {
        if (addressType === this.ADDRESS_TYPES.DELIVERY) {
            this.emitAddressEvent(address, null);
            return;
        }
        this.emitAddressEvent(null, address);
    }

    /**
     * @description:emits invoicetype, delivery & billling address type to parent in which this module is used
     * @param deliveryAddress 
     * @param billingAddress 
     */
    emitAddressEvent(deliveryAddress, billingAddress)
    {
        const INVOICE_TYPE = this.invoiceType.value;
        this.selectedDeliveryAddress = deliveryAddress ? deliveryAddress : this.selectedDeliveryAddress;
        this.selectedBillingAddress = billingAddress ? billingAddress : this.selectedBillingAddress;
        const DATA: SelectedAddressModel = { invoiceType: INVOICE_TYPE, deliveryAddress: this.selectedDeliveryAddress, billingAddress: this.selectedBillingAddress }
        this.emitAddressSelectEvent$.emit(DATA);
    }

    /** @description:closes the address list pop-up depending on address form pop-up     */
    closeAddressListPopup()
    {
        if (!this.addressListInstance) return
        this.addressListInstance.instance['displayAddressListPopup'] = false;
        this.addressListRef.remove();
        this.addressListInstance = null;
    }

    get displayBillingAddresses() { return this.invoiceType.value === this.INVOICE_TYPES.TAX ? 'block' : 'none'; }
    get isGSTUser() { return this.invoiceType.value === this.INVOICE_TYPES.TAX}

    ngOnDestroy(): void
    {
        this.addressListInstance = null;
        this.createEditAddressInstance = null;
        if (this.addressListCloseSubscription) this.addressListCloseSubscription.unsubscribe();
        if (this.addressListCloseSubscription) this.addressListCloseSubscription.unsubscribe();
        if (this.createEditAddressSubscription) this.createEditAddressSubscription.unsubscribe();
        if (this.triggerDeliveryOrBillingSubscription) this.triggerDeliveryOrBillingSubscription.unsubscribe();
    }
}
