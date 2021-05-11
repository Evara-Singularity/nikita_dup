import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { TermsRoutingModule } from "./terms.routing";
import { TermsComponent } from "./terms.component";

@NgModule({
  imports: [
    CommonModule,
    TermsRoutingModule,
    RouterModule
  ],
  declarations: [
    TermsComponent
  ],
  exports: [
    TermsComponent
  ],
  providers: [
  ]
})
export class TermsModule { }
