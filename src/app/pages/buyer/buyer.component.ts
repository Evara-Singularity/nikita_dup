import { Component, Renderer2, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser'; import { DOCUMENT, isPlatformServer } from "@angular/common";
import { filter } from 'rxjs/operators';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: "buyer",
  templateUrl: "buyer.html",
  styleUrls: ["buyer.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class BuyerComponent {
  pageTitle;
  buyerPageURL;
  currentRoute: string;
  isServer: boolean;
  API: {};

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private _router: Router,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) platformId: Object) {

    this.isServer = isPlatformServer(platformId);
    this.setMetas();
  }
  
  setMetas() {
    this.pageTitle = "Buying Guide for Industrial Products";
    let link = CONSTANTS.PROD + this._router.url.split("?")[0].split("#")[0];
    this.meta.addTag({ property: "og:url", content: link });
    if (this.isServer) {
    let links = this._renderer2.createElement("link");
    links.rel = "canonical";
    links.href = CONSTANTS.PROD + this._router.url.split("?")[0].split("#")[0];
    this._renderer2.appendChild(this._document.head, links);
    }

    this.buyerPageURL = this.router.url;
    if (this.buyerPageURL == "/buyer-guide") {
      this.meta.addTag({ property: "og:description", content: "Read how to effectively buy products at Moglix.com with exclusive buying guide on safety shoes, cctv cameras, drill machine, power tools, table fans and more." });
      this.meta.addTag({ name: "description", content: "Read how to effectively buy products at Moglix.com with exclusive buying guide on safety shoes, cctv cameras, drill machine, power tools, table fans and more." });
      this.meta.addTag({ property: "og:title", content: this.pageTitle });
      this.title.setTitle("Buying Guide for Industrial Products");
    }
  }

  ngOnInit() {
    this.API = CONSTANTS;
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setCurrentRoute();
      });
    this.setCurrentRoute();
  }
  private setCurrentRoute() {
    this.currentRoute = this._router.url.split("?")[0].split("#")[0];
  }

  ngAfterViewInit() {
    this.commonService.loadFreshChat();
  }
}