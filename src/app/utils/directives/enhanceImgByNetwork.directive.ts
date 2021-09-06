import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { AfterViewInit, Directive, ElementRef, Inject, NgModule, OnInit, PLATFORM_ID } from '@angular/core';
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
  readonly imageSizes = ['xlarge', 'large', 'medium', 'small', 'thumbnail', 'icon']
  readonly replaceOptions = {
    'icon': 'small',
    'thumbnail': 'medium',
    'small': 'large',
    'medium': 'xlarge',
    'large': 'xxlarge',
    'xlarge': 'xxlarge',
  }

  private el: ElementRef<HTMLImageElement> = null;
  private isBrowser: boolean = false;
  private isServer: boolean = false;

  constructor(
    el: ElementRef<HTMLImageElement>,
    @Inject(PLATFORM_ID) private platformId: Object,
    // private speedTestService: SpeedTestService
  ) {
    this.el = el;
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  startClientSideProcessing() {
    if (this.whiteListedNode.includes(this.el.nativeElement.nodeName.toLowerCase())) {
      const imageSrc = this.el.nativeElement.src;
      const sizeType = this.imageSizes.filter(size => imageSrc.indexOf(size) != -1);
      const imageSrcChunks = imageSrc.split('/');
      imageSrcChunks[(imageSrcChunks.length - 1)] = imageSrcChunks[(imageSrcChunks.length - 1)].replace(sizeType[0], this.replaceOptions[sizeType[0]]);
      this.el.nativeElement.src = imageSrcChunks.join('/');
    } else {
      console.log('enhanceImgByNetwork', 'enhanceImgByNetwork directive should be used with Img HTMLElement');
    }
  }

  ngOnInit() {

    // this.speedTestService.getMbps().subscribe(res=>{
    //   console.log('speedTestService getMbps', res);
    // })

  }

  ngAfterViewInit() {
    if (this.isBrowser) { 
      this.startClientSideProcessing();
    }
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
