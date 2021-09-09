import { Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
@Component({
  selector: 'amazing-deal',
  templateUrl: 'amazingDeals.html',
  styleUrls: ['amazingDeals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AmazingDealsComponent implements OnInit, AfterViewInit  {

  isServer: boolean;
  isBrowser: boolean;
  AmazingDealsData: any;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private title: Title,
    public router: Router,
    private _renderer2: Renderer2,
    private _router: Router, @Inject(DOCUMENT)
    private _document,
    private meta: Meta,
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute) {

    this.isServer = isPlatformServer(this.platformId);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.getAmazingDealsData();
    this.setMetas();
    this.initializeClicks()
  }

  ngAfterViewInit(){
  }

  ngOnInit(){
   
  }

  setMetas() {
    this.title.setTitle("Amazing Deals and Offers on Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Amazing deals and offers on all industrial tools and equipment at Moglix.com." });
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links);
    }
  }

  initializeClicks() {

    let tab = this.activatedRoute.snapshot.queryParams['tab'] || 1;
    if (tab < 1 || tab > 6){
      tab = 1;
    }
      
    if (this.isBrowser) {

      if ((<HTMLElement>document.querySelector('.tab_num > div')))
        (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();

      if ((<HTMLElement>document.querySelector('.tab_num > div:first-child')))
        (<HTMLElement>document.querySelector('.tab_num > div:first-child')).style.display = "block";//.show();
        
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


  getAmazingDealsData() {
    // data received by layout resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.AmazingDealsData = rawData['data'][0];
        setTimeout(() => {
          this.reinsertLinks();
        }, 0);

      } else {
        console.log('AmazingDealsComponent API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      console.log('AmazingDealsComponent API data catch error', error);
    });
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
}