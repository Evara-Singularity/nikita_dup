import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { BussinessAddressComponent } from "./bussinessAddress.component";
import { routing } from "./businessAddress.routing";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing
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