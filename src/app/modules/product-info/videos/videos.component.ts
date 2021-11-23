import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import { ModalService } from '@app/modules/modal/modal.service';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit
{
    @Input("videos") videos: any[] = null;
    @Input("name") name: string = null;
    readonly youtubeAPI = 'https://www.youtube.com/iframe_api';
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

    constructor(private modalService: ModalService,) { }

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
        let ytParams = '?autoplay=1&rel=0&controls=1&loop&enablejsapi=1';
        let videoDetails = { url: link, params: ytParams };
        let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
        modalData.inputs = { videoDetails: videoDetails };
        this.modalService.show(modalData);
    }
}
