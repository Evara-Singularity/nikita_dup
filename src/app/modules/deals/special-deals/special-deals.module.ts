import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialDealsRoutingModule } from './special-deals-routing.module';
import { SpecialDealsComponent } from './specialDeals.component';

@NgModule({
  declarations: [
    SpecialDealsComponent
  ],
  imports: [
    CommonModule,
    SpecialDealsRoutingModule
  ]
})
export class SpecialDealsModule {
}