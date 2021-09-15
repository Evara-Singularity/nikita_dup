import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateGiftingRoutingModule } from './corporate-gifting-routing';
import { CorporateGiftingComponent } from './corporate-gifting.component';


@NgModule({
  declarations: [CorporateGiftingComponent],
  imports: [
    CommonModule,
    CorporateGiftingRoutingModule
  ],
  exports:[
    CorporateGiftingComponent
  ]
})
export class CorporateGiftingModule { }
