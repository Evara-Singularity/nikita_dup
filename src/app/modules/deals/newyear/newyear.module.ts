import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewyearRoutingModule } from './newyear-routing.module';
import { NewYearComponent } from './newyear.component';

@NgModule({
  declarations: [
    NewYearComponent
  ],
  imports: [
    CommonModule,
    NewyearRoutingModule
  ]
})
export class NewyearModule { }