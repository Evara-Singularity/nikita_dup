import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./buyer.routing";
import { BuyerComponent } from "./buyer.component";

@NgModule({
  imports: [
    CommonModule,
    routing,
    RouterModule
  ],
  declarations: [
    BuyerComponent
  ],
  exports: [
    BuyerComponent
  ],
  providers: [
  ]
})

export class BuyerModule { }