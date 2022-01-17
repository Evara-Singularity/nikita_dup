import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
  selector: 'app-deals-layout',
  templateUrl: './deals-layout.component.html',
  styleUrls: ['./deals-layout.component.scss']
})
export class DealsLayoutComponent implements OnInit {
  currentRoute: any;

  constructor(
    public router: Router,
    private globalAnalyticService: GlobalAnalyticsService,
    public commonService: CommonService
  ) {
    this.currentRoute = this.router.url;
  }
  ngOnInit(): void {
    this.sendAdobeAnalysis();
  }

  sendAdobeAnalysis() {
    let PAGE = {
      channel: "deals",
      loginStatus: this.commonService.loginStatusTracking,
      pageName: "moglix:deals:" + (this.router.url).split('/').pop(),
      subSection: "moglix:deals:" + (this.router.url).split('/').pop(),
    };
    this.globalAnalyticService.sendAdobeCall({ page: PAGE }, "genericClick");
  }
}
