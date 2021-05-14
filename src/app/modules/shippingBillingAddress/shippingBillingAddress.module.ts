 import { NgModule } from '@angular/core';

import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShippingBillingAddressComponent } from './shippingBillingAddress.component';
import { ShippingBillingAddressService } from './shippingBillingAddress.service';

@NgModule({
    imports: [FormsModule,ReactiveFormsModule,CommonModule],
    exports: [ShippingBillingAddressComponent],
    declarations: [ShippingBillingAddressComponent],
    providers: [ShippingBillingAddressService],
})
export class ShippingBillingAddressModule { }
