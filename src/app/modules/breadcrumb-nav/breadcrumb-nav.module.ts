import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbNavComponent } from './breadcrumb-nav.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    BreadcrumbNavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    BreadcrumbNavComponent
  ]
})
export class BreadcrumbNavModule { }
