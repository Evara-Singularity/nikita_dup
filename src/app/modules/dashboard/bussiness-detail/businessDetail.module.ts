import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessDetailComponent } from "./bussinessDetail.component";
import { routing } from "./businessDetail.routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BusinessDetailService } from "./businessDetail.service";
import { LoaderModule } from "src/app/modules/loader/loader.module";
import { PincodePipeModule } from "src/app/utils/pipes/pincode-error.pipe";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    LoaderModule,
    PincodePipeModule,
  ],
  declarations: [BussinessDetailComponent],
  exports: [],
  providers: [BusinessDetailService],
})
export class BusinessDeatailDashboardModule {}