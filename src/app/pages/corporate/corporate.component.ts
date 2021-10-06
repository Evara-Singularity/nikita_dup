import { Component, ViewEncapsulation, Renderer2, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, makeStateKey, Meta, TransferState } from '@angular/platform-browser';
import { FooterService } from '@app/utils/services/footer.service';
import CONSTANTS from '@app/config/constants';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { CommonService } from '@app/utils/services/common.service';
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
    private meta: Meta,
    private footerService: FooterService,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    private _renderer2: Renderer2,
    private globalLoader: GlobalLoaderService,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;

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
    this.meta.addTag({ name: "og:url", content: CONSTANTS.PROD+"/corporate-gifting" });

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
