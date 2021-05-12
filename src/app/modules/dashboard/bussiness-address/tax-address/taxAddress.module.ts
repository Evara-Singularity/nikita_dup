import { PageScrollService } from 'ngx-page-scroll-core';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { TaxAddressComponent } from "./taxAddress.component";
import { routing } from "./taxAddress.routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DashboardService } from './../../dashboard.service';
import { LoaderModule } from 'src/app/modules/loader/loader.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    routing,
    LoaderModule,
    ReactiveFormsModule,
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