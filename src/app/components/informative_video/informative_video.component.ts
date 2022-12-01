import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { ModalService } from '@app/modules/modal/modal.service';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';

@Component({
  selector: 'informative_video',
  templateUrl: './informative_video.component.html',
  styleUrls: ['./informative_video.component.scss']
})
export class Informative_videoComponent implements OnInit {

  @Input() informativeVideosData: any;
  numberOfInformativeVideos: number = 0
  processedInformativeData: any
  youtubeModalInstance = null;

  constructor(
    public modalService: ModalService,
  ) { }

  ngOnInit() {
    if (this.informativeVideosData && this.informativeVideosData.length) {
      this.numberOfInformativeVideos = this.informativeVideosData.length;
    }
  }

  async showYTVideo(link) {
    if (!this.youtubeModalInstance) {
      // const PRODUCT = this._analytics.basicPLPTracking(this.product);
      // this.product['sellingPrice'] = this.product['salesPrice'];
      // let analyticsDetails = this._analytics.getCommonTrackingObject(PRODUCT, "listing");
      let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
      let videoDetails = { url: link, params: ytParams };
      let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
      modalData.inputs = { videoDetails: videoDetails };
      this.modalService.show(modalData);
    }
  }
}


@NgModule({
  imports: [
    CommonModule,
    YTThumnailPipeModule
  ],
  declarations: [
    Informative_videoComponent
  ],
  exports: [
    Informative_videoComponent
  ],
  providers: []
})

export class Informative_videoModule { }