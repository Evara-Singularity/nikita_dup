import { Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, makeStateKey, Meta, TransferState } from '@angular/platform-browser';
import { FooterService } from 'src/app/utils/services/footer.service';
import CONSTANTS from 'src/app/config/constants';
import { GlobalLoaderService } from 'src/app/utils/services/global-loader.service';
const CD = makeStateKey<any>('corporatedata');
declare let $: any;

@Component({
  selector: 'corporate',
  templateUrl: 'corporate.html',
  styleUrls: ['corporate.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CorporateComponent {

  isServer: boolean;
  isBrowser: boolean;
  corporateData: any;

  constructor(
    private _tState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private footerService: FooterService,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    private _renderer2: Renderer2,
    private globalLoader: GlobalLoaderService,
    @Inject(DOCUMENT) private _document) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);

    this.getCorporateData();
    this.setMetas();
  }

  ngOnInit() {
    // enable footer
    this.footerService.setFooterObj({ footerData: false });
    this.footerService.footerChangeSubject.next(this.footerService.getFooterObj());
  }

  setMetas() {
    this.title.setTitle("Corporate Gifting Solutiions");
    this.meta.addTag({ name: "description", content: "Moglix, introduces you to its world of innovative corporate gifting solutions, to help corporate race, celebrate every occasion with a broad exuberance." });
    this.meta.addTag({ name: "og:description", content: "Moglix, introduces you to its world of innovative corporate gifting solutions, to help corporate race, celebrate every occasion with a broad exuberance." });
    this.meta.addTag({ name: "og:title", content: "Corporate Gifting Solutiions" });
    this.meta.addTag({ name: "og:url", content: "https://www.moglix.com/corporate-gifting" });

    // set canonical URL
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    }

  }

  getCorporateData() {
    // data received by product resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.corporateData = rawData['data'][0];
      } else {
        console.log('CorporateComponent API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      this.globalLoader.setLoaderState(false);
      console.log('CorporateComponent API data catch error', error);
    });
  }

}
