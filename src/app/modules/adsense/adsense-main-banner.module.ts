import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAdsenseBannerComponent } from './main-banner/main-banner.component';



@NgModule({
  declarations: [
    MainAdsenseBannerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MainAdsenseBannerComponent
  ]
})
export class AdsenseMainBannerModule { }
