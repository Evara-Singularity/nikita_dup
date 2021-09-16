import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, NavigationStart } from "@angular/router";
import { CommonService } from "@app/utils/services/common.service";

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
    private title: Title,
    private _router: Router,
    public _commonService: CommonService
  ) {
    this.title.setTitle("Dashboard-Moglix");
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
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
