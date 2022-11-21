import { Component, ViewEncapsulation, Inject, ElementRef, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { CommonService } from '@app/utils/services/common.service';
@Component({
  selector: "special-deal",
  templateUrl: "specialDeals.html",
  styleUrls: ["specialDeals.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SpecialDealsComponent {
  isServer: boolean;
  isBrowser: boolean;
  SpecialDealsData: any;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private meta: Meta,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.getSpecialDealsData();
    this.setMetas();
    this.initializeClicks();
  }

  initializeClicks() {
    let tab = this.activatedRoute.snapshot.queryParams["tab"] || 1;
    if (tab < 1 || tab > 6) tab = 1;
    if (!this.isServer) {
      setTimeout(function () {
        document.querySelector("li").classList.remove("active");
        (<HTMLElement>document.querySelector(".tab_num > div")).style.display =
          "none"; //.hide();
        (<HTMLElement>(
          document.querySelector(".tab_num > div:nth-child(" + tab + ")")
        )).style.display = "block"; //.show();
        document
          .querySelector("li:nth-child(" + tab + ")")
          .classList.add("active");
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
    this.title.setTitle("Special Deals - Moglix.com");
    this.meta.addTag({ property: "og:title", content: "Special Deals - Moglix.com", });
    this.meta.addTag({ property: "og:url",   content: CONSTANTS.PROD+ ENDPOINTS.SPL_DEALS,});
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    } 
  }

  getSpecialDealsData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        // console.log(JSON.stringify(rawData, null, 2));
        if (rawData && !rawData["data"]["error"]) {
          this.SpecialDealsData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
          }, 0);
        } else {
          console.log("SpecialDealsComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("SpecialDealsComponent API data catch error", error);
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
          this.renderer.listen(link, "click", (event) => {
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