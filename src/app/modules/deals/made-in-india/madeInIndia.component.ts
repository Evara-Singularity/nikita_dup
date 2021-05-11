/**
 * Created by Abhishek on 19/12/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const MIID = makeStateKey<any>('miadata');

declare let $: any;

@Component({
  selector: 'made-in-india',
  templateUrl: 'madeInIndia.html',
  styleUrls: ['madeInIndia.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MadeInIndiaComponent {
  isServer: boolean;
  isBrowser: boolean;
  madeInIndiaData:any;
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object,private title:Title,public router: Router,private dealsService:CommonDealsService, private meta: Meta){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getMadeInIndiaData();

    this.title.setTitle("Republic Day Deals - Moglix.com");
    this.meta.addTag({"name":"description","content":"Celebrate India's pride with best Indian brands and products manufactured exclusively in India. Explore the Made in India range at Moglix.com."});

  }

  ngOnInit(){
  }

  getMadeInIndiaData(){
    if (this._tState.hasKey(MIID)) {
      this.madeInIndiaData = this._tState.get(MIID, {data : ""}).data;
      setTimeout(() => {
        this.initializeClicks();
        this.reinsertLinks();
      }, 0);
		}
		else {
        this.dealsService.getMadeInIndiaData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.madeInIndiaData = data;
          if(this.isServer){
            this._tState.set(MIID, {data : "'" + this.madeInIndiaData + "'"});
          }
          setTimeout(() => {
            this.initializeClicks();
            this.reinsertLinks();            
          }, 0);
        }
      )
    }
  }

  initializeClicks() {
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
      this._tState.remove(MIID);
    }
  }
}
