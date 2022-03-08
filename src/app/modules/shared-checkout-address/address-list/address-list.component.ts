import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, AfterViewInit, OnDestroy, Output, EventEmitter, NgModule } from '@angular/core';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { AddressListActionModel } from '@app/utils/models/shared-checkout.models';
import { CheckoutAddressPipeModule } from '@app/utils/pipes/checkout-address.pipe';

//expected actions are Add, Edit, Deliver Here(default/selected)

@Component({
    selector: 'address-list',
    templateUrl: './address-list.component.html',
    styleUrls: ['./../common-checkout.scss']
})
export class AddressListComponent implements OnInit, AfterViewInit, OnDestroy
{
    readonly ACTION_TYPES = { ADD: 'ADD', EDIT: 'EDIT', SELECTED: 'SELECTED'};
    @Input("addressType") addressType = "Delivery";
    @Input("displayAddressListPopup") displayAddressListPopup = false;
    @Input("addresses") addresses = [];
    @Input("cIdAddress") cIdAddress = null;
    @Output("emitCloseEvent$") emitCloseEvent$: EventEmitter<AddressListActionModel> = new EventEmitter<AddressListActionModel>();
    @Output("emitActionEvent$") emitActionEvent$: EventEmitter<AddressListActionModel> = new EventEmitter<AddressListActionModel>();

    constructor() { }

    ngOnInit() { }

    ngAfterViewInit()
    {

    }

    updateAddressId(event, idAddress)
    {
        event.stopPropagation();
        this.cIdAddress = idAddress;
    }

    handleClose($event)
    {
        this.emitCloseEvent$.emit({ action: null, address: null });
    }

    handleAction($event, action, address)
    {
        $event.stopPropagation();
        this.emitActionEvent$.emit({ action: action, address: address });
    }

    get headerText() { return `${this.addressType} Address` } 
    isAddressSelected(idAddress) { return idAddress === this.cIdAddress}

    ngOnDestroy()
    {

    }
}

@NgModule({
    declarations: [AddressListComponent],
    imports: [CommonModule, PopUpModule, CheckoutAddressPipeModule],
    exports: [AddressListComponent]
})
export default class AddressListModule { }
