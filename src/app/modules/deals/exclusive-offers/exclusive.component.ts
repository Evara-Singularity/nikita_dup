import { Component, ViewEncapsulation, Renderer2, Inject, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: "exclusive",
  templateUrl: "exclusive.html",
  styleUrls: ["exclusive.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ExclusiveComponent {
  isServer: boolean;
  isBrowser: boolean;
  freshData: any;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private _document,
    private _renderer2: Renderer2,
    private meta: Meta,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.getFreshData();
    this.setMetas();
  }

  setMetas() {
    this.title.setTitle("Avail Exclusive Offers and Deals at Moglix.com");
    this.meta.addTag({ property: "og:title", content: "Avail Exclusive Offers and Deals at Moglix.com" });
    this.meta.addTag({ property: "og:description", content: "The exclusive offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products." });
    this.meta.addTag({ property: "og:url", content: CONSTANTS.PROD + ENDPOINTS.EXCLU_OFF });
    this.meta.addTag({ name: "description", content: "The exclusive offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products." });
    if (this.isServer) {
      let links = this._renderer2.createElement("link");
      links.rel = "canonical";
      let href = CONSTANTS.PROD + this.router.url.split("?")[0].split("#")[0].toLowerCase();
      links.href = href;
      this._renderer2.appendChild(this._document.head, links);
    }
  }


  getFreshData() {
    // data received by layout resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.freshData = rawData['data'][0];
        setTimeout(() => {
          this.reinsertLinks();
        }, 0);
      } else {
        // console.log('ExclusiveComponent API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      console.log('ExclusiveComponent API data catch error', error);
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