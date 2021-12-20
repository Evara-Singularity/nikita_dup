import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, Inject, NgModule, OnInit, Optional, PLATFORM_ID } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '../services/common.service';
// import { SpeedTestModule, SpeedTestService } from 'ng-speed-test';

/**
 * HOW THIS WORKS?
 * 
 * This directives takes in consideration of 3 parameters for optmization of images
 * 1. Implemented browser agent detection on server and browser as well. (check app.modules.ts userAgentFactory Fn)
 * 2. use Modernizr to check webP image support on server side, as we need to serve webp images directly to browsers if browser supports
 * 3. on client/browser side we need to check on network speed and then serve higher version of image to enhance clarity else show image container relevant image
 * 4. Use standard image CDN variations provided by backend team sample given below: 
*/

/**
 * USE ONLY with images in below given format
 * {
    "xxlarge": "p/I/Q/N/d/MINIQNB3IGGC1-xxlarge.jpg", // 800*800
    "xlarge": "p/I/Q/N/d/MINIQNB3IGGC1-xlarge.jpg", // 500*500
    "large": "p/I/Q/N/d/MINIQNB3IGGC1-large.jpg", // 300*300
    "medium": "p/I/Q/N/d/MINIQNB3IGGC1-medium.jpg", // 240*240
    "small": "p/I/Q/N/d/MINIQNB3IGGC1-small.jpg", // 125*125
    "thumbnail": "p/I/Q/N/d/MINIQNB3IGGC1-thumbnail.jpg", //100*100
    "icon": "p/I/Q/N/d/MINIQNB3IGGC1-icon.jpg", // 80*80
    "default": "p/I/Q/N/d/MINIQNB3IGGC1.jpg" // original image uploaded in catalog
  }
*/

@Directive({
  selector: '[enhanceImgByNetwork]'
})
export class EnhanceImgByNetworkDirective implements OnInit, AfterViewInit {

  readonly whiteListedNode = ['img'];
  readonly imageSizes = CONSTANTS.IMAGE_SIZES_TYPE
  readonly THRESHOLD: number = CONSTANTS.NETWORK_SPEED_THRESHOD_LIMIT // 2MB

  readonly replaceOptions = CONSTANTS.IMAGE_SIZES_REPLACE_DATA

  private el: ElementRef<HTMLImageElement> = null;
  private isBrowser: boolean = false;
  private isServer: boolean = false;


  constructor(
    el: ElementRef<HTMLImageElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
    public _commonService: CommonService,
    @Optional() @Inject(CONSTANTS.BROWSER_AGENT_TOKEN) private bowserAgent,
  ) {
    this.el = el;
    this.isServer = isPlatformServer(this.platformId);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // startClientSideProcessing() {
  //   if (this.whiteListedNode.includes(this.el.nativeElement.nodeName.toLowerCase())) {
  //     const imageSrc = this.el.nativeElement.src;
  //     // console.log('inside imageSrcChunks ===>', imageSrc);
  //     const sizeType = this.imageSizes.filter(size => imageSrc.indexOf(size) != -1);
  //     const imageSrcChunks = imageSrc.split('/');
  //     //console.log('inside imageSrcChunks ===>', sizeType);
  //     imageSrcChunks[(imageSrcChunks.length - 1)] = imageSrcChunks[(imageSrcChunks.length - 1)].replace('-'+sizeType[0], '-'+this.replaceOptions[sizeType[0]]);
  //     //console.log('inside imageSrcChunks ===>', imageSrcChunks[(imageSrcChunks.length - 1)] );
  //     this.el.nativeElement.src = imageSrcChunks.join('/');
  //   } else {
  //     // console.log('enhanceImgByNetwork', 'enhanceImgByNetwork directive should be used with Img HTMLElement');
  //   }
  // }

  // startServerSideWebpProcessing() {
  //   const imageSrc = this.el.nativeElement.src;
  //   // console.log('inside imageSrcChunks ===>', imageSrc);
  //   const sizeType = this.imageSizes.filter(size => imageSrc.indexOf(size) != -1);
  //   const imageSrcChunks = imageSrc.split('/');
  //   // console.log('inside imageSrcChunks ===>', imageSrcChunks);
  //   imageSrcChunks[(imageSrcChunks.length - 1)] = imageSrcChunks[(imageSrcChunks.length - 1)].replace('.jpg', '.webp').replace('.jpeg', '.webp');
  //   // console.log('inside imageSrcChunks ===>', imageSrcChunks, imageSrcChunks.join('/'));
  //   this.el.nativeElement.src = imageSrcChunks.join('/');
  // }

  ngOnInit() {
    // if (this.isBrowser) {
    //   this._commonService.getNetworkSpeedState().subscribe(speed => {
    //     // console.log('speed ==>', speed);
    //     if (speed && speed > this.THRESHOLD) {
    //       this.startClientSideProcessing();
    //     }
    //   })
    // }
  }

  ngAfterViewInit() {
    // if (this.isBrowser && this._commonService.networkSpeed && this._commonService.networkSpeed > this.THRESHOLD) {
    //   this.startClientSideProcessing();
    // }

    // checkwhether on server is chrome useragent then replace for webp image
    // console.log('bowserAgent ==>', this.bowserAgent, this.isServer, this.bowserAgent.toLowerCase().indexOf("chrome") != -1);
    // if (this.isServer && this.bowserAgent && this.bowserAgent.toLowerCase().indexOf("chrome") != -1) {
    //   console.log('inside ===>');
    //   this.startServerSideWebpProcessing();
    // }

  }


}

//exporting directive as an module
@NgModule({
  declarations: [
    EnhanceImgByNetworkDirective
  ],
  imports: [
    CommonModule,
    // SpeedTestModule
  ],
  exports: [EnhanceImgByNetworkDirective],
})
export class EnhanceImgByNetworkDirectiveModule { }
