import { Component, ViewEncapsulation, Renderer2, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
@Component({
  selector: "monsoon-sale",
  templateUrl: "monsoonSale.html",
  styleUrls: ["monsoonSale.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class MonsoonSaleComponent {
  isServer: boolean;
  isBrowser: boolean;
  monsoonSaleData: any;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private _router: Router,
    private meta: Meta,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.getMonsoonSaleData();
    this.setMetas();
  }

  setMetas() {
    this.title.setTitle("Email Exclusive Deals - Moglix.com");
    this.meta.addTag({
      property: "og:title",
      content: "Email Exclusive Deals - Moglix.com",
    });

    this.meta.addTag({
      property: "og:url",
      content: "https://www.moglix.com/deals/emailer-deals",
    });
    if (this.isServer) {
      let links = this._renderer2.createElement("link");
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this._router.url;
      this._renderer2.appendChild(this._document.head, links);
    }
  }

  getMonsoonSaleData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        if (rawData && !rawData["data"]["error"]) {
          this.monsoonSaleData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
          }, 0);
        } else {
          console.log("MonsoonSaleComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("MonsoonComponent API data catch error", error);
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

  initializeClicks() {
    let tab = this.activatedRoute.snapshot.queryParams["tab"] || 1;
    if (tab < 1 || tab > 6) tab = 1;
    if (!this.isServer) {
      document.querySelector("li").classList.remove("active");
      if (<HTMLElement>document.querySelector(".tab_num > div"))
        (<HTMLElement>document.querySelector(".tab_num > div")).style.display =
          "none"; //.hide();
      if (
        <HTMLElement>(
          document.querySelector(".tab_num > div:nth-child(" + tab + ")")
        )
      )
        (<HTMLElement>(
          document.querySelector(".tab_num > div:nth-child(" + tab + ")")
        )).style.display = "block"; //.show();
      document
        .querySelector("li:nth-child(" + tab + ")")
        .classList.add("active");
      if (document.querySelector("ul.emailer-tab")) {
        document
          .querySelector("ul.emailer-tab")
          .addEventListener("click", function (e) {
            if (e.target && (<HTMLElement>e.target).matches("li")) {
              const className = (<HTMLElement>e.target).className;
              const class_num = className.split(" ");
              if (class_num.length == 1) {
                if (document.querySelectorAll(".tab_num .wp-100")) {
                  Array.prototype.map.call(
                    document.querySelectorAll(".tab_num .wp-100"),
                    (element) => {
                      element.style.display = "none";
                    }
                  );
                }
                if (
                  <HTMLElement>(
                    document.querySelector(".tab_num div." + className)
                  )
                )
                  (<HTMLElement>(
                    document.querySelector(".tab_num div." + className)
                  )).style.display = "block"; //.show();
                const elems = document.querySelectorAll("ul.emailer-tab li");
                [].forEach.call(elems, function (el) {
                  el.classList.remove("active");
                });
                document
                  .querySelector("li." + className)
                  .classList.add("active");
              }
            }
          });
      }
    }
  }
}