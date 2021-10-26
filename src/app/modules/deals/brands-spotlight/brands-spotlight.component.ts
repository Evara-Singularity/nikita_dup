import { Component, ViewEncapsulation, Inject, Renderer2, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
@Component({
  selector: "special-deal",
  templateUrl: "brands-spotlight.html",
  styleUrls: ["brands-spotlight.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BrandSpotlightComponent {
  isServer: boolean;
  isBrowser: boolean;
  brandSpotlightData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    private meta: Meta,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.setMetas();
    this.getBrandData();
  }

  tabClassList = ['power', 'automative', 'plumbing', 'safety'];
  
  initializeClicks() {
    let tab = this.activatedRoute.snapshot.queryParams["tab"] || 1;
    if (tab < 1 || tab > 6) tab = 1;
    if (!this.isServer) {
      document.querySelector("li").classList.remove("active");
      (<HTMLElement>document.querySelector(".tab_num > div")).style.display =
        "none"; //.hide();
      (<HTMLElement>(
        document.querySelector(".tab_num > div:nth-child(" + tab + ")")
      )).style.display = "block"; //.show();
      document
        .querySelector("li:nth-child(" + tab + ")")
        .classList.add("active");
      const htmlLiCollection = document.getElementsByTagName("li");
      [].forEach.call(htmlLiCollection, (eachHtmlEl, index) => {
        eachHtmlEl.addEventListener("click", (e) => {
          this.resetClass();
          eachHtmlEl.classList.add("active");
          const tab = document.querySelector('.tab_num .' + this.tabClassList[index]);
          tab['style'].display = 'block';
        });
      })
    }
  }

  resetClass() {
    const li = document.getElementsByTagName('li');
    [].forEach.call(li, (eachHtmlEl) => {
      eachHtmlEl.classList.remove('active');
    });

    this.tabClassList.forEach(e => {
      const el = document.querySelector('div.' + e);
      el['style'].display = 'none';
    });
  }


  setMetas() {
    this.title.setTitle("Explore Best Offers on Moglix.com");
    this.meta.addTag({ property: "og:title", content: "Best offers and deals on products that simplify living. Explore our huge assortment of B2B products and experience unmatched hospitality." });
    this.meta.addTag({ property: "og:url", content: "www.moglix.com/deals/brands-in-spotlight" });
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    }
  }

  getBrandData() {
    // data received by layout resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.brandSpotlightData = rawData['data'][0];
        setTimeout(() => {
          this.reinsertLinks();
          this.initializeClicks();
        }, 0);

      } else {
        console.log('BrandsSpotlightComponent API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      console.log('BrandSpotlightComponent API data catch error', error);
    });
  }

  reinsertLinks() {
    const links = <HTMLAnchorElement[]>(
      this.elementRef.nativeElement.getElementsByTagName("a")
    );
    if (links) {
      const linksInitialLength = links.length;
      for (let i = 0; i < linksInitialLength; i++) {
        const link = links[i];

        if (link.host === window.location.host) {
          this._renderer2.listen(link, "click", (event) => {
            event.preventDefault();
            this.router.navigate([
              link.href
                .replace(link.host, "")
                .replace(link.protocol, "")
                .replace("//", ""),
            ]);
          });
        }
      }
    }
  }
}