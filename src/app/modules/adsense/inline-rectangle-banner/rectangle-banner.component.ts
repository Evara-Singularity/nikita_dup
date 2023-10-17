import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import CONSTANTS from "@app/config/constants";
import { BannerAdUnit } from "@app/utils/models/adsense.model";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";

@Component({
  selector: "adsense-rectangle-banner",
  templateUrl: "./rectangle-banner.component.html",
  styleUrls: ["./rectangle-banner.component.scss"],
})
export class RectangleBannerComponent {
  @Input() data: BannerAdUnit | null = null;
  @Input() analyticsIdentifier: string = null;

  constructor(public _analytic: GlobalAnalyticsService, private _router: Router, private commonService: CommonService) {}

  onVisisble(event, isClick = false, url=null) {
    this.analyticsImpresssion(isClick, url);
  }

  analyticsImpresssion(isClick = false, url=null) {
    if (this.data && this.analyticsIdentifier) {
      const type = isClick ? "click_" : "impression_";
      const monet = {
        adType: type + this.analyticsIdentifier,
      };
      this._analytic.sendAdobeCall(
        {monet},
        isClick ? "genericClick" : "genericPageLoad"
      );
      setTimeout(() => {
        console.log(monet)
        if(this.commonService.isBrowser) {
          if(isClick && url) {
            if(url.includes(CONSTANTS.PROD)) {
              this._router.navigateByUrl(url.replace(CONSTANTS.PROD, ''))
            } else {
              window.location.href = url;
            }
          };
        }
      },200);
    }
  }
}
