/**
 * Created by Abhishek on 19/12/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const BDD = makeStateKey<any>('bigdealdata');

// import $ from "jquery";

@Component({
  selector: 'big-deal',
  templateUrl: 'bigDeals.html',
  styleUrls: ['bigDeals.scss'],
  encapsulation: ViewEncapsulation.None
})

export class BigDealComponent {
  isServer: boolean;
  isBrowser: boolean;
  bigDealData:any;
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private title:Title,public router: Router,private dealsService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getBigDealData();
  }

  ngOnInit(){

  }

  getBigDealData(){
    if (this._tState.hasKey(BDD)) {
      this.bigDealData = this._tState.get(BDD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.dealsService.getBigDealData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.bigDealData = data;
          if(this.isServer){
            this._tState.set(BDD, {data : "'" + this.bigDealData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.bigDealData=data.text();
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
      this._tState.remove(BDD);
    }
  }
}
