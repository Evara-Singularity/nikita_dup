import { Component, Input, OnInit } from '@angular/core';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import CONSTANTS from '@app/config/constants';
import { ModalService } from '@app/modules/modal/modal.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
    selector: 'videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit
{
    @Input("videos") videos: any[] = null;
    @Input("name") name: string = null;
    @Input('analyticProduct') analyticProduct = null;
    readonly youtubeAPI = 'https://www.youtube.com/iframe_api';
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

    constructor(private modalService: ModalService, private _analytics: GlobalAnalyticsService,) { }

    ngOnInit()
    {
        if (this.videos && this.videos.length) {
            const tag = document.createElement('script');
            tag.src = this.youtubeAPI;
            document.body.appendChild(tag);
        }
    }

    async showYTVideo(link)
    {
        let analyticsDetails = this._analytics.getCommonTrackingObject(this.analyticProduct, "pdp");
        let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
        let videoDetails = { url: link, params: ytParams };
        let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
        modalData.inputs = { videoDetails: videoDetails, analyticsDetails: analyticsDetails};
        this.modalService.show(modalData);
    }
}
