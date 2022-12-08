import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { AddressListActionModel } from '@app/utils/models/shared-checkout.models';
import { CheckoutAddressPipeModule } from '@app/utils/pipes/checkout-address.pipe';
import { CommonService } from '@app/utils/services/common.service';

//expected actions are Add, Edit, Deliver Here(default/selected)
@Component({
    selector: 'address-list',
    templateUrl: './address-list.component.html',
    styleUrls: ['./../common-checkout.scss']
})
export class AddressListComponent implements OnInit
{
    readonly ACTION_TYPES = { ADD: 'ADD', EDIT: 'EDIT', SELECTED: 'SELECTED', DELETE:'DELETE' };
    @Input('parentModule') parentModule = 'Checkout';
    @Input("addressType") addressType = "Delivery";
    @Input("displayAddressListPopup") displayAddressListPopup = false;
    @Input("addresses") addresses = [];
    @Input("cIdAddress") cIdAddress = null;
    @Output("emitCloseEvent$") emitCloseEvent$: EventEmitter<AddressListActionModel> = new EventEmitter<AddressListActionModel>();
    @Output("emitActionEvent$") emitActionEvent$: EventEmitter<AddressListActionModel> = new EventEmitter<AddressListActionModel>();
    showRadio: boolean = true;
    constructor(
        private _commonService: CommonService,
    ) { }

    ngOnInit() { }

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
        this._commonService.setBodyScroll($event, true);
    }

    get headerText() { return `${this.addressType} Address` }

    get showDelete() { return this.parentModule === 'Dashboard'}

    isAddressSelected(idAddress) { return idAddress === this.cIdAddress }
}

@NgModule({
    declarations: [AddressListComponent],
    imports: [CommonModule, PopUpModule, CheckoutAddressPipeModule],
    exports: [AddressListComponent]
})
export default class AddressListModule { }
