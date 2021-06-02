import { Component, ViewEncapsulation, Inject, PLATFORM_ID, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformServer, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: "made-in-india",
  templateUrl: "madeInIndia.html",
  styleUrls: ["madeInIndia.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class MadeInIndiaComponent {
  isServer: boolean;
  isBrowser: boolean;
  madeInIndiaData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private title: Title,
    public router: Router,
    private meta: Meta,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document) {

    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
    this.getMadeInIndiaData();
    this.setMetas();
  }

  setMetas() {
    this.title.setTitle("Republic Day Deals - Moglix.com");
    this.meta.addTag({ name: "description", content: "Celebrate India's pride with best Indian brands and products manufactured exclusively in India. Explore the Made in India range at Moglix.com.",});
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    } 
  }

  getMadeInIndiaData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        if (rawData && !rawData["data"]["error"]) {
          this.madeInIndiaData = rawData["data"][0];
          setTimeout(() => {
            this.initializeClicks();
            this.reinsertLinks();
          }, 0);
        } else {
          console.log("MadeInIndiaComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("MadeInIndiaComponent API data catch error", error);
      }
    );
  }

  initializeClicks() {
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
                <HTMLElement>document.querySelector(".tab_num div." + className)
              )
                (<HTMLElement>(
                  document.querySelector(".tab_num div." + className)
                )).style.display = "block"; //.show();
              var elems = document.querySelectorAll("ul.emailer-tab li");
              [].forEach.call(elems, function (el) {
                el.classList.remove("active");
              });
              document.querySelector("li." + className).classList.add("active");
            }
          }
        });
    }
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