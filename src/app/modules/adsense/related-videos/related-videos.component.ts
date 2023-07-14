import { Component, Input } from "@angular/core";
import { YoutubePlayerComponent } from "@app/components/youtube-player/youtube-player.component";
import { ModalService } from "@app/modules/modal/modal.service";
import { VideoAdUnit } from "@app/utils/models/adsense.model";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";

@Component({
  selector: "adsense-related-videos",
  templateUrl: "./related-videos.component.html",
  styleUrls: ["./related-videos.component.scss"],
})
export class RelatedVideosComponent {
  @Input() data: VideoAdUnit[] | null = null;
  @Input() analyticsIdentifier: string = null;

  constructor(
    public _commonService: CommonService,
    public modalService: ModalService,
    private _analytic: GlobalAnalyticsService
  ) {}

  async showYTVideo(link) {
    let ytParams = "?autoplay=1&rel=0&controls=1&loop&enablejsapi=1";
    let videoDetails = { url: link, params: ytParams };
    let modalData = {
      component: YoutubePlayerComponent,
      inputs: null,
      outputs: {},
      mConfig: { showVideoOverlay: true },
    };
    modalData.inputs = { videoDetails: videoDetails };
    this._commonService.setBodyScroll(null, false);
    this.modalService.show(modalData);
  }

  onVisisble(event) {
    // console.log('log', 'on visible');
    this.analyticsImpresssion();
  }

  analyticsImpresssion(isClick = false, extraIdentifer = "") {
    if (this.data && this.analyticsIdentifier) {
      const type = isClick ? "click_" : "impression_";
      const monet = {
        adType: type + this.analyticsIdentifier + extraIdentifer,
      };
      // console.log(monet);
      this._analytic.sendAdobeCall(
        monet,
        isClick ? "genericClick" : "genericPageLoad"
      );
    }
  }
}
