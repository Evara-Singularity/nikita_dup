import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessInfoComponent } from "./bussinessPersonalInfo.component";
import { routing } from "./businessInfo.routing";
import { DashboardService } from "../dashboard.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, routing],
  declarations: [BussinessInfoComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessInfoModule {}