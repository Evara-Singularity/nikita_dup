import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AmazingDealsRoutingModule } from './amazing-deals-routing.module';
import { AmazingDealsComponent } from './amazingDeals.component';


@NgModule({
  declarations: [
    AmazingDealsComponent
  ],
  imports: [
    CommonModule,
    AmazingDealsRoutingModule
  ]
})
export class AmazingDealsModule { }
