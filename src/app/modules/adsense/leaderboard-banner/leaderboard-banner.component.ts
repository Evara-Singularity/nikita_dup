import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { BannerAdUnit } from "@app/utils/models/adsense.model";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { environment } from "environments/environment";

@Component({
  selector: "adsense-leaderboard-banner",
  templateUrl: "./leaderboard-banner.component.html",
  styleUrls: ["./leaderboard-banner.component.scss"],
})
export class LeaderboardBannerComponent {
  @Input() data: BannerAdUnit | null = null;
  @Input() analyticsIdentifier: string = null;
  prodUrl = CONSTANTS.PROD;
  constructor(public _analytic: GlobalAnalyticsService, public _router: Router, private commonService: CommonService) {}

  onVisisble(event, isClick = false) {
    this.analyticsImpresssion(isClick);
  }

  analyticsImpresssion(isClick = false, url=null) {
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
      this._analytic.sendAdobeCall(
        {monet},
        isClick ? "genericClick" : "genericPageLoad"
      );
      setTimeout(() => {
        console.log(monet);
        if(this.commonService.isBrowser) {
          if(isClick && url) window.location.href = url;
        }
      },100);
    }
  }
}
