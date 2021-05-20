import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BestOfferRoutingModule } from './best-offer-routing.module';
import { BestOfferComponent } from './bestOffer.component';

@NgModule({
  declarations: [
    BestOfferComponent
  ],
  imports: [
    CommonModule,
    BestOfferRoutingModule
  ]
})
export class BestOfferModule { }