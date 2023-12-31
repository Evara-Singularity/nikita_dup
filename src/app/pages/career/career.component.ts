import { ModalService } from '@app/modules/modal/modal.service';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformServer } from "@angular/common";
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'career',
  templateUrl: 'career.html',
  styleUrls: ['career.scss']
})
export class CareerComponent {
  API = CONSTANTS;
  readonly imagePathCareer = CONSTANTS.IMAGE_ASSET_URL;
  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  isServer: boolean;
  // ondemand load of youtube video player in modal
  youtubeModalInstance = null;

  constructor(
    private title: Title,
    private meta: Meta,
    private _renderer2: Renderer2,
    private modalService: ModalService,
    @Inject(DOCUMENT) private _document,
    private _router: Router,
    @Inject(PLATFORM_ID) private platformId) {

    this.isServer = isPlatformServer(this.platformId);

    this.title.setTitle("Explore Career Opportunities at Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Explore Career Opportunities at Moglix.com" });
    this.meta.addTag({ "property": "og:description", "content": "We would like you to come and work with us and share your unique experience, skills and passion. Write to us at talent[at]moglix.com." });
    this.meta.addTag({ "property": "og:url", "content": CONSTANTS.PROD + "/career" });
    this.meta.addTag({ "name": "description", "content": "We would like you to come and work with us and share your unique experience, skills and passion. Write to us at talent[at]moglix.com." });

    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links);
    }

  }

  async showYTVideo(link) {
    if (!this.youtubeModalInstance) {
      let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
      let videoDetails = { url: link, params: ytParams };
      let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
      modalData.inputs = { videoDetails: videoDetails };
      this.modalService.show(modalData);
    }
  }

  ngOnDestroy() {
    if (this.youtubeModalInstance) {
      this.youtubeModalInstance = null;
    }
  }
}