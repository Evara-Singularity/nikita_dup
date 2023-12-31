import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MainAdsenseBannerComponent } from "./main-banner/main-banner.component";
import { NgxSiemaModule } from "ngx-siema";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";

@NgModule({
  declarations: [MainAdsenseBannerComponent],
  imports: [
    CommonModule,
    NgxSiemaModule.forRoot(),
    ObserveVisibilityDirectiveModule,
  ],
  exports: [MainAdsenseBannerComponent],
})
export class AdsenseMainBannerModule {}
