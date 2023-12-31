import { Component, ViewEncapsulation, Inject, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: "best-deal",
  templateUrl: "bestDeals.html",
  styleUrls: ["bestDeals.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BestDealComponent {
  isServer: boolean;
  isBrowser: boolean;
  bestDealData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    public router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer
    this.isBrowser = _commonService.isBrowser;
    this.getBestDealData();
    this.setMetas();
  }

  setMetas() {
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    }  
  }

  getBestDealData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        if (rawData && !rawData["data"]["error"]) {
          this.bestDealData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
          }, 0);

        } else {
          console.log("BestDealComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("BestDealComponent API data catch error", error);
      }
    );
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