import { Directive } from '@angular/core';

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
    "xxlarge": "p/I/Q/N/d/MINIQNB3IGGC1-xxlarge.jpg",
    "xlarge": "p/I/Q/N/d/MINIQNB3IGGC1-xlarge.jpg",
    "large": "p/I/Q/N/d/MINIQNB3IGGC1-large.jpg",
    "medium": "p/I/Q/N/d/MINIQNB3IGGC1-medium.jpg",
    "small": "p/I/Q/N/d/MINIQNB3IGGC1-small.jpg",
    "thumbnail": "p/I/Q/N/d/MINIQNB3IGGC1-thumbnail.jpg",
    "icon": "p/I/Q/N/d/MINIQNB3IGGC1-icon.jpg",
    "default": "p/I/Q/N/d/MINIQNB3IGGC1.jpg"
  }
*/

@Directive({
  selector: '[enhanceImgByNetwork]'
})
export class EnhanceImgByNetworkDirective {

  constructor() { }
  
}
