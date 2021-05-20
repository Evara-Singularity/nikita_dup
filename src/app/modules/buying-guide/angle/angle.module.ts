import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { routing } from "./angle.routing";
import { AngleComponent } from "./angle.component";

@NgModule({
  imports: [CommonModule, routing, RouterModule],
  declarations: [AngleComponent],
  providers: [],
})
export class AngleModule {}