import { Component, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FooterService } from 'src/app/utils/services/footer.service';
import { DataService } from 'src/app/utils/services/data.service';
import CONSTANTS from 'src/app/config/constants';

@Component({
    selector: 'industry-store',
    templateUrl: './industryStore.html',
    styleUrls: ['./industryStore.scss']
})

export class IndustryStoreComponent{
  isServer: boolean;
  isBrowser: boolean;
  showchild: boolean = false;
  manufacture: boolean = false;
  healthcare: boolean = false;
  agriculture: boolean = false;
  officesupply: boolean = false;
  catname:string="Manufacturing & Production";
  indType:string='manufacture';
  API:{};
  data;
  bannerData;
  elementData;
  public isAllListShow:boolean;
  constructor(@Inject(PLATFORM_ID) platformId, public footerService: FooterService, private _renderer2: Renderer2, @Inject(DOCUMENT) private _document, private _router: Router, private title:Title, private meta: Meta,private dataService: DataService){
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.title.setTitle("Industry Store - Moglix.com");
    this.meta.addTag({"name":"description","content":"Presenting Industry Store at Moglix where you can browse through our trending categories, brands and products in just a click. Explore now to know more."});
  }


  togglestore(){
    this.showchild = !this.showchild;
  }
  
  activetab(type){
    this.indType=type;
    if(this.indType === 'manufacture'){
      this.catname ="Manufacturing & Production"
    }
    else if(this.indType === 'healthcare') {
      this.catname ="Healthcare & Medical"
    }
    else if(this.indType === 'agriculture') {
      this.catname ="Agriculture & Farming"
    }
    else if(this.indType === 'officesupply') {
      this.catname ="Office & Admin Supply"
    }
    else{
      this.catname ="Manufacturing & Production"
    }
   }
  ngOnInit(){
    this.API = CONSTANTS;
    this.getStoreData();
    if(this.isBrowser){
      // window.addEventListener('scroll', this.scrollHandler, {passive: true});
    }
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this._router.url;
    this._renderer2.appendChild(this._document.head, links);

    if(this.isBrowser){
      if(window.outerWidth <= 768) {
        this.footerService.setFooterObj({footerData: false});
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
      }else{
        this.footerService.setFooterObj({footerData: false});
        this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
      }
    }
    if(this.isServer){
      this.footerService.setFooterObj({footerData: false});
      this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
    }
  }
  getStoreData(){
    this.getIndustryStoreData().subscribe((res)=>{
      this.showList(false);
      if (res['status'] && res['data'] && res['data'][0]['block_data']){
        this.data = res['data'][0]['block_data'];
        //top banner block
        this.bannerData = this.data['main_banner']['data'];
        //elements block
        this.elementData =this.data['element_block']['data'];
      }
    })
  }
  showList(flag?)
    {
      this.isAllListShow = flag != undefined ? flag : !this.isAllListShow;
    }
  getIndustryStoreData():Observable<{}>{
    return this.dataService.callRestful("GET",CONSTANTS.NEW_MOGLIX_API+"/category/getparentcategoryjsonbody?requestType=industry-store_m");
  }
  navigateTo(url) {
    if (url) { 
      this._router.navigate(['/' + url]);
    }
  }
  ngOnDestroy(){
    if(this.isBrowser){
      // window.removeEventListener("scroll", this.scrollHandler);
    }
  }
}