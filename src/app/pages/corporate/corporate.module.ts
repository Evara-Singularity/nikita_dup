import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { CorporateComponent } from './corporate.component';
import { CorporateRoutingModule } from './corporate.routing';


@NgModule({
  imports: [
    CommonModule,
    CorporateRoutingModule,
    RouterModule,
  ],
  declarations: [
    CorporateComponent

  ],
  exports: [
    CorporateComponent
  ],
  providers: []
})
export class CorporateModule { }
