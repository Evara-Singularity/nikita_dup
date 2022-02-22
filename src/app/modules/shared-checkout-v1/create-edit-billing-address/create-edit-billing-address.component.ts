import { Form, FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';

@Component({
    selector: 'create-edit-billing-address',
    templateUrl: './create-edit-billing-address.component.html',
    styleUrls: ['./create-edit-billing-address.component.scss']
})
export class CreateEditBillingAddressComponent implements OnInit, AfterViewInit
{
    @Input("mAddress") mAddress = null;
    addressForm = null;
    constructor() { }
    ngOnInit() 
    { 
        this.createUpdateAddressForm();
    }

    createUpdateAddressForm()
    {
        
    }

    ngAfterViewInit()
    {
        
    }

    
}
