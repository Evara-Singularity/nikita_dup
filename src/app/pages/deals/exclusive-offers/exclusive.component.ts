/**
 * Created by Abhishek on 14/10/17.
 */

import {Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import CONSTANTS from 'src/app/config/constants';
import { CommonDealsService } from '../common-deals.service';
//import { API } from '../../../../config/apiConfig';
const EOD = makeStateKey<any>('exclusiveoffersdata');
// import * as $ from "jquery";
declare let $: any;

@Component({
  selector: 'exclusive',
  templateUrl: 'exclusive.html',
  styleUrls: ['exclusive.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ExclusiveComponent {
  isServer: boolean;
  isBrowser: boolean;
  // isServer:boolean = typeof window != undefined ? false : true;
  freshData:any;
  constructor(private elementRef: ElementRef, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private _document, private _renderer2: Renderer2, private meta:Meta,private activatedRoute: ActivatedRoute, private title:Title,public router: Router,private dealsService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getFreshData();
  }

  ngOnInit(){
    this.title.setTitle("Avail Exclusive Offers and Deals at Moglix.com");
    this.meta.addTag({"property":"og:title","content":"Avail Exclusive Offers and Deals at Moglix.com"});
    this.meta.addTag({"property":"og:description","content":"The exclusive offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    this.meta.addTag({"property":"og:url","content":"https://www.moglix.com/deals/exclusive-offers"});
    this.meta.addTag({"name":"description","content":"The exclusive offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    let href = CONSTANTS.PROD + this.router.url.split("?")[0].split("#")[0].toLowerCase();
    links.href = href;
    this._renderer2.appendChild(this._document.head, links);
  }

  getFreshData(){
    if (this._tState.hasKey(EOD)) {
      this.freshData = this._tState.get(EOD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.dealsService.getFreshData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.freshData = data;
          if(this.isServer){
            this._tState.set(EOD, {data : "'" + this.freshData + "'"});
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
      this._tState.remove(EOD);
    }
  }
}
