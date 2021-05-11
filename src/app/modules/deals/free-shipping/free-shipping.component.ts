/**
 * Created by Abhishek on 4/4/17.
 */

import {Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef} from '@angular/core';
import { Router} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const FD = makeStateKey<any>('freshdata');
// import $ from "jquery";
declare let $: any;

@Component({
  selector: 'new-year',
  templateUrl:'free-shipping.html',
  styleUrls: ['free-shipping.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FreeShippingComponent {
  isServer: boolean;
  isBrowser: boolean;
  freshData:any;
  constructor(private elementRef: ElementRef,private _renderer2: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private title:Title,public router: Router,private dealsService:CommonDealsService, private meta: Meta){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getFreshData();
    this.title.setTitle("Moglix Free Shipping: Pay Rs. 0 for Best Selling Products");
    this.meta.addTag({"name":"description","content":"Deals that make your New Year celebrations awesome. Explore wide range of new year offers and enjoy amazing discounts on industrial supplies."});
  }

  ngOnInit(){
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

  getFreshData(){
    if (this._tState.hasKey(FD)) {
      this.freshData = this._tState.get(FD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.dealsService.getFreshData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.freshData = data;
          if(this.isServer){
            this._tState.set(FD, {data : "'" + this.freshData + "'"});
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
      this._tState.remove(FD);
    }
  }
}
