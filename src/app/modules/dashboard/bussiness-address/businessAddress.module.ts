import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { BussinessAddressComponent } from "./bussinessAddress.component";
import { routing } from "./businessAddress.routing";
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing,
    SharedCheckoutAddressModule
  ],
  declarations: [
    BussinessAddressComponent
  ],
  exports: [
  ],
  providers: [
  ]
})

export class BusinessAddressModule { }