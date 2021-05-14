import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialOfferRoutingModule } from './special-offer-routing.module';
import { SpecialComponent } from './special.component';

@NgModule({
  declarations: [
    SpecialComponent
  ],
  imports: [
    CommonModule,
    SpecialOfferRoutingModule
  ]
})
export class SpecialOfferModule { }