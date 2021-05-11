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
const FAD = makeStateKey<any>('fresharrivaldata');
// import * as $ from "jquery";
declare let $: any;

@Component({
  selector: 'fresh',
  templateUrl: 'fresh.html',
  styleUrls: ['fresh.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FreshComponent {
  isServer: boolean;
  isBrowser: boolean;
  // isServer:boolean = typeof window != undefined ? false : true;
  freshData:any;
  constructor(private elementRef: ElementRef, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private _document, private _renderer2: Renderer2, private meta:Meta,private activatedRoute: ActivatedRoute, private title:Title,public router: Router,private dealsService: CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getFreshData1();
  }

  ngOnInit(){
    this.title.setTitle("Avail Special Offers and Deals at Moglix.com");
    this.meta.addTag({"property":"og:title","content":"Avail Special Offers and Deals at Moglix.com"});
    this.meta.addTag({"property":"og:description","content":"The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    this.meta.addTag({"property":"og:url","content":"https://www.moglix.com/deals/fresh-arrivals"});
    this.meta.addTag({"name":"description","content":"The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products."});
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    let href = CONSTANTS.PROD + this.router.url.split("?")[0].split("#")[0].toLowerCase();
    links.href = href;
    this._renderer2.appendChild(this._document.head, links);
  }

  initializeClicks() {
    let tab = this.activatedRoute.snapshot.queryParams['tab'] || 1;
    if (tab < 1 || tab > 6)
      tab = 1;
    if (!this.isServer) {
      if ((<HTMLElement>document.querySelector('.tab_num > div')))
        (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
      if ((<HTMLElement>document.querySelector('.tab_num > div:first-child')))
        (<HTMLElement>document.querySelector('.tab_num > div:first-child')).style.display = "block";//.show();
      document.querySelector('li:first-child').classList.add('active');
      if (document.querySelector('ul.emailer-tab')) {
        document.querySelector("ul.emailer-tab").addEventListener('click', function (e) {
          if (e.target && (<HTMLElement>e.target).matches("li")) {
            var className = (<HTMLElement>e.target).className;
            var class_num = className.split(" ");
            if (class_num.length == 1) {
              if ((document.querySelectorAll('.tab_num .wp-100'))) {
                Array.prototype.map.call(document.querySelectorAll('.tab_num .wp-100'), element => {
                  element.style.display = "none";
                })
              }
              if ((<HTMLElement>document.querySelector('.tab_num div.' + className)))
                (<HTMLElement>document.querySelector('.tab_num div.' + className)).style.display = "block";//.show();
              var elems = document.querySelectorAll("ul.emailer-tab li");
              [].forEach.call(elems, function (el) {
                el.classList.remove("active");
              });
              document.querySelector('li.' + className).classList.add('active');
            }
          }
        });
      }
    }
  }

  getFreshData1(){
    if (this._tState.hasKey(FAD)) {
      this.freshData = this._tState.get(FAD, {data : ""}).data;
      setTimeout(() => {
        this.initializeClicks();
        this.reinsertLinks();
      }, 0);
		}
		else {
      this.dealsService.getFreshData1({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.freshData = data;
          if(this.isServer){
            this._tState.set(FAD, {data : "'" + this.freshData + "'"});
          }
          setTimeout(() => {
            this.initializeClicks();
            this.reinsertLinks();
          }, 0);
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
      this._tState.remove(FAD);
    }
  }
}
