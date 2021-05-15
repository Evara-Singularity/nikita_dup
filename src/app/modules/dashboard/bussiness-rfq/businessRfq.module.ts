import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessRfqComponent } from "./bussinessRfq.component";
import { routing } from "./businessRfq.routing";
import { DashboardService } from "../dashboard.service";
import { LoaderModule } from "src/app/modules/loader/loader.module";

@NgModule({
  imports: [CommonModule, RouterModule, routing, LoaderModule],
  declarations: [BussinessRfqComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessRfqModule { }