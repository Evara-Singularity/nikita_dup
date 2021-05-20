import { Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta, makeStateKey, TransferState } from '@angular/platform-browser';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
const SPD = makeStateKey<any>('specialdata');

declare let $: any;

@Component({
  selector: 'covid19',
  templateUrl: 'covid19.html',
  styleUrls: ['covid19.scss'],
  encapsulation: ViewEncapsulation.None
})

export class Covid19Component {
  isServer: boolean;
  isBrowser: boolean;
  specialData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    private _tState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    private globalLoader: GlobalLoaderService) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);

  }

  ngOnInit() {
    this.createMeta();
    this.getProductApiData();
    this.browserSideCalc();
  }

  browserSideCalc() {
    if (!this.isServer) {
      setTimeout(function () {
        (<HTMLElement>document.querySelector('.tab_num > div')).style.display = "none";//.hide();
        (<HTMLElement>document.querySelector('.tab_num > div:first-child')).style.display = "block";//.show();
        document.querySelector('li:first-child').classList.add('active');
        document.querySelector('li').addEventListener('click', (e) => {
          const className = (<HTMLElement>e.currentTarget).className;
          const class_num = className.split(" ");
          if (class_num.length == 1) {
            (<HTMLElement>document.querySelector('.tab_num .wp-100')).style.display = "none";//.hide();
            (<HTMLElement>document.querySelector('.tab_num div.' + className)).style.display = "block";//.show();
            document.querySelector('li').classList.remove('active');
            document.querySelector('li.' + className).classList.add('active');
          }
        });
      }, 3000);
    }
  }

  getProductApiData() {
    // data received by product resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.specialData = rawData['data'][0];
        setTimeout(() => {
          // wait for DOM rendering
          this.reinsertLinks();
        }, 0);
      } else {
        console.log('Covid19Component API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      this.globalLoader.setLoaderState(false);
      console.log('Covid19Component API data catch error', error);
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

  createMeta() {
    this.title.setTitle("Buy COVID 19 Essential Supplies at Moglix");
    this.meta.addTag({ "name": "description", "content": "Shop online for personal protective equipment to contain the spread of COVID 19. Send in your inquiries today." });
    this.meta.addTag({ "name": "og:description", "content": "Shop online for personal protective equipment to contain the spread of COVID 19. Send in your inquiries today." });
    this.meta.addTag({ "name": "og:title", "content": "Buy COVID 19 Essential Supplies at Moglix" });
    this.meta.addTag({ "name": "og:url", "content": CONSTANTS.PROD+ENDPOINTS.SPL_OFFR });
  }

}
