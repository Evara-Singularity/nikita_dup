/**
 * Created by Abhishek on 19/12/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const BSDD = makeStateKey<any>('bestdealdata');

// import $ from "jquery";

@Component({
  selector: 'best-deal',
  templateUrl: 'bestDeals.html',
  styleUrls: ['bestDeals.scss'],
  encapsulation: ViewEncapsulation.None
})

export class BestDealComponent {
  isServer: boolean;
  isBrowser: boolean;
  bestDealData:any;
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2,private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private title:Title,public router: Router,private dealsService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getBestDealData();
  }

  ngOnInit(){

  }

  getBestDealData(){
    if (this._tState.hasKey(BSDD)) {
      this.bestDealData = this._tState.get(BSDD, {data : ""}).data;
      setTimeout(() => {
				// wait for DOM rendering
				this.reinsertLinks();
			},0);
		}
		else {
      this.dealsService.getBestDealData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.bestDealData = data;
          if(this.isServer){
            this._tState.set(BSDD, { data: "'" + this.bestDealData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.bestDealData=data.text();
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
      this._tState.remove(BSDD);
    }
  }
}
