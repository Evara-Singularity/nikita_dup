import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeExpandedHeaderComponent } from './home-expanded-header.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [HomeExpandedHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    HomeExpandedHeaderComponent
  ]
})
export class HomeExpandedHeaderModule { }
