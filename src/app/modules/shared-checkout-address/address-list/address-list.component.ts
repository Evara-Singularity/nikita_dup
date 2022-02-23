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
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<AddressListActionModel> = new EventEmitter<AddressListActionModel>();

    constructor() { }

    ngOnInit() { }

    handlePopup($event)
    {
        this.closeAddressPopUp$.emit({ action: null, idAddress: null });
    }

    handleAction($event, action, idAddress)
    {
        $event.stopPropagation()
        this.closeAddressPopUp$.emit({ action: action, idAddress: idAddress });
    }

    ngAfterViewInit()
    {

    }

    get headerText() { return `${this.addressType} Address` }

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
