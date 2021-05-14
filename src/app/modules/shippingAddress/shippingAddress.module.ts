import { NgModule } from '@angular/core';

import { ShippingAddressComponent } from './shippingAddress.component';
import { ShippingAddressService } from './shippingAddress.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule],
    exports: [ShippingAddressComponent],
    declarations: [ShippingAddressComponent],
    providers: [ShippingAddressService],
})
export class ShippingAddressModule { }
