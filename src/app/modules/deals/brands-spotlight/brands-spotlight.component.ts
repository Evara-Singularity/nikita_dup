/**
 * Created by Abhishek on 19/12/17.
 */
import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const BOD = makeStateKey<any>('brandSpotlightData');
// import * as $ from "jquery";
declare let $: any;
@Component({
  selector: 'special-deal',
  templateUrl: 'brands-spotlight.html',
  styleUrls: ['brands-spotlight.scss'],
  encapsulation: ViewEncapsulation.None
})

export class BrandSpotlightComponent {
  isServer: boolean;
  isBrowser: boolean;
  brandSpotlightData:any;
  // isServer:boolean = typeof window != undefined ? false : true;
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private meta:Meta,private activatedRoute: ActivatedRoute , private title:Title,public router: Router,private dealsService: CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getBrandData();
  }

  ngOnInit(){
    this.title.setTitle("Explore Best Offers on Moglix.com");
    this.meta.addTag({"property":"og:title","content":"Best offers and deals on products that simplify living. Explore our huge assortment of B2B products and experience unmatched hospitality."});
   
    this.meta.addTag({"property":"og:url","content":"www.moglix.com/deals/brands-in-spotlight"});
   
     let tab = this.activatedRoute.snapshot.queryParams['tab'] || 1;
     if(tab < 1 || tab > 6 )
       tab = 1;
     if(!this.isServer){
       setTimeout(function(){
         document.querySelector('li').classList.remove('active');
         (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
         (<HTMLElement>document.querySelector('.tab_num > div:nth-child(' + tab + ')')).style.display = "block";//.show();
         document.querySelector('li:nth-child(' + tab + ')').classList.add('active');
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
  getBrandData(){
    if (this._tState.hasKey(BOD)) {
      this.brandSpotlightData = this._tState.get(BOD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.dealsService.getBrandData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.brandSpotlightData = data;
          if(this.isServer){
            this._tState.set(BOD, {data : "'" + this.brandSpotlightData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.BestOfferData=data.text();
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
      this._tState.remove(BOD);
    }
  }
}
