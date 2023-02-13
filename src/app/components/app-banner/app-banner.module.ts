import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBannerComponent } from './app-banner.component';



@NgModule({
  declarations: [AppBannerComponent],
  imports: [
    CommonModule,
  ],
  exports: [AppBannerComponent],
  providers: [AppBannerComponent]
})
export class AppBannerModule { }
