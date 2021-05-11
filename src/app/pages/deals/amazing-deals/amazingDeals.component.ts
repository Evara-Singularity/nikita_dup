/**
 * Created by Abhishek on 19/12/17.
 */

import {Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import CONSTANTS from 'src/app/config/constants';
import { CommonDealsService } from '../common-deals.service';
//import { API } from "../../../../config/apiConfig";
const AZD = makeStateKey<any>('amazingdealdata');

// import $ from "jquery";


@Component({
  selector: 'amazing-deal',
  templateUrl: 'amazingDeals.html',
  styleUrls: ['amazingDeals.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AmazingDealsComponent {
  isServer: boolean;
  isBrowser: boolean;
  AmazingDealsData:any;
  constructor(private elementRef: ElementRef,private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private title:Title,public router: Router,private dealsService:CommonDealsService, private _renderer2: Renderer2, private _router: Router, @Inject(DOCUMENT) private _document, private meta: Meta){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getAmazingDealsData();
  }

  ngOnInit(){

    this.title.setTitle("Amazing Deals and Offers on Moglix.com");
    this.meta.addTag({"name":"description","content":"Amazing deals and offers on all industrial tools and equipment at Moglix.com."});

    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this._router.url;
    this._renderer2.appendChild(this._document.head, links);
  }

  getAmazingDealsData(){
    if (this._tState.hasKey(AZD)) {
      this.AmazingDealsData = this._tState.get(AZD, {data : ""}).data;
      setTimeout(() => {
				// wait for DOM rendering
				this.reinsertLinks();
			},0);
		}
		else {
      this.dealsService.getAmazingDealsData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data => {
          this.AmazingDealsData = data;
          if(this.isServer){
            this._tState.set(AZD, {data : "'" + this.AmazingDealsData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.AmazingDealsData=data.text();
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
      this._tState.remove(AZD);
    }
  }
}
