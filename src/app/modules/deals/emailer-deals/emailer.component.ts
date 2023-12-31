import { Component, ViewEncapsulation, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: "emailer",
  templateUrl: "emailer.html",
  styleUrls: ["emailer.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class EmailerComponent {
  tab_num: string = "power";
  isServer: boolean;
  isBrowser: boolean;
  emailerData: any;

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private _router: Router,
    private meta: Meta,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    public router: Router,
    private route: ActivatedRoute,
    public _commonService: CommonService) {

    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.getEmailData();
  }

  ngOnInit() {
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
                ){
                  (<HTMLElement>(
                    document.querySelector(".tab_num div." + className)
                  )).style.display = "block"; //.show();
                }
                  
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

  getEmailData() {
    this.title.setTitle("Emailer-Moglix.com");
    // data received by layout resolver
    this.route.data.subscribe(
      (rawData) => {
        if (rawData && !rawData["data"]["error"]) {
          this.emailerData = rawData["data"][0];
          setTimeout(() => {
            this.initializeClicks();
          }, 0);
        } else {
          console.log("ExclusiveComponent API data error", rawData);
          this.router.navigateByUrl("/");
        }
      },
      (error) => {
        console.log("ExclusiveComponent API data catch error", error);
      }
    );
  }
}