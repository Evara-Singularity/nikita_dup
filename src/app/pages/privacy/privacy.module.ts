import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { PrivacyRoutingModule } from "./privacy.routing";
import { PrivacyComponent } from "./privacy.component";

@NgModule({
  imports: [
    CommonModule,
    PrivacyRoutingModule,
    RouterModule
  ],
  declarations: [
    PrivacyComponent
  ],
  exports: [
    PrivacyComponent
  ],
  providers: [
  ]
})
export class PrivacyModule { }
