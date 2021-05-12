import { Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
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
export class AmazingDealsComponent {

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
    private route: ActivatedRoute) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.getAmazingDealsData();
    this.setMetas();
  }

  setMetas() {
    this.title.setTitle("Amazing Deals and Offers on Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Amazing deals and offers on all industrial tools and equipment at Moglix.com." });
    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this._router.url;
    this._renderer2.appendChild(this._document.head, links);
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