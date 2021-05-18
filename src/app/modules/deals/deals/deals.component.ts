import CONSTANTS from '@app/config/constants';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef } from '@angular/core';

@Component({
  selector: 'deals',
  templateUrl: 'deals.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None
})
export class DealsComponent {
  isServer: boolean;
  isBrowser: boolean;
  dealsData: any;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private title: Title,
    public router: Router,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private route: ActivatedRoute,
    private meta: Meta) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);

    this.setMetas();
    this.getDealsData();

  }

  getDealsData() {
    // data received by layout resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.dealsData = rawData['data'][0];
        setTimeout(() => {
          this.reinsertLinks();
        }, 0);

        if (!this.isServer) {
          setTimeout(() => {
            document.querySelector(".moglix-adv").addEventListener('click', (e) => {
              this.router.navigateByUrl('/electricals/fans/211530000?campname=Fans&Blowers-ViewAll&camplink=Home-Page-CategoryProduct#');
            });
          }, 1000);
        }
      } else {
        console.log('DealsComponent API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      console.log('DealsComponent API data catch error', error);
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

  setMetas() {

    this.title.setTitle("Deal of The Day - Exclusive Online Offers & Discounts - Moglix.com");
    this.meta.addTag({ "name": "description", "content": "Check out the best deals of the day, online offers & discounts on various industrial supplies such as safety, electrical, lighting, gardening, hand tools, power tools, measurement & testing and more." });
    this.meta.addTag({ "name": "og:title", "content": "Deal of The Day - Exclusive Online Offers & Discounts - Moglix.com" });
    this.meta.addTag({ "name": "og:description", "content": "Check out the best deals of the day, online offers & discounts on various industrial supplies such as safety, electrical, lighting, gardening, hand tools, power tools, measurement & testing and more." });
    this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD + this.router.url });

    let links = this._renderer2.createElement('link');
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this.router.url;
    this._renderer2.appendChild(this._document.head, links);
  }
}