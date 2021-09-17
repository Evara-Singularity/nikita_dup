import { Component, ElementRef, Input, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgxSiemaOptions, NgxSiemaService } from 'ngx-siema';

import { Subject } from 'rxjs';
import PinchZoom from 'pinch-zoom-js';
import { ModalService } from '../modal/modal.service';
import { YoutubePlayerComponent } from '../../components/youtube-player/youtube-player.component';
import { SiemaCrouselService } from '../../utils/services/siema-crousel.service';
import CONSTANTS from '../../config/constants';
import { CommonService } from '@app/utils/services/common.service';



@Component({
    selector: 'siema-slide',
    templateUrl: 'siemaSlide.html',
    styleUrls: [],
    encapsulation: ViewEncapsulation.None,
})

export class SiemaSlideComponent {
    @Input() options: any;
    @Input() item: any;
    @Input() imagePath: any;
    image_Path = CONSTANTS.IMAGE_BASE_URL;
    @Input() defaultImage: any;
    @Input() itemIndex: any;
    @Input() contentType: string;
    @Output() ImageClick: EventEmitter<any> = new EventEmitter<any>();
    @Output() ImageMouseEnter: EventEmitter<any> = new EventEmitter<any>();
    @Input() productName:any;
    isServer: boolean;
    isBrowser: boolean;
    isMobile: boolean;
    currentIndex: any = false;
    ngxSiemaOptions: NgxSiemaOptions;
    bannerInterval;
    interval = 5000;
    scrollTarget;
    perPageDefault = 7;
    draggableDefault = false;
    initialized: boolean = false;
    imageChange$ = new Subject();
    // updateScroll$;
    // scrollObservable$;
    Math;
    splitUrlByComma;
    splitUrlByCommaAlt;
    pzInstance: any;
    @ViewChild('pinchZoom') pinchZoom: ElementRef;
    readonly ytParams = '?enablejsapi=1&autoplay=1&rel=0&controls=1&loop';
    readonly imageAssetURL = CONSTANTS.IMAGE_ASSET_URL;

    constructor(
        private _modalService: ModalService,
        private _siemaCrouselService: SiemaCrouselService,
        private ngxSiemaService: NgxSiemaService,
        public _commonService: CommonService
    ) {
        this.isBrowser = _commonService.isBrowser;  
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        if (this.isBrowser) {

            if (this.pinchZoom) {
                let el = (this.pinchZoom.nativeElement as HTMLElement);
                setTimeout(() => {
                    this.pzInstance = new PinchZoom(el, {
                        // zoom factor
                        tapZoomFactor: 2,

                        // zoom out factor
                        zoomOutFactor: null,

                        // duration in ms
                        animationDuration: 300,

                        // min/max zoom level
                        maxZoom: 4,
                        minZoom: 0.5,

                        // draggable unzoomed image
                        draggableUnzoomed: false,

                        lockDragAxis: false,

                        // compute offsets only once
                        setOffsetsOnce: false,

                        // falls back to 2D transforms when idle
                        use2d: false,

                        // vertical/horizontal padding
                        verticalPadding: 0,
                        horizontalPadding: 0

                    });
                }, 0);
            }


        }


    }

    closeZoom(e) {
        let el = document.querySelector(".prod-carsl");
        el.classList.remove('zoomView');
        if (this.pzInstance) {
            this.pzInstance.zoomOutAnimation();
        }
        event.stopPropagation();
    }


    imageAlt(link) {
        this.splitUrlByCommaAlt = link.split(",");
        return this.splitUrlByCommaAlt[2];
    }

    setBannerCookie(caption) {
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        if (this.isBrowser) {
            document.cookie = "adobeClick=" + "Banner" + "_" + caption + "; expires=" + date.toUTCString() + ";path=/";
        }
    }

    showYTVideo(link) {
        let videoDetails = { url: link, params: this.ytParams };
        let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
        modalData.inputs = { videoDetails: videoDetails };
        this._modalService.show(modalData);
    }

    clicked(){
        this.ngxSiemaService.currentSlide(this.options.selector).subscribe(result=>{
            this._siemaCrouselService.setProductScrouselPopup({active: true, slideNumber: result.currentSlide});
        })
    }

    goTo(index, selector) {
        this.ngxSiemaService.goTo(index, selector);
    }

}
