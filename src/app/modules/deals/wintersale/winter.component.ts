import { Component, ViewEncapsulation, Inject, Renderer2, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';
@Component({
  selector: "winter",
  templateUrl: "winter.html",
  styleUrls: ["winter.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class WinterComponent {
  isServer: boolean;
  isBrowser: boolean;
  WinterData: any;

  constructor(
    private elementRef: ElementRef,
    private _renderer2: Renderer2,
    private title: Title,
    public router: Router,
    private meta: Meta,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.getWinterData();
    this.setMetas();
    this.initializeClicks();
  }

  initializeClicks() {
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

  setMetas() {
    this.title.setTitle("Winter Sale - Winter Exclusive Offers and Deals - Moglix.com");
    this.meta.addTag({ name: "description", content: "Get the best delas this winter season on Moglix. Annuncinng price drop alert and heavy discounts on range of products." });
    if (this.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = CONSTANTS.PROD + this.router.url;
      this._renderer2.appendChild(this._document.head, links);
    } 
  }

  getWinterData() {
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        console.log(JSON.stringify(rawData, null, 2));
        if (rawData && !rawData["data"]["error"]) {
          this.WinterData = rawData["data"][0];
          setTimeout(() => {
            this.reinsertLinks();
          }, 0);
        } else {
          console.log("WinterSaleComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("WinterSaleComponent API data catch error", error);
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