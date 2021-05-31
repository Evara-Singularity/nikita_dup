import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./emailer.routing";
import { EmailerComponent } from "./emailer.component";

@NgModule({
  imports: [
    CommonModule,
    routing,
    RouterModule
  ],
  declarations: [
    EmailerComponent,
  ],
  exports: [
    EmailerComponent
  ]
})

export class EmailerModule { }