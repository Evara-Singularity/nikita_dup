import { PopUpVariant2Module } from './../../pop-up-variant2/pop-up-variant2.module';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CreateEditAddressModel } from '@app/utils/models/shared-checkout.models';

@Component({
    selector: 'create-edit-delivery-address',
    templateUrl: './create-edit-delivery-address.component.html',
    styleUrls: ['../common-checkout.scss']
})
export class CreateEditDeliveryAddressComponent implements OnInit, AfterViewInit
{
    readonly ADDRESS_TYPE = "Delivery";
    @Input("displayCreateEditPopup") displayCreateEditPopup = false;
    @Input("isAddMode") isAddMode = true;
    @Input("address") address = null;
    @Input("verifiedPhones") verifiedPhones: string[];
    @Output("closeAddressPopUp$") closeAddressPopUp$: EventEmitter<CreateEditAddressModel> = new EventEmitter<CreateEditAddressModel>();
    addressForm:FormGroup = null;
    constructor() { }
    ngOnInit() 
    {
        this.createUpdateAddressForm();
    }

    createUpdateAddressForm()
    {
        this.addressForm = new FormGroup({
            name: new FormControl(""),
            email: new FormControl(""),
            phone: new FormControl(""),
            altPhone: new FormControl(""),
            address: new FormControl(""),
            country: new FormControl(""),
            pincode: new FormControl(""),
            state: new FormControl(""),
            city: new FormControl(""),
            landmark: new FormControl(""),
        })
    }

    ngAfterViewInit()
    {
        if (this.address) {
            this.name.patchValue(this.address['']);
            this.email.patchValue(this.address['']);
            this.phone.patchValue(this.address['']);
            this.altPhone.patchValue(this.address['']);
            this.address.patchValue(this.address['']);
            this.country.patchValue(this.address['']);
            this.pincode.patchValue(this.address['']);
            this.state.patchValue(this.address['']);
            this.city.patchValue(this.address['']);
            this.landmark.patchValue(this.address['']);
        }
    }

    handlePopup($event)
    {
        this.closeAddressPopUp$.emit({ action: null, address: null });
    }

    saveOrUpdateAddress($event)
    {
        if(this.disableAction)return;
        this.closeAddressPopUp$.emit({ action: this.modeType, address: this.addressForm.value });
    }

    get modeType() { return this.isAddMode ? "Add" : "Edit"; }
    get disableAction() { return this.addressForm.invalid}

    //getters
    get name() { return this.addressForm.get("name") as FormControl; }
    get email() { return this.addressForm.get("email") as FormControl; }
    get phone() { return this.addressForm.get("phone") as FormControl; }
    get altPhone() { return this.addressForm.get("altPhone") as FormControl; }
    get country() { return this.addressForm.get("country") as FormControl; }
    get pincode() { return this.addressForm.get("pincode") as FormControl; }
    get state() { return this.addressForm.get("state") as FormControl; }
    get city() { return this.addressForm.get("city") as FormControl; }
    get landmark() { return this.addressForm.get("landmark") as FormControl; }

}


@NgModule({
    declarations: [CreateEditDeliveryAddressComponent],
    imports: [CommonModule, PopUpVariant2Module],
    exports: [CreateEditDeliveryAddressComponent]
})
export default class CreateEditDeliveryAddressModule { }

