import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./stablizer.routing";
import { StablizerComponent } from "./stablizer.component";

@NgModule({
  imports: [
    CommonModule,
    routing,
    RouterModule
  ],
  declarations: [
    StablizerComponent
  ],
  exports: [
    StablizerComponent
  ],
  providers: [
  ]
})

export class StablizerModule { }