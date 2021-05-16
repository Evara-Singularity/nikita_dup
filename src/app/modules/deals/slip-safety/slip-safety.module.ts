import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlipSafetyRoutingModule } from './slip-safety-routing.module';
import { SlipSafetyComponent } from './slipSafety.component';

@NgModule({
  declarations: [
    SlipSafetyComponent
  ],
  imports: [
    CommonModule,
    SlipSafetyRoutingModule
  ]
})
export class SlipSafetyModule { }