import { Component, ElementRef, Input, ViewEncapsulation, PLATFORM_ID, Inject, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSiemaOptions, NgxSiemaService } from 'ngx-siema';
import { Subject } from 'rxjs';
import PinchZoom from 'pinch-zoom-js';
import CONSTANTS from '@app/config/constants';
import { ModalService } from '@app/modules/modal/modal.service';
import { SiemaCrouselService } from '@app/utils/services/siema-crousel.service';
import { YoutubePlayerComponent } from '@app/components/youtube-player/youtube-player.component';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';

@Component({
  selector: 'ProductCrouselSlide',
  templateUrl: './ProductCrouselSlide.component.html',
  styleUrls: ['./ProductCrouselSlide.component.scss']
})
export class ProductCrouselSlideComponent implements OnInit {
  @Input() options: any;
  @Input() item: any;
  @Input() imagePath: any;
  image_Path = CONSTANTS.IMAGE_BASE_URL;
  @Input() defaultImage: any;
  @Input() itemIndex: any;
  @Input() contentType: string;
  @Output() ImageClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() ImageMouseEnter: EventEmitter<any> = new EventEmitter<any>();
  @Input() productName: any;
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
  analyticsInfo: any = {};

  constructor(
    private globalAnalyticService: GlobalAnalyticsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public localStorageService: LocalStorageService,
    private _modalService: ModalService,
    private _router: Router,
    private _siemaCrouselService: SiemaCrouselService,
    private ngxSiemaService: NgxSiemaService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
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
    e.stopPropagation();
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

  sendTracking() {
    let page = {
      'channel': "pdp image carausel",
      'pageName': "moglix:image carausel:pdp",
      'linkName': "moglix:productmainimageclick",
      'subSection': "moglix:pdp carausel main image:pdp",
      'linkPageName': "moglix:" + this._router.url,
    }
    this.globalAnalyticService.sendAdobeCall({ page }, "genericPageLoad");
  }

  clicked() {
    this.ngxSiemaService.currentSlide(this.options.selector).subscribe(result => {
      if(result.currentSlide === 0) {
        this.sendTracking();
      }
      this._siemaCrouselService.setProductScrouselPopup({ active: true, slideNumber: result.currentSlide });
    })
  }

  goTo(index, selector) {
    this.ngxSiemaService.goTo(index, selector);
  }

}

