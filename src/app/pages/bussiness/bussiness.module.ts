import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routing } from "./bussiness.routing";
import { DashboardBussinessComponent } from "./bussiness.component";
import { BusinessService } from "./business.service";
import { LoaderModule } from "src/app/modules/loader/loader.module";

@NgModule({
  imports: [CommonModule, RouterModule, routing, LoaderModule],
  declarations: [DashboardBussinessComponent],
  providers: [BusinessService],
})
export class BusinessModule {
  constructor() {}
}