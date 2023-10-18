import { Component, Input } from "@angular/core";
import { BannerAdUnit } from "@app/utils/models/adsense.model";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";

@Component({
  selector: "adsense-leaderboard-banner",
  templateUrl: "./leaderboard-banner.component.html",
  styleUrls: ["./leaderboard-banner.component.scss"],
})
export class LeaderboardBannerComponent {
  @Input() data: BannerAdUnit | null = null;
  @Input() analyticsIdentifier: string = null;
  constructor(public _analytic: GlobalAnalyticsService) {}

  onVisisble(event, isClick = false) {
    this.analyticsImpresssion(isClick);
  }

  analyticsImpresssion(isClick = false) {
    if (this.data && this.analyticsIdentifier) {
      const type = isClick ? "click_" : "impression_";
      const monet = {
        adType: type + this.analyticsIdentifier,
      };
      // console.log(
      //   "analyticsImpresssion ==>",
      //   isClick ? "genericClick" : "genericPageLoad",
      //   monet
      // );
      this._analytic.sendAdobeCall({monet});
    }
  }
}
