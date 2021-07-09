import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MadeInIndiaRoutingModule } from './made-in-india-routing.module';
import { MadeInIndiaComponent } from './madeInIndia.component';

@NgModule({
  declarations: [
    MadeInIndiaComponent
  ],
  imports: [
    CommonModule,
    MadeInIndiaRoutingModule
  ]
})
export class MadeInIndiaModule { }