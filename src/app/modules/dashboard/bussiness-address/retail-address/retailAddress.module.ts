import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { RetailAddressComponent } from "./retailAddress.component";
import { routing } from "./retailAddress.routing";
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
    RetailAddressComponent

  ],
  exports: [
  ],
  providers: [
    DashboardService,
  ]
})

export class RetailAddressModule { }