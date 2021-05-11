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
  selector: 'covid19',
  templateUrl: 'covid19.html',
  styleUrls: ['covid19.scss'],
  encapsulation: ViewEncapsulation.None
})

export class Covid19Component {
  isServer: boolean;
  isBrowser: boolean;
  specialData:any;
  isShowLoader: boolean;

  // isServer:boolean = typeof window != undefined ? false : true;
  
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private meta:Meta, private title:Title,public router: Router,private covid19Service:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.isShowLoader = true;
    this.getSpecialData();
    this.title.setTitle("Buy COVID 19 Essential Supplies at Moglix");
    this.meta.addTag({ "name": "description", "content": "Shop online for personal protective equipment to contain the spread of COVID 19. Send in your inquiries today."});
    this.meta.addTag({ "name": "og:description", "content": "Shop online for personal protective equipment to contain the spread of COVID 19. Send in your inquiries today."});
    this.meta.addTag({ "name": "og:title", "content": "Buy COVID 19 Essential Supplies at Moglix"});
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
  getSpecialData(){
    if (this._tState.hasKey(SPD)) {
      this.specialData = this._tState.get(SPD, {data : ""}).data;
      this.isShowLoader = false;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.covid19Service.getSpecialData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.specialData = data;
          if(this.isServer){
            this._tState.set(SPD, {data : "'" + this.specialData + "'"});
          }
          // this.freshData=data.text();
          this.isShowLoader = false;
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
      this._tState.remove(SPD);
    }
  }
}
