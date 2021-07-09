import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeasonSaleRoutingModule } from './season-sale-routing.module';
import { SeasonSaleComponent } from './seasonSale.component';


@NgModule({
  declarations: [
    SeasonSaleComponent
  ],
  imports: [
    CommonModule,
    SeasonSaleRoutingModule
  ]
})
export class SeasonSaleModule { }