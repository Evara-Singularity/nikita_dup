import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessInfoComponent } from "./bussinessPersonalInfo.component";
import { routing } from "./businessInfo.routing";
import { DashboardService } from "../dashboard.service";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlphabetsModule } from "@app/utils/directives/alphanumeric-only.directive";
import { MockLottiePlayerModule } from "@app/components/mock-lottie-player/mock-lottie-player.module";
@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, routing, AlphabetsModule,MockLottiePlayerModule],
  declarations: [BussinessInfoComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessInfoModule {}