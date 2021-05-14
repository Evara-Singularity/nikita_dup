import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonsoonSaleRoutingModule } from './monsoon-sale-routing.module';
import { MonsoonSaleComponent } from './monsoonSale.component';

@NgModule({
  declarations: [
    MonsoonSaleComponent
  ],
  imports: [
    CommonModule,
    MonsoonSaleRoutingModule
  ]
})
export class MonsoonSaleModule { }