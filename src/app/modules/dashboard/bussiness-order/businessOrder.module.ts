import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { BussinessOrderComponent } from "./bussinessOrder.component";
import { routing } from "./businessOrder.routing";
import { DashboardService } from "../dashboard.service";
import { BusinessOrderService } from "./businessOrder.service";
import { NgxPaginationModule } from 'ngx-pagination';
import { LoaderModule } from 'src/app/modules/loader/loader.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing,
    LoaderModule,
    NgxPaginationModule
  ],
  declarations: [
    BussinessOrderComponent,
  ],
  exports: [
  ],
  providers: [
    DashboardService,
    BusinessOrderService
  ]
})

export class BusinessOrderModule { }