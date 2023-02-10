import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MoglixInsightPdpRoutingModule } from './moglix-insight-pdp-routing.module';
import { MoglixInsightPdpComponent } from './moglix-insight-pdp.component';


@NgModule({
  declarations: [MoglixInsightPdpComponent],
  imports: [
    CommonModule,
    MoglixInsightPdpRoutingModule
  ],
  exports:[MoglixInsightPdpComponent]
  
})
export class MoglixInsightPdpModule { }
