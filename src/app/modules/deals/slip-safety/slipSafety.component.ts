/**
 * Created by Kuldeep on 4/4/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const SSD = makeStateKey<any>('slipsafetydata');
// import * as $ from "jquery";
declare let $: any;

@Component({
  selector: 'slipSafety',
  templateUrl: 'slipSafety.html',
  styleUrls: ['slipSafety.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SlipSafetyComponent {
  isServer: boolean;
  isBrowser: boolean;
  slipSafetyData:any;

  // isServer:boolean = typeof window != undefined ? false : true;
  
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private meta:Meta, private title:Title,public router: Router,private slipSafetyService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getSlipSafetyData();
    this.title.setTitle("Avail SlipSafety Offers and Deals at Moglix.com");
    this.meta.addTag({ "name": "description", "content": "The slipSafety offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    this.meta.addTag({ "name": "og:description", "content": "The slipSafety offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    this.meta.addTag({ "name": "og:title", "content": "Avail SlipSafety Offers and Deals at Moglix.com"});
    this.meta.addTag({ "name": "og:url", "content": "https://www.moglix.com/deals/slipSafety-offer"});
  }

  ngOnInit(){
    if(!this.isServer){
      setTimeout(function(){
        (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
        (<HTMLElement>document.querySelector('.tab_num > div:first-child')).style.display = "block";//.show();
        document.querySelector('li:first-child').classList.add('active');
        document.querySelector('li').addEventListener('click',(e)=> {
          let className = (<HTMLElement>e.currentTarget).className;
          let class_num = className.split(" ");
          if(class_num.length == 1){
            (<HTMLElement>document.querySelector('.tab_num .wp-100')).style.display = "none";//.hide();
            (<HTMLElement>document.querySelector('.tab_num div.' + className )).style.display = "block";//.show();
            document.querySelector('li').classList.remove('active');
            document.querySelector('li.' + className).classList.add('active');
          }
        });
      },3000);
    }
  }

  getSlipSafetyData(){
    if (this._tState.hasKey(SSD)) {
      this.slipSafetyData = this._tState.get(SSD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.slipSafetyService.getSlipSafetyData().subscribe(
        data=>{
          this.slipSafetyData = data;
          if(this.isServer){
            this._tState.set(SSD, {data : "'" + this.slipSafetyData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.slipSafetyData=data.text();
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
