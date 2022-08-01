import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { ClientUtility } from "../../utils/client.utility";
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';


@Component({
  selector: 'shared-footer',
  templateUrl: './shared-footer.component.html',
  styleUrls: ['./shared-footer.component.scss']
})
export class SharedFooterComponent {
  footerVisible = false;
  today: number = Date.now();
  playStoreLink = "https://play.google.com/store/apps/details?id=com.moglix.online";
  appStoreLink = "https://apps.apple.com/in/app/moglix-best-industrial-app/id1493763517";

  constructor(
    private _analytics: GlobalAnalyticsService,
    private _localStorageService: LocalStorageService,
    public _commonService: CommonService,
  ) { }

  clickFooter() {
    this.footerVisible = !this.footerVisible;
    if (this.footerVisible && document.getElementById("footerContainer")) {
      let footerOffset = document.getElementById("footerContainer").offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset - 50);
    }
  }

  openPlayStore() {
    this.callAnalytics();
    window.open(this.playStoreLink, '_blank');
  }

  openAppStore() {
    this.callAnalytics();
    window.open(this.appStoreLink, '_blank');
  }

  callAnalytics() {
    const user = this._localStorageService.retrieve('user');

    let digitalData = {
      page: {
        linkName: 'Install App'
      },
      custData: {
        'customerID': (user && user["userId"]) ? btoa(user["userId"]) : '',
        'emailID': (user && user["email"]) ? btoa(user["email"]) : '',
        'mobile': (user && user["phone"]) ? btoa(user["phone"]) : '',
        'customerType': (user && user["userType"]) ? user["userType"] : '',
      }
    };

  
      digitalData['page']['linkPageName'] = 'moglix: ' + "footer";
    

    this._analytics.sendAdobeCall(digitalData, "genericClick");
  }
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    SharedFooterComponent
  ],
  exports: [
    SharedFooterComponent
  ],
})
export class SharedFooterModule { }
