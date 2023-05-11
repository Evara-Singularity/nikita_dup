import { SharedPhoneVerificationModule } from './../shared-phone-verification/shared-phone-verification.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllAddressesComponent } from './all-address-core/all-addresses/all-addresses.component';
import { CheckoutAddressPipeModule } from '@app/utils/pipes/checkout-address.pipe';
import { QuickOrderAllAddressComponent } from './all-address-core/quick-order-all-address/quick-order-all-address.component';
import { GstDetailsComponent } from './gst-details/gst-details.component';
import { MathRoundPipeModule } from "../../utils/pipes/math-round";

@NgModule({
    declarations: [AllAddressesComponent, QuickOrderAllAddressComponent, GstDetailsComponent],
    exports: [AllAddressesComponent, QuickOrderAllAddressComponent, GstDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CheckoutAddressPipeModule,
        MathRoundPipeModule
    ]
})
export class SharedCheckoutAddressModule { }
