import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routing } from "./bussiness.routing";
import { DashboardBussinessComponent } from "./bussiness.component";
import { BusinessService } from "./business.service";
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    routing,
  ],
  declarations: [DashboardBussinessComponent],
  providers: [BusinessService],
})
export class BusinessModule {
  constructor() { }
}