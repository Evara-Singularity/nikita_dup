import { NgModule } from '@angular/core';

import { BillingAddressComponent } from './billingAddress.component';
import { BillingAddressService } from './billingAddress.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoaderModule } from '../loader/loader.module';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LoaderModule],
    exports: [BillingAddressComponent],
    declarations: [BillingAddressComponent],
    providers: [BillingAddressService],
})
export class BillingAddressModule { }
