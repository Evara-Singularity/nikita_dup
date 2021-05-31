import { Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';

@Component({
  selector: "special",
  templateUrl: "special.html",
  styleUrls: ["special.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SpecialComponent {
  isServer: boolean;
  isBrowser: boolean;
  specialData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private meta: Meta,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.getSpecialData();
    this.setMetas();
    this.initializeClicks();
  }
  
  initializeClicks() {
    if (!this.isServer) {
      setTimeout(function () {
        (<HTMLElement>document.querySelector(".tab_num > div")).style.display =
          "none"; //.hide();
        (<HTMLElement>(
          document.querySelector(".tab_num > div:first-child")
        )).style.display = "block"; //.show();
        document.querySelector("li:first-child").classList.add("active");
        document.querySelector("li").addEventListener("click", (e) => {
          const className = (<HTMLElement>e.currentTarget).className;
          const class_num = className.split(" ");
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
    this.title.setTitle("Avail Special Offers and Deals at Moglix.com");
    this.meta.addTag({ name: "description", content: "The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products." });
    this.meta.addTag({ name: "og:description", content: "The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products." });
    this.meta.addTag({ name: "og:title", content: "Avail Special Offers and Deals at Moglix.com" });
    this.meta.addTag({ name: "og:url", content: CONSTANTS.PROD+ENDPOINTS.SPL_OFFR });
  }

  getSpecialData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        // console.log(JSON.stringify(rawData, null, 2));
        if (rawData && !rawData["data"]["error"]) {
          this.specialData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
          }, 0);
        } else {
          console.log("SpecialComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("SpecialComponent API data catch error", error);
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