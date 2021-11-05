import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'videos',
    templateUrl: './videos.component.html',
    styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit
{
    @Input("videos") videos:any[] = null;
    iframeElement: HTMLIFrameElement;
    readonly youtubeAPI = 'https://www.youtube.com/iframe_api';
    readonly ytParams = '?autoplay=0&controls=1&loop&enablejsapi=1&fs=0&modestbranding=1&rel=1';

    constructor(private _sanitizer: DomSanitizer) { }
    
    ngOnInit()
    {
        if(this.videos.length){
            const tag = document.createElement('script');
            tag.src = this.youtubeAPI;
            document.body.appendChild(tag);
        }
    }

    ngAfterViewInit()
    {
        this.iframeElement = (document.getElementById('ytplayer') as HTMLIFrameElement);
        this.iframeElement.src = this.getSanitizedURL(this.videos[0]['link'], this.ytParams);
    }

    getSanitizedURL(url, params)
    {
        if (params) {
            url = url + params;
        }
        return this._sanitizer.sanitize(SecurityContext.URL, url);
    }
}
