import { TrackingService } from '@app/utils/services/tracking.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxSiemaModule, NgxSiemaOptions, NgxSiemaService } from 'ngx-siema';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { ModalService } from '../../modules/modal/modal.service';
import { ModalModule } from '../../modules/modal/modal.module';
import { YoutubePlayerComponent } from '../youtube-player/youtube-player.component';
import { SiemaCarouselModule } from '@app/modules/siemaCarousel/siemaCarousel.module';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import PinchZoom from 'pinch-zoom-js';
import CONSTANTS from '@app/config/constants';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
  selector: 'app-product-crousel-popup',
  templateUrl: './product-crousel-popup.component.html',
  styleUrls: ['./product-crousel-popup.component.scss'],
})
export class ProductCrouselPopupComponent implements OnInit, AfterViewInit {

  @Input() options: any;
  @Input() productAllImages: any;
  @Input() slideNumber: number;
  @Input() oosProductIndex: -1
  @Input('analyticProduct') analyticProduct = null;
  @Output() out: EventEmitter<any> =  new EventEmitter<any>();
  @Output() currentSlide: EventEmitter<any> =  new EventEmitter<any>();
  ngxSiemaOptions: NgxSiemaOptions
  readonly ytParams = '?enablejsapi=1&autoplay=1&rel=0&controls=1&loop';
  readonly imageAssetURL = CONSTANTS.IMAGE_ASSET_URL;
  
  constructor(
    private ngxSiemaService: NgxSiemaService,
    private modalService: ModalService,
    private _analyticService: GlobalAnalyticsService,
    private _trackingService : TrackingService,
  ) { }

  ngOnInit(): void {
    this.setOptions();
  }

  ngAfterViewInit(){
    this.enablePinchZoom();
  }

  setOptions() {
    this.ngxSiemaOptions = {
      selector: '.dummy_siema',
      duration: this.options.duration || 500,
      perPage: this.options.perPage || 1,
      startIndex: this.slideNumber || 0,
      draggable: this.options.draggable || 1,
      threshold: this.options.threshold || 20,
      onInit: () => {
        window.scrollTo(window.scrollX, window.scrollY + 1);
        window.scrollTo(window.scrollX, window.scrollY - 1);
        if (this.options.onInit && typeof this.options.onInit == 'function') {
          this.options.onInit.call();
        }
      },
      onChange: (index) => {
        this.sendTracking(index)
      },
    }
  }

  sendTracking(num) {
    let page = {
      channel: "pdp image carausel",
      pageName: "moglix:image carausel:pdp",
      linkName: "moglix:productmainimageclick_" + num,
      subSection: "moglix:pdp carausel main image:pdp",
    };
    if(this.oosProductIndex > -1){
      page.channel = page.channel + ':oos:similar'
    }
    this._analyticService.sendAdobeCall({ page }, "genericPageLoad");
  }

  outData(data) {
    this.ngxSiemaService.currentSlide('.dummy_siema').subscribe(result => {
      this.currentSlide.emit(result);
    });
    this.out.emit(data);
    
  }

  showYTVideo(link) {
    let analyticsDetails = null;
    if(this.analyticProduct){
        analyticsDetails = this._trackingService.getCommonTrackingObject(this.analyticProduct, "listing");      
    }
    let videoDetails = { url: link, params: this.ytParams };
    let modalData = { component: YoutubePlayerComponent, inputs: null, outputs: {}, mConfig: { showVideoOverlay: true } };
    modalData.inputs = { videoDetails: videoDetails, analyticsDetails: analyticsDetails };
    this.modalService.show(modalData);
  }

  enablePinchZoom() {
    const containerIDs: HTMLElement[] = [];
    this.productAllImages.forEach((element, index) => {
      containerIDs.push((document.getElementById('prodImg_' + index) as HTMLElement));
    });
    setTimeout(() => {
      containerIDs.forEach(element => {
        this.intiatePinchZoom(element);
      });
    }, 0);
  }

  intiatePinchZoom(el: HTMLElement){
    new PinchZoom(el, {
      // zoom factor
      tapZoomFactor: 2,

      // zoom out factor
      zoomOutFactor: null,

      // duration in ms
      animationDuration: 300,

      // min/max zoom level
      maxZoom: 6,
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
  }

}

@NgModule({
  declarations: [ProductCrouselPopupComponent, YoutubePlayerComponent],
  imports: [
    CommonModule,
    PopUpModule,
    SiemaCarouselModule,
    MathCeilPipeModule,
    MathFloorPipeModule,
    RouterModule,
    NgxSiemaModule.forRoot(), 
    YTThumnailPipeModule,
    ModalModule,
  ],
  entryComponents: [ProductCrouselPopupComponent]
})
export default class ProductCrouselPopupModule {
}