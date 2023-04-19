import {
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
  PLATFORM_ID,
  Inject,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgxSiemaOptions, NgxSiemaService } from "ngx-siema";
import { Subject } from "rxjs";
import PinchZoom from "pinch-zoom-js";
import CONSTANTS from "@app/config/constants";
import { ModalService } from "@app/modules/modal/modal.service";
import { SiemaCrouselService } from "@app/utils/services/siema-crousel.service";
import { YoutubePlayerComponent } from "@app/components/youtube-player/youtube-player.component";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { LocalStorageService } from "ngx-webstorage";
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from "@app/utils/services/common.service";

@Component({
  selector: "ProductCrouselSlide",
  templateUrl: "./ProductCrouselSlide.component.html",
  styleUrls: ["./ProductCrouselSlide.component.scss"],
})
export class ProductCrouselSlideComponent {
  @Input() clickedIndexOfOosProduct: number;
  @Input() options: any;
  @Input() productOutOfStock: boolean;
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
  @ViewChild("pinchZoom") pinchZoom: ElementRef;
  readonly ytParams = "?enablejsapi=1&autoplay=1&rel=0&controls=1&loop";
  readonly imageAssetURL = CONSTANTS.IMAGE_ASSET_URL;
  analyticsInfo: any = {};
  @Input('productBo') productBo: any;
  productStaticData = this._commonService.defaultLocaleValue;

  constructor(
    private _commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public localStorageService: LocalStorageService,
    private _modalService: ModalService,
    private _router: Router,
    private _siemaCrouselService: SiemaCrouselService,
    private ngxSiemaService: NgxSiemaService,
    private _analytics: GlobalAnalyticsService,
    private _activatedRoute:ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  
  ngOnInit(){
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this._commonService.defaultLocaleValue = staticJsonData;
      this.productStaticData = staticJsonData;
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      if (this.pinchZoom) {
        let el = this.pinchZoom.nativeElement as HTMLElement;
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
            horizontalPadding: 0,
          });
        }, 0);
      }
    }
  }

  closeZoom(e) {
    let el = document.querySelector(".prod-carsl");
    el.classList.remove("zoomView");
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
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (this.isBrowser) {
      document.cookie =
        "adobeClick=" +
        "Banner" +
        "_" +
        caption +
        "; expires=" +
        date.toUTCString() +
        ";path=/";
    }
  }

  showYTVideo(link) {
    let analyticsDetails = null;
    if(this.productBo)
    {
        const PRODUCT = this._analytics.basicPDPTracking(this.productBo);
        analyticsDetails = this._analytics.getCommonTrackingObject(PRODUCT, "pdp");
    }
    let videoDetails = { url: link, params: this.ytParams };
    let modalData = {
      component: YoutubePlayerComponent,
      inputs: null,
      outputs: {},
      mConfig: { showVideoOverlay: true },
    };
    modalData.inputs = { videoDetails: videoDetails, analyticsDetails: analyticsDetails };
    this._modalService.show(modalData);
  }

  sendTracking(num) {
    let page = {
      channel: "pdp image carausel",
      pageName: "moglix:image carausel:pdp",
      linkName: "moglix:productmainimageclick_" + num,
      subSection: "moglix:pdp carausel main image:pdp",
      linkPageName: "moglix:" + this._router.url,
    };
    this._analytics.sendAdobeCall({ page }, "genericPageLoad");
  }

  clicked() {
    this.ngxSiemaService
      .currentSlide(this.options.selector)
      .subscribe((result) => {
        // this._commonService.resetSearchNudgeTimer();
        this.sendTracking(result.currentSlide);
        this._siemaCrouselService.setProductScrouselPopup({
          active: true,
          slideNumber: result.currentSlide,
          oosProductCardIndex: this.clickedIndexOfOosProduct,
        });
      });
      // this.createFragment();
  }

  goTo(index, selector) {
    this.ngxSiemaService.goTo(index, selector);
  }
  createFragment(){
    this._activatedRoute.fragment.subscribe((fragment: string)=>{
      if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_IMAGE_HASH){
        return;
      }
      else{
        window.history.replaceState({}, '',`${this._router.url}/#${CONSTANTS.PDP_IMAGE_HASH}`);
        window.history.pushState({}, '',`${this._router.url}/#${CONSTANTS.PDP_IMAGE_HASH}`);
      }
    })
  }
}
