import { Component } from "@angular/core";
import { DashboardService } from "../dashboard.service";
import { LocalStorageService } from "ngx-webstorage";
import { map } from "rxjs/operators";
import CONSTANTS from "@app/config/constants";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/utils/services/common.service";
declare var digitalData: {};
declare let _satellite;

@Component({
  selector: "bussiness-rfq",
  templateUrl: "./businessRfq.html",
  styleUrls: ["./businessRfq.scss"],
})
export class BussinessRfqComponent {
  IsHidden: boolean = true;
  isActive = false;
  myRfqList: any;
  i: any;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  readonly imageCdnPath = CONSTANTS.IMAGE_BASE_URL;
  set showLoader(value) {
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private _localAuthService: LocalAuthService,
    private localStorageService: LocalStorageService,
    private _dashboardService: DashboardService,
    private _commonService: CommonService,
    private router: Router,
    public _activatedRoute: ActivatedRoute,
    private loaderService: GlobalLoaderService
  ) {
    this.showLoader = true;

    if (this._activatedRoute.snapshot.queryParams.hasOwnProperty("token")) {
      this._commonService.bharatcraftUserSessionArrived.subscribe((res) => {
        const user = this._localAuthService.getUserSession();
        if (res && user.authenticated === "true") {
          this.getMyRfqList();
          this.setData();
        } else {
          this.router.navigateByUrl("/login");
        }
      });
    } else {
      this.getMyRfqList();
      this.setData();
    }
  }

  setData() {
    let userSession = this._localAuthService.getUserSession();

    let pageData = {
      pageName: "”moglix:account dashboard-myrfq",
      channel: "moglix:my account",
      subSection: "moglix:account dashboard-myrfq",
      loginStatus:
        userSession &&
        userSession.authenticated &&
        userSession.authenticated == "true"
          ? "registered user"
          : "guest",
    };
    let order = {};
    digitalData["page"] = pageData;
    digitalData["custData"] = this._commonService.custDataTracking;
    digitalData["order"] = order;
    if (_satellite) {
      _satellite.track("genericPageLoad");
    }
  }

  getMyRfqList() {
    let user = this.localStorageService.retrieve("user");
    let obj = {};

    if (user.email != undefined && user.email != null)
      obj["email"] = user.email;

    if (user.phone != undefined && user.phone != null)
      obj["phone"] = user.phone;

    if (user.userId != undefined && user.userId != null)
      obj["idCustomer"] = user.userId;

    this._dashboardService
      .getRfqList(obj)
      .pipe(
        map((res) => {
          res["data"].map((item, index) => {
            if (index != 0) {
              item["toggle"] = false;
            } else {
              item["toggle"] = true;
            }
          });
          return res;
        })
      )
      .subscribe((res) => {
        this.myRfqList = res["data"];
        this.showLoader = false;
      });
  }
}
