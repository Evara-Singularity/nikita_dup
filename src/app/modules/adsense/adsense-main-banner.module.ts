import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainAdsenseBannerComponent } from './main-banner/main-banner.component';
import { NgxSiemaModule } from 'ngx-siema';


@NgModule({
  declarations: [
    MainAdsenseBannerComponent
  ],
  imports: [
    CommonModule,
    NgxSiemaModule.forRoot(),
  ],
  exports: [
    MainAdsenseBannerComponent
  ]
})
export class AdsenseMainBannerModule { }
