import { Component } from '@angular/core';
import { LocalStorageService } from "ngx-webstorage";
import { DashboardService } from '../dashboard.service';

@Component({
    selector: "bussiness-dashboard",
    templateUrl: "dashboard.html",
    styleUrls: ["dashboard.scss"],
})
export class BusinessDashboardComponent {

    bussinessTab: string = "detail";
    userSession: any;
    showProfileIncompleteStrip: boolean = false;
    businessName: any;

    constructor(
        private _localStorageService: LocalStorageService,
        private _dashboardService: DashboardService) {

        this.getBusinessDetails();
    }

    getBusinessDetails() {

        const user = this._localStorageService.retrieve("user");
        const data = { customerId: user.userId, userType: "business" };

        this._dashboardService.getBusinessDetail(data).subscribe((res) => {
            res["data"]
                ? (this.businessName = res["data"]["companyName"])
                : (this.businessName = "My Dashboard");
            res["statusCode"] == 200 && res["data"] && !res["data"]["gstin"]
                ? (this.showProfileIncompleteStrip = true)
                : (this.showProfileIncompleteStrip = false);
        });
    }
}
