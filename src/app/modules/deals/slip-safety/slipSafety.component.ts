import { Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: "slipSafety",
  templateUrl: "slipSafety.html",
  styleUrls: ["slipSafety.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SlipSafetyComponent {
  isServer: boolean;
  isBrowser: boolean;
  slipSafetyData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document) {

    this.isServer = isPlatformServer(this.platformId);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.getSlipSafetyData();
    this.setMetas();
    this.intializeClicks();
  }

  intializeClicks() {
    if (!this.isServer) {
      setTimeout(function () {
        (<HTMLElement>document.querySelector(".tab_num > div")).style.display =
          "none"; //.hide();
        (<HTMLElement>(
          document.querySelector(".tab_num > div:first-child")
        )).style.display = "block"; //.show();
        document.querySelector("li:first-child").classList.add("active");
        document.querySelector("li").addEventListener("click", (e) => {
          let className = (<HTMLElement>e.currentTarget).className;
          let class_num = className.split(" ");
          if (class_num.length == 1) {
            (<HTMLElement>(
              document.querySelector(".tab_num .wp-100")
            )).style.display = "none"; //.hide();
            (<HTMLElement>(
              document.querySelector(".tab_num div." + className)
            )).style.display = "block"; //.show();
            document.querySelector("li").classList.remove("active");
            document.querySelector("li." + className).classList.add("active");
          }
        });
      }, 3000);
    }
  }

  setMetas() {
    this.title.setTitle("Avail Safety Products Offers and Deals at Moglix.com");
    this.meta.addTag({ name: "description", content: "The Safety offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products." });
    this.meta.addTag({ name: "og:description", content: "The Safety offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products." });
    this.meta.addTag({ name: "og:title", content: "Avail Safety Products Offers and Deals at Moglix.com" });
    this.meta.addTag({ name: "og:url", content: CONSTANTS.PROD+"/deals/slpsafety" });
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    } 
  }

  getSlipSafetyData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        console.log(JSON.stringify(rawData, null, 2));
        if (rawData && !rawData["data"]["error"]) {
          this.slipSafetyData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
          }, 0);
        } else {
          console.log("SlipSafetyComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("SlipSafetyComponent API data catch error", error);
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