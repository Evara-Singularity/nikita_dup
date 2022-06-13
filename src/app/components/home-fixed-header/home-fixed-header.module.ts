import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFixedHeaderComponent } from './home-fixed-header.component';



@NgModule({
  declarations: [HomeFixedHeaderComponent],
  imports: [
    CommonModule
  ],
  exports: [HomeFixedHeaderComponent]
})
export class HomeFixedHeaderModule { }
