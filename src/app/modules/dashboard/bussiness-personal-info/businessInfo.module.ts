import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessInfoComponent } from "./bussinessPersonalInfo.component";
import { routing } from "./businessInfo.routing";
import { FormsModule } from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import { LoaderModule } from "src/app/modules/loader/loader.module";

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, routing, LoaderModule],
  declarations: [BussinessInfoComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessInfoModule {}
