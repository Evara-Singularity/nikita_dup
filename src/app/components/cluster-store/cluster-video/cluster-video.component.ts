import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PlatformLocation, CommonModule } from '@angular/common';
import { NgxSiemaOptions } from 'ngx-siema';
import CONSTANTS from '@app/config/constants';
import { RouterModule } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';


@Component({
    selector: 'cluster-video',
    templateUrl: './cluster-video.component.html',
    styleUrls: ['./cluster-video.component.scss']
})
export class ClusterVideoComponent implements OnInit, AfterViewInit
{
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    @Input('listOfVideos') listOfVideos = [];
    @Input('title') title = '';
    @ViewChild('player') player: ElementRef;
    isBrowser = false;
    tempHeight = -1;
    readonly youtubeAPI = 'https://www.youtube.com/iframe_api';
    readonly requiredParams = '?controls=1&modestbranding=1&rel=1&showinfo=0&enablejsapi=1&widgetid=1&cc_load_policy=1&fs=0&iv_load_policy=3';
    readonly playVideo = '{"event":"command","func":"playVideo","args":""}';
    readonly pauseVideo = '{"event":"command","func":"pauseVideo","args":""}';
    clusterVideoSiema: NgxSiemaOptions = {
        selector: '.cluster-video-siema',
        duration: 200,
        threshold: 10,
        startIndex: 0,
        perPage: 1.8,
        loop: false
    }
    iframes: HTMLCollectionOf<HTMLIFrameElement>;
    currentIframeIndex = -1;


    constructor(private sanitizer: DomSanitizer, private platformLocation: PlatformLocation , public _commonService:CommonService)
    {
        this.isBrowser = _commonService.isBrowser
    }

    ngOnInit()
    {

        var tag = document.createElement('script');
        tag.src = this.youtubeAPI;
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        this.listOfVideos.forEach((Obj) =>
        {
            Obj['image_link'] = this.getSanitizedURL(Obj['image_link'] + this.requiredParams);
        })
    }

    ngAfterViewInit()
    {
        this.iframes = (document.getElementsByClassName('access-class') as HTMLCollectionOf<HTMLIFrameElement>);
    }

    getSanitizedURL(url)
    {
        if (this.isBrowser) {
            url += '&origin=' + encodeURIComponent((this.platformLocation as any).location.origin);
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}

@NgModule({
    declarations: [
      ClusterVideoComponent
    ],
    imports: [
        CommonModule,
        RouterModule
    ],
  })
  export class ClusterVideoModule { }
