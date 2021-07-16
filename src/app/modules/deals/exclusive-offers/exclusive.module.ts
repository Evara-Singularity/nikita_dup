import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExclusiveRoutingModule } from './exclusive-routing.module';
import { ExclusiveComponent } from './exclusive.component';


@NgModule({
  declarations: [
    ExclusiveComponent
  ],
  imports: [
    CommonModule,
    ExclusiveRoutingModule
  ]
})
export class ExclusiveModule { }