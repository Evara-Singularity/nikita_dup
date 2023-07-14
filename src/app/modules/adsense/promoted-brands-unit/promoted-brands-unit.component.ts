import { Component, Input } from "@angular/core";
import { PromotedBrandAd } from "@app/utils/models/adsense.model";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
@Component({
  selector: "adsense-promoted-brands-unit",
  templateUrl: "./promoted-brands-unit.component.html",
  styleUrls: ["./promoted-brands-unit.component.scss"],
})
export class PromotedBrandsUnitComponent {
  @Input() data: PromotedBrandAd[] | null = null;
  @Input() analyticsIdentifier: string = null;
  @Input() isPdpPage: boolean = false;

  constructor(private _analytic: GlobalAnalyticsService) {}

  onVisisble(event) {
    // console.log('log', 'on visible');
    this.analyticsImpresssion();
  }

  analyticsImpresssion() {
    if (this.data && this.analyticsIdentifier) {
      const monet = {
        adType: "impression_" + this.analyticsIdentifier,
      };
      this._analytic.sendAdobeCall(monet);
    }
  }

  analyticsClick(str) {
    //console.log('analyticsClick', str);
    if (this.data && this.analyticsIdentifier) {
      const monet = {
        adType: "click_" + this.analyticsIdentifier + "_" + str,
      };
      this._analytic.sendAdobeCall(monet);
    }
  }
}
