import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {BussinessOrderComponent} from "./bussinessOrder.component";
import {routing} from "./businessOrder.routing";
import {FormsModule} from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import {BusinessOrderService} from "./businessOrder.service";
//import {NgxPaginationModule} from 'ngx-pagination';
import { LoaderModule } from 'src/app/modules/loader/loader.module';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    routing,
    LoaderModule,
    NgxPaginationModule,
    PopUpModule,
    
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

export class BusinessOrderModule{}
