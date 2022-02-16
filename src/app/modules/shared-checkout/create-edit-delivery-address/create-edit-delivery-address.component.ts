import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'create-edit-delivery-address',
  templateUrl: './create-edit-delivery-address.component.html',
  styleUrls: ['./create-edit-delivery-address.component.scss']
})
export class CreateEditDeliveryAddressComponent implements OnInit, AfterViewInit {

    @Input("mAddress") mAddress = null;
    addressForm = null;
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

    //getters
    get name() { return this.addressForm.get("name") as FormControl; }
    get email() { return this.addressForm.get("email") as FormControl; }
    get phone() { return this.addressForm.get("phone") as FormControl; }
    get altPhone() { return this.addressForm.get("altPhone"); }
    get address() { return this.addressForm.get("address") as FormControl; }
    get country() { return this.addressForm.get("country") as FormControl; }
    get pincode() { return this.addressForm.get("pincode") as FormControl; }
    get state() { return this.addressForm.get("state") as FormControl; }
    get city() { return this.addressForm.get("city") as FormControl; }
    get landmark() { return this.addressForm.get("landmark") as FormControl; }

}
