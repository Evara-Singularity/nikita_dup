import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { CopyrightComponent } from "./copyright.component";
import { CopyrightRoutingModule } from './copyright.routing';

@NgModule({
  imports: [
    CommonModule,
    CopyrightRoutingModule,
    RouterModule
  ],
  declarations: [
    CopyrightComponent
  ],
  exports: [
    CopyrightComponent
  ],
  providers: [
  ]
})
export class CopyrightModule { }
