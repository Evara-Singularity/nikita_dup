import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandSpotlightRoutingModule } from './brand-spotlight-routing.module';
import { BrandSpotlightComponent } from './brands-spotlight.component';

@NgModule({
  declarations: [
    BrandSpotlightComponent
  ],
  imports: [
    CommonModule,
    BrandSpotlightRoutingModule
  ]
})
export class BrandSpotlightModule { }