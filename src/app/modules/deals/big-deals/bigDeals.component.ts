import { Component, ViewEncapsulation, Inject, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
const BDD = makeStateKey<any>('bigdealdata');

@Component({
  selector: "big-deal",
  templateUrl: "bigDeals.html",
  styleUrls: ["bigDeals.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BigDealComponent {
  isServer: boolean;
  isBrowser: boolean;
  bigDealData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    private _tState: TransferState,
    public router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.getBigDealData();
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

  getBigDealData() {
    // data received by layout resolver
    this.route.data.subscribe((rawData) => {
      if (rawData && !rawData['data']['error']) {
        this.bigDealData = rawData['data'][0];
        setTimeout(() => {
          this.reinsertLinks();
        }, 0);

      } else {
        console.log('BigDealComponent API data error', rawData);
        this.router.navigateByUrl('/');
      }
    }, error => {
      console.log('BigDealComponent API data catch error', error);
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

  ngAfterViewInit() {
    if (this.isBrowser) {
      this._tState.remove(BDD);
    }
  }
}