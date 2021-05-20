import { DashboardService } from "./../dashboard.service";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessPasswordComponent } from "./bussinessPassword.component";
import { routing } from "./businessPassword.routing";
import { FormsModule } from "@angular/forms";
import { PasswordPipeModule } from "@app/utils/pipes/password-error.pipe";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    routing,
    PasswordPipeModule,
  ],
  declarations: [BussinessPasswordComponent],
  exports: [],
  providers: [DashboardService],
})
export class BusinessPasswordModule {}