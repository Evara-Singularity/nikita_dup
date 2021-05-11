import { NgxSiemaModule } from 'ngx-siema';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignRoutingModule } from './campaign-routing.module';
import { CampaignComponent } from './campaign.component';


@NgModule({
  declarations: [CampaignComponent],
  imports: [
    CommonModule,
    CampaignRoutingModule,
    NgxSiemaModule.forRoot(),
  ]
})
export class CampaignModule { }
