/**
 * Created by Kuldeep on 4/4/17.
 */

import {Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import  { CommonDealsService } from 'src/app/pages/deals/common-deals.service';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import CONSTANTS from 'src/app/config/constants';
//import { API } from "../../../config/apiConfig";
const DD = makeStateKey<any>('dealsdata');
// import * as $ from "jquery";
declare let $: any;
@Component({
  selector: 'deals',
  templateUrl: 'deals.html',
  styleUrls: ['deals.scss'],
  encapsulation: ViewEncapsulation.None
})

export class DealsComponent {
  isServer: boolean;
  isBrowser: boolean;
  dealsData:any;
  // isServer:boolean = typeof window != undefined ? false : true;

  constructor(private elementRef: ElementRef,private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private title:Title,public router: Router,private dealsService:CommonDealsService, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, public _router: Router, private meta: Meta){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getDealsData();
  }



  getDealsData(){
    this.title.setTitle("Deal of The Day - Exclusive Online Offers & Discounts - Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Check out the best deals of the day, online offers & discounts on various industrial supplies such as safety, electrical, lighting, gardening, hand tools, power tools, measurement & testing and more."});
    this.meta.addTag({ "name": "og:title", "content": "Deal of The Day - Exclusive Online Offers & Discounts - Moglix.com"});
    this.meta.addTag({ "name": "og:description", "content": "Check out the best deals of the day, online offers & discounts on various industrial supplies such as safety, electrical, lighting, gardening, hand tools, power tools, measurement & testing and more."});
    this.meta.addTag({ "name": "og:url", "content": "https://www.moglix.com" + this._router.url });
    
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this._router.url;
    this._renderer2.appendChild(this._document.head, links);
    if (this._tState.hasKey(DD)) {
      this.dealsData = this._tState.get(DD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
      if(!this.isServer){
        setTimeout( ()=> {
            document.querySelector(".moglix-adv").addEventListener('click', (e) => {
            this.router.navigateByUrl('/electricals/fans/211530000?campname=Fans&Blowers-ViewAll&camplink=Home-Page-CategoryProduct#');
          });
        },1000);
      }
		} else {
      this.dealsService.getDealsData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.dealsData = data;
          if(this.isServer){
            this._tState.set(DD, {data : "'" + this.dealsData + "'"});
          }
          // this.dealsData=data.text();
          if(!this.isServer){
            setTimeout( ()=> {
              if(document.querySelector(".moglix-adv")) {

                document.querySelector(".moglix-adv").addEventListener('click', (e) => {
                  this.router.navigateByUrl('/electricals/fans/211530000?campname=Fans&Blowers-ViewAll&camplink=Home-Page-CategoryProduct#');
                });
              }
            },1000);
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
        }
      )
    }
  }
  reinsertLinks() {
		const links = <HTMLAnchorElement[]>this.elementRef.nativeElement.getElementsByTagName('a');
	
		if (links) {
		  const linksInitialLength = links.length;
		  for (let i = 0; i < linksInitialLength; i++) {
			const link = links[i];
	
			if (link.host === window.location.host) {
			  this._renderer2.listen(link, 'click', event => {
				event.preventDefault();
				this.router.navigate([
				  link.href
					.replace(link.host, '')
					.replace(link.protocol, '')
					.replace('//', '')
				]);
			  });
			}
		  }
		}
  }
  ngAfterViewInit() {
    if (this.isBrowser) {
      this._tState.remove(DD);
    }
  }
}
