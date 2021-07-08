import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WintersaleRoutingModule } from './wintersale-routing.module';
import { WinterComponent } from './winter.component';

@NgModule({
  declarations: [
    WinterComponent
  ],
  imports: [
    CommonModule,
    WintersaleRoutingModule
  ]
})
export class WintersaleModule { }