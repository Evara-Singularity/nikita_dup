import { Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, makeStateKey, TransferState } from '@angular/platform-browser';
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
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    private route: ActivatedRoute) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.getBigDealData();
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