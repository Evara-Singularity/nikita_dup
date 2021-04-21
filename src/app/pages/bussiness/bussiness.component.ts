import { Component, OnInit, PLATFORM_ID, Inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, NavigationStart } from "@angular/router";
import { isPlatformServer, isPlatformBrowser } from "@angular/common";

@Component({
  selector: "bussiness",
  templateUrl: "bussiness.html",
  styleUrls: ["bussiness.scss"],
})
export class DashboardBussinessComponent implements OnInit {
  public showLeftMenu: boolean;
  currentRoute: string;
  isServer: boolean;
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private title: Title,
    private _router: Router
  ) {
    this.title.setTitle("Dashboard-Moglix");
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.showLeftMenu = this.showLeftMenuFn(this._router.url);
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.showLeftMenu = this.showLeftMenuFn(event["url"]);
      }
    });
  }
  private showLeftMenuFn(url: string) {
    if (url === "/dashboard") {
      return false;
    }
    return true;
  }
}
