import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LeaderboardBannerComponent } from "./leaderboard-banner/leaderboard-banner.component";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";

@NgModule({
  declarations: [LeaderboardBannerComponent],
  imports: [CommonModule, ObserveVisibilityDirectiveModule],
  exports: [LeaderboardBannerComponent],
})
export class AdsenseLeaderboardBannerModule {}
