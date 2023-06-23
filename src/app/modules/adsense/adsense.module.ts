import { NgModule } from "@angular/core";
import { RectangleBannerComponent } from "./inline-rectangle-banner/rectangle-banner.component";
import { LeaderboardBannerComponent } from "./leaderboard-banner/leaderboard-banner.component";
import { RelatedVideosComponent } from "./related-videos/related-videos.component";
import { PromotedBrandsUnitComponent } from "./promoted-brands-unit/promoted-brands-unit.component";
import { CommonModule } from "@angular/common";
import { MainAdsenseBannerComponent } from "./main-banner/main-banner.component";


@NgModule({
  declarations: [
    RectangleBannerComponent,
    LeaderboardBannerComponent,
    RelatedVideosComponent,
    MainAdsenseBannerComponent,
    PromotedBrandsUnitComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RectangleBannerComponent,
    LeaderboardBannerComponent,
    RelatedVideosComponent,
    MainAdsenseBannerComponent,
    PromotedBrandsUnitComponent
  ]
})
export class AdsenseModule { }
