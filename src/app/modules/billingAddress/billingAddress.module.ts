import { NgModule } from '@angular/core';

import { BillingAddressComponent } from './billingAddress.component';
import { BillingAddressService } from './billingAddress.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule],
    exports: [BillingAddressComponent],
    declarations: [BillingAddressComponent],
    providers: [BillingAddressService],
})
export class BillingAddressModule { }
