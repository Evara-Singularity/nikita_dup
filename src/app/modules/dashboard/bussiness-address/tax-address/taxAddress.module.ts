import { PageScrollService } from 'ngx-page-scroll-core';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { TaxAddressComponent } from "./taxAddress.component";
import { routing } from "./taxAddress.routing";
import { DashboardService } from './../../dashboard.service';
import { DeliveryAddressModule } from '@app/modules/deliveryAddress/deliveryAddress.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing,
    DeliveryAddressModule
  ],
  declarations: [
    TaxAddressComponent
  ],
  exports: [
  ],
  providers: [
    DashboardService,
    PageScrollService
  ]
})

export class TaxAddressModule {}