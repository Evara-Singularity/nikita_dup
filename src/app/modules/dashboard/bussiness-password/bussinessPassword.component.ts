import { DashboardService } from "./../dashboard.service";
import { Component } from "@angular/core";
import { LocalStorageService } from "ngx-webstorage";
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';

@Component({
  selector: "bussiness-password",
  templateUrl: "bussinessPassword.component.html",
  styleUrls: ["bussinessPassword.component.scss"],
})
export class BussinessPasswordComponent {
  error: boolean = true;
  errorMsg: string;
  userInfo;
  userPasswordInfo;
  set showLoader(value) {
    this.loaderService.setLoaderState(value);
  }

  constructor(
    public localStorageService: LocalStorageService,
    public dashboardService: DashboardService,
    private loaderService:GlobalLoaderService) {

    this.showLoader = false;
  }

  ngOnInit() {
    let obj = {};
    obj["userId"] = this.localStorageService.retrieve("user").userId;

    this.dashboardService.getPersonalInfo(obj).subscribe((res) => {
      this.userInfo = res;
      this.showLoader = false;
    });

    this.removeLoader().then((res) => {
      this.showLoader = false;
    });
  }

  removeLoader() {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, 500);
    });
  }

  onSubmit(data) {
    this.showLoader = true;
    let user = this.localStorageService.retrieve("user");

    let obj = {
      idCustomer: user.userId,
      newPassword: data.confirm,
      oldPassword: data.current,
      type: "c",
    };

    this.dashboardService.updatePassword(obj).subscribe((res) => {
      console.log(obj);
      let data = res;
      this.userPasswordInfo = data;
      this.showLoader = false;
      if (data["statusCode"] == 200) {
        this.error = false;
        this.errorMsg = data["status"];
      } else {
        this.error = true;
        this.errorMsg = "Current Password should be correct";
      }
    });
  }
}