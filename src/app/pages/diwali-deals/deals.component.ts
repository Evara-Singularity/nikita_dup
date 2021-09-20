import { Component, ViewEncapsulation, Renderer2, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta, makeStateKey } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
const DSD = makeStateKey<any>('dealsdata');

declare let $: any;

@Component({
  selector: 'deals',
  templateUrl: 'deals.html',
  styleUrls: ['deals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DealsComponent {
  isServer: boolean;
  isBrowser: boolean;
  dealsData: any;

  constructor(
    private meta: Meta,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;

    this.getDealsData();

    this.title.setTitle("Pre Diwali Offers on Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Pre Diwali Offers on Moglix.com." });
    this.meta.addTag({ "property": "og:description", "content": "Presenting pre Diwali sale with special Diwali offers on the best industrial products. Get lowest price deals on our top picks of the day and brands." });
    this.meta.addTag({ "property": "og:url", "content": CONSTANTS.PROD+"/diwali-deals" });
    this.meta.addTag({ "name": "description", "content": "Presenting pre Diwali sale with special Diwali offers on the best industrial products. Get lowest price deals on our top picks of the day and brands." });
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    }
  }

  getDealsData() {
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.dealsData = rawData['data'][0];;
        if (!this.isServer) {
          setTimeout(() => {
            if (document.querySelector(".moglix-adv")) {
              document.querySelector(".moglix-adv").addEventListener('click', (e) => {
                this.router.navigateByUrl('/electricals/fans/211530000?campname=Fans&Blowers-ViewAll&camplink=Home-Page-CategoryProduct#');
              });
            }
          }, 1000);
        }
      } else {
        console.log('Covid19Component API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      console.log('Covid19Component API data catch error', error);
    });
  }

}
