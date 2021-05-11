/**
 * Created by Abhishek on 19/12/17.
 */

import { Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import CONSTANTS from 'src/app/config/constants';
import { CommonDealsService } from '../common-deals.service';
//import { API } from "../../../../config/apiConfig";  
const BDD = makeStateKey<any>('monsoonsaledata');

// import $ from "jquery";

@Component({
  selector: 'monsoon-sale',
  templateUrl: 'monsoonSale.html',
  styleUrls: ['monsoonSale.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MonsoonSaleComponent {
  isServer: boolean;
  isBrowser: boolean;
  monsoonSaleData:any;
  constructor(private elementRef: ElementRef,private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, private _router: Router, private meta: Meta, private activatedRoute: ActivatedRoute, private title: Title, public router: Router, public dealsService: CommonDealsService) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getMonsoonSaleData();
  }

  ngOnInit(){
    this.title.setTitle("Email Exclusive Deals - Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Email Exclusive Deals - Moglix.com" });

    this.meta.addTag({ "property": "og:url", "content": "https://www.moglix.com/deals/emailer-deals" });

    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this._router.url;
    this._renderer2.appendChild(this._document.head, links);
  }

  getMonsoonSaleData(){
    if (this._tState.hasKey(BDD)) {
      this.monsoonSaleData = this._tState.get(BDD, {data : ""}).data;
      setTimeout(() => {
        this.initializeClicks();
        this.reinsertLinks();
      }, 0);
		}
		else {
      this.dealsService.getMonsoonSaleData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.monsoonSaleData = data;
          if(this.isServer){
            this._tState.set(BDD, {data : "'" + this.monsoonSaleData + "'"});
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
  
  initializeClicks() {
    let tab = this.activatedRoute.snapshot.queryParams['tab'] || 1;
    if (tab < 1 || tab > 6)
      tab = 1;
    if (!this.isServer) {
      document.querySelector('li').classList.remove('active');
      if ((<HTMLElement>document.querySelector('.tab_num > div')))
        (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
      if ((<HTMLElement>document.querySelector('.tab_num > div:nth-child(' + tab + ')')))
        (<HTMLElement>document.querySelector('.tab_num > div:nth-child(' + tab + ')')).style.display = "block";//.show();
      document.querySelector('li:nth-child(' + tab + ')').classList.add('active');
      if (document.querySelector('ul.emailer-tab')) {
        document.querySelector("ul.emailer-tab").addEventListener('click', function (e) {
          if (e.target && (<HTMLElement>e.target).matches("li")) {
            const className = (<HTMLElement>e.target).className;
            const class_num = className.split(" ");
            if (class_num.length == 1) {
              if ((document.querySelectorAll('.tab_num .wp-100'))) {
                Array.prototype.map.call(document.querySelectorAll('.tab_num .wp-100'), element => {
                  element.style.display = "none";
                })
              }
              if ((<HTMLElement>document.querySelector('.tab_num div.' + className)))
                (<HTMLElement>document.querySelector('.tab_num div.' + className)).style.display = "block";//.show();
              const elems = document.querySelectorAll("ul.emailer-tab li");
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

  ngAfterViewInit() {
    if (this.isBrowser) {
      this._tState.remove(BDD);
    }
  }
}
