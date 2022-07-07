import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeFixedHeaderComponent } from './home-fixed-header.component';



@NgModule({
  declarations: [HomeFixedHeaderComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [HomeFixedHeaderComponent]
})
export class HomeFixedHeaderModule { }
