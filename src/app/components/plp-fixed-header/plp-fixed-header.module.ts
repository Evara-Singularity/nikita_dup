import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlpFixedHeaderComponent } from './plp-fixed-header.component';
import { RouterModule } from '@angular/router';
import DownloadAppPromoBannerModule from '../downloadAppPromoBanner/downloadAppPromoBanner.component';



@NgModule({
  declarations: [PlpFixedHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    DownloadAppPromoBannerModule
  ],
  exports: [
    PlpFixedHeaderComponent
  ]
})
export class PlpFixedHeaderModule { }
