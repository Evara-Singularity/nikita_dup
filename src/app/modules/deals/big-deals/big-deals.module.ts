import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigDealsRoutingModule } from './big-deals-routing.module';
import { BigDealComponent } from './bigDeals.component';

@NgModule({
  declarations: [
    BigDealComponent
  ],
  imports: [
    CommonModule,
    BigDealsRoutingModule
  ]
})
export class BigDealsModule { }