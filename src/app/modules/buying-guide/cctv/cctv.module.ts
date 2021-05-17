import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./cctv.routing";
import { CctvComponent } from "./cctv.component";

@NgModule({
  imports: [
    CommonModule,
    routing,
    RouterModule
  ],
  declarations: [
    CctvComponent
  ],
  exports: [
    CctvComponent
  ],
  providers: [
  ]
})

export class CctvModule { }