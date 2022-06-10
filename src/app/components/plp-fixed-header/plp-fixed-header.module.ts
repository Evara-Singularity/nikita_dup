import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlpFixedHeaderComponent } from './plp-fixed-header.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [PlpFixedHeaderComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    PlpFixedHeaderComponent
  ]
})
export class PlpFixedHeaderModule { }
