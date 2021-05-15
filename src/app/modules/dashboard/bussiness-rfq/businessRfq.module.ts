import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessRfqComponent } from "./bussinessRfq.component";
import { routing } from "./businessRfq.routing";
import { DashboardService } from "../dashboard.service";

@NgModule({
  imports: [CommonModule, RouterModule, routing],
  declarations: [BussinessRfqComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessRfqModule { }