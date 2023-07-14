import { Component, Input } from "@angular/core";
import { YoutubePlayerComponent } from "@app/components/youtube-player/youtube-player.component";
import { ModalService } from "@app/modules/modal/modal.service";
import { VideoAdUnit } from "@app/utils/models/adsense.model";
import { CommonService } from "@app/utils/services/common.service";

@Component({
  selector: "adsense-related-videos",
  templateUrl: "./related-videos.component.html",
  styleUrls: ["./related-videos.component.scss"],
})
export class RelatedVideosComponent {
  @Input() data: VideoAdUnit[] | null = null;

  constructor(
    public _commonService: CommonService,
    public modalService: ModalService
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
}
