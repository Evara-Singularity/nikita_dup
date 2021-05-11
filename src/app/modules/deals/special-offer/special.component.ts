/**
 * Created by Kuldeep on 4/4/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const SPD = makeStateKey<any>('specialdata');
// import * as $ from "jquery";
declare let $: any;

@Component({
  selector: 'special',
  templateUrl: 'special.html',
  styleUrls: ['special.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SpecialComponent {
  isServer: boolean;
  isBrowser: boolean;
  specialData:any;

  // isServer:boolean = typeof window != undefined ? false : true;
  
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private meta:Meta, private title:Title,public router: Router,private specialService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getSpecialData2();
    this.title.setTitle("Avail Special Offers and Deals at Moglix.com");
    this.meta.addTag({ "name": "description", "content": "The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    this.meta.addTag({ "name": "og:description", "content": "The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    this.meta.addTag({ "name": "og:title", "content": "Avail Special Offers and Deals at Moglix.com"});
    this.meta.addTag({ "name": "og:url", "content": "https://www.moglix.com/deals/special-offer"});
  }

  ngOnInit(){
    if(!this.isServer){
      setTimeout(function(){
        (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
        (<HTMLElement>document.querySelector('.tab_num > div:first-child')).style.display = "block";//.show();
        document.querySelector('li:first-child').classList.add('active');
        document.querySelector('li').addEventListener('click',(e)=> {
          const className = (<HTMLElement>e.currentTarget).className;
          const class_num = className.split(" ");
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
  getSpecialData2(){
    if (this._tState.hasKey(SPD)) {
      this.specialData = this._tState.get(SPD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.specialService.getSpecialData2({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.specialData = data;
          if(this.isServer){
            this._tState.set(SPD, {data : "'" + this.specialData + "'"});
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
      this._tState.remove(SPD);
    }
  }
}
