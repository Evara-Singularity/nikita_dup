import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { RetailAddressComponent } from "./retailAddress.component";
import { routing } from "./retailAddress.routing";
import { DashboardService } from './../../dashboard.service';
import { DeliveryAddressModule } from 'src/app/modules/deliveryAddress/deliveryAddress.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing,
    DeliveryAddressModule
  ],
  declarations: [
    RetailAddressComponent
  ],
  exports: [
  ],
  providers: [
    DashboardService,
  ]
})

export class RetailAddressModule { }