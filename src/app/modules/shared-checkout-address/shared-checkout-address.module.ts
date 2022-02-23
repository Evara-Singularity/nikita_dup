import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllAddressesComponent } from './all-addresses/all-addresses.component';
import { CheckoutAddressPipeModule } from '@app/utils/pipes/checkout-address.pipe';



@NgModule({
  declarations: [AllAddressesComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckoutAddressPipeModule
  ],
  exports: [AllAddressesComponent]
})
export class SharedCheckoutAddressModule { }
