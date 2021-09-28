import {Component, ViewEncapsulation, Renderer2, Inject, ElementRef} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: "fresh",
  templateUrl: "fresh.html",
  styleUrls: ["fresh.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class FreshComponent {
  isServer: boolean;
  isBrowser: boolean;
  freshData: any;

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private _document,
    private _renderer2: Renderer2,
    private meta: Meta,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    public _commonService:CommonService) {
      
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.getFreshData();
    this.setMetas();
  }

  setMetas() {
    this.title.setTitle("Avail Special Offers and Deals at Moglix.com");
    this.meta.addTag({
      property: "og:title",
      content: "Avail Special Offers and Deals at Moglix.com",
    });
    this.meta.addTag({
      property: "og:description",
      content:
        "The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products.",
    });
    this.meta.addTag({
      property: "og:url",
      content: "https://www.moglix.com/deals/fresh-arrivals",
    });
    this.meta.addTag({
      name: "description",
      content:
        "The special offers and, deals that you cannot resist are now on Moglix.com. Enjoy lucrative combos and, discounts, daily/weekly, on premium products.",
    });
    if (this.isServer) {
      let links = this._renderer2.createElement("link");
      links.rel = "canonical";
      let href =
        CONSTANTS.PROD +
        this.router.url.split("?")[0].split("#")[0].toLowerCase();
      links.href = href;
      this._renderer2.appendChild(this._document.head, links);
    }
  }

  initializeClicks() {
    let tab = this.activatedRoute.snapshot.queryParams["tab"] || 1;
    if (tab < 1 || tab > 6) tab = 1;
    if (!this.isServer) {
      if (<HTMLElement>document.querySelector(".tab_num > div"))
        (<HTMLElement>document.querySelector(".tab_num > div")).style.display =
          "none"; //.hide();
      if (<HTMLElement>document.querySelector(".tab_num > div:first-child"))
        (<HTMLElement>(
          document.querySelector(".tab_num > div:first-child")
        )).style.display = "block"; //.show();
      document.querySelector("li:first-child").classList.add("active");
      if (document.querySelector("ul.emailer-tab")) {
        document
          .querySelector("ul.emailer-tab")
          .addEventListener("click", function (e) {
            if (e.target && (<HTMLElement>e.target).matches("li")) {
              var className = (<HTMLElement>e.target).className;
              var class_num = className.split(" ");
              if (class_num.length == 1) {
                if (document.querySelectorAll(".tab_num .bg-white")) {
                  Array.prototype.map.call(
                    document.querySelectorAll(".tab_num .bg-white"),
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
                var elems = document.querySelectorAll("ul.emailer-tab li");
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

  getFreshData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        console.log(JSON.stringify(rawData, null, 2));
        if (rawData && !rawData["data"]["error"]) {
          this.freshData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
            this.initializeClicks();
          }, 0);
        } else {
          console.log("FreshComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("FreshComponent API data catch error", error);
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
