/**
 * Created by Abhishek on 19/12/17.
 */
import {Component, ViewEncapsulation, Inject, PLATFORM_ID, ElementRef, Renderer2} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState} from '@angular/platform-browser';
import { CommonDealsService } from '../common-deals.service';
const SDD = makeStateKey<any>('specialdealsdata');
// import * as $ from "jquery";
declare let $: any;
@Component({
  selector: 'special-deal',
  templateUrl: 'specialDeals.html',
  styleUrls: ['specialDeals.scss'],
  encapsulation: ViewEncapsulation.None
})

export class SpecialDealsComponent {
  isServer: boolean;
  isBrowser: boolean;
  SpecialDealsData:any;
  // isServer:boolean = typeof window != undefined ? false : true;
  constructor(private elementRef: ElementRef, private renderer: Renderer2, private _tState: TransferState,  @Inject(PLATFORM_ID) private platformId: Object, private meta:Meta,private activatedRoute: ActivatedRoute , private title:Title,public router: Router,private dealsService:CommonDealsService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId); 
    this.getSpecialDealsData();
  }

  ngOnInit(){
    this.title.setTitle("Special Deals - Moglix.com");
    this.meta.addTag({"property":"og:title","content":"Special Deals - Moglix.com"});
   
    this.meta.addTag({"property":"og:url","content":"https://www.moglix.com/deals/special-deals"});
   
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
  getSpecialDealsData(){
    if (this._tState.hasKey(SDD)) {
      this.SpecialDealsData = this._tState.get(SDD, {data : ""}).data;
      setTimeout(() => {
        // wait for DOM rendering
        this.reinsertLinks();
      },0);
		}
		else {
      this.dealsService.getSpecialDealsData({ headerData: {'Content-Type':'text/html'} }).subscribe(
        data=>{
          this.SpecialDealsData = data;
          if(this.isServer){
            this._tState.set(SDD, {data : "'" + this.SpecialDealsData + "'"});
          }
          setTimeout(() => {
            // wait for DOM rendering
            this.reinsertLinks();
          },0);
          // this.SpecialDealsData=data.text();
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
          this.renderer.listen(link, 'click', event => {
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
      this._tState.remove(SDD);
    }
  }
}
