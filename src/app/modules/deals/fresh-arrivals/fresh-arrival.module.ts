import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FreshArrivalRoutingModule } from './fresh-arrival-routing.module';
import { FreshComponent } from './fresh.component';

@NgModule({
  declarations: [
    FreshComponent
  ],
  imports: [
    CommonModule,
    FreshArrivalRoutingModule
  ]
})
export class FreshArrivalModule { }