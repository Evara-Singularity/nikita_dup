import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, SecurityContext, AfterViewInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { Subject } from 'rxjs';

@Component({
    selector: 'youtube-player',
    templateUrl: './youtube-player.component.html',
    styleUrls: ['./youtube-player.component.scss']
})
export class YoutubePlayerComponent implements OnInit, AfterViewInit, OnDestroy
{
    private cDistryoyed = new Subject();
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input() videoDetails;
    isIframeNotLoaded = true;
    isBrowser = false;
    iframeElement: HTMLIFrameElement;
    readonly playVideo = '{"event":"command","func":"playVideo","args":""}';
    readonly youtubeAPI = 'https://www.youtube.com/iframe_api';
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

    constructor(private sanitizer: DomSanitizer, @Inject(PLATFORM_ID) platformId)
    {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit(): void {
        const tag = document.createElement('script');
        tag.src = this.youtubeAPI;
        document.body.appendChild(tag);
     }

    ngAfterViewInit()
    {
        this.iframeElement = (document.getElementById('ytplayer') as HTMLIFrameElement);
        this.iframeElement.src = this.getSanitizedURL(this.videoDetails['url'], this.videoDetails['params']);
    }

    getSanitizedURL(url, params)
    {
        if (params) {
            url = url + params;
        }
        return this.sanitizer.sanitize(SecurityContext.URL, url);
    }

    startVideo()
    {
        this.isIframeNotLoaded = false;
        if (this.iframeElement) {
            this.iframeElement.contentWindow.postMessage(this.playVideo, '*');
        } else {
            (document.getElementById('ytplayer') as HTMLIFrameElement).contentWindow.postMessage(this.playVideo, '*');
        }
    }

    closeModal() { this.closePopup$.emit(); }

    ngOnDestroy()
    {
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }

}
