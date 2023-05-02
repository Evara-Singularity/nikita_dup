import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ClientUtility } from "../../utils/client.utility";
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import { RouterModule } from '@angular/router';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import CONSTANTS from '@app/config/constants';



@Component({
  selector: 'shared-footer',
  templateUrl: './shared-footer.component.html',
  styleUrls: ['./shared-footer.component.scss']
})
export class SharedFooterComponent implements OnInit {
  footerVisible = false;
  today: number = Date.now();
  playStoreLink = "https://play.google.com/store/apps/details?id=com.moglix.online";
  appStoreLink = "https://apps.apple.com/in/app/moglix-best-industrial-app/id1493763517";
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  isFaq:string = ""; 

  constructor(
    private _analytics: GlobalAnalyticsService,
    private _localStorageService: LocalStorageService,
    public _commonService: CommonService,
  ) { }

  ngOnInit(): void {
    if(this._commonService.isBrowser){
      this.isFaq = window.location.toString();
    }
  }

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
      custData:this._commonService.custDataTracking
    };

  
      digitalData['page']['linkPageName'] = 'moglix: ' + "footer";
    

    this._analytics.sendAdobeCall(digitalData, "genericClick");
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule
  ],
  declarations: [
    SharedFooterComponent
  ],
  exports: [
    SharedFooterComponent
  ],
})
export class SharedFooterModule { }
