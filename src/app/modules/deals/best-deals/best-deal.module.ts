import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BestDealRoutingModule } from './best-deal-routing.module';
import { BestDealComponent } from './bestDeals.component';

@NgModule({
  declarations: [
    BestDealComponent
  ],
  imports: [
    CommonModule,
    BestDealRoutingModule
  ]
})
export class BestDealModule { }