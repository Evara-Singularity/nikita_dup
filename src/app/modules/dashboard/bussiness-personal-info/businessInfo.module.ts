import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessInfoComponent } from "./bussinessPersonalInfo.component";
import { routing } from "./businessInfo.routing";
import { FormsModule } from "@angular/forms";
import { DashboardService } from "../dashboard.service";

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, routing],
  declarations: [BussinessInfoComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessInfoModule {}