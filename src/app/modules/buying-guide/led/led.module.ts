import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./led.routing";
import { LedComponent } from "./led.component";

@NgModule({
  imports: [
    CommonModule,
    routing,
    RouterModule
  ],
  declarations: [
    LedComponent
  ],
  exports: [
    LedComponent
  ],
  providers: [
  ]
})

export class LedModule { }