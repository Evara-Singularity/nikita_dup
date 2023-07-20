import { Component, Input } from "@angular/core";
import { BannerAdUnit } from "@app/utils/models/adsense.model";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";

@Component({
  selector: "adsense-rectangle-banner",
  templateUrl: "./rectangle-banner.component.html",
  styleUrls: ["./rectangle-banner.component.scss"],
})
export class RectangleBannerComponent {
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
      this._analytic.sendAdobeCall(
        {monet},
        isClick ? "genericClick" : "genericPageLoad"
      );
    }
  }
}
