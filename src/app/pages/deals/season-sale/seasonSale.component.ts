/**
 * Created by Abhishek on 19/12/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const SSD = makeStateKey<any>('seasonsaledata');
// import * as $ from "jquery";
declare let $: any;
@Component({
  selector: 'amazing-deal',
  templateUrl: 'seasonSale.html',
  styleUrls: ['seasonSale.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SeasonSaleComponent {
  isServer: boolean;
  isBrowser: boolean;
  SeasonSaleData:any;
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private title:Title,public router: Router,private dealsService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getSeasonSaleData();
  }

  ngOnInit(){
    

  }
  getSeasonSaleData(){
    if (this._tState.hasKey(SSD)) {
      this.SeasonSaleData = this._tState.get(SSD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.dealsService.getSeasonSaleData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.SeasonSaleData = data;
          if(this.isServer){
            this._tState.set(SSD, {data : "'" + this.SeasonSaleData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.freshData=data.text();
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
      this._tState.remove(SSD);
    }
  }
}
