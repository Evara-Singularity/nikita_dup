import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BussinessInsightComponent } from "./bussinessInsight.component";
import { routing } from "./businessInsight.routing";
import { FormsModule } from "@angular/forms";

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, routing],
  declarations: [BussinessInsightComponent],
  exports: [],
  providers: [],
})
export class BusinessInsightModule {}