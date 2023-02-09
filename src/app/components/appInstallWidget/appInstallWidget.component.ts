import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'appInstallWidget',
  templateUrl: './appInstallWidget.component.html',
  styleUrls: ['./appInstallWidget.component.scss']
})
export class AppInstallWidgetComponent implements OnInit {

  readonly baseDomain = CONSTANTS.PROD;
  @Input() productUrl: string;

  //app download link generation
  playStoreLink = "https://moglix.page.link/?link=" + this.baseDomain + this.router.url + "&apn=com.moglix.online&isi=1493763517&ibi=com.moglix.onlineapp";
  appStoreLink = "https://moglix.page.link/?link=" + this.baseDomain + this.router.url + "&apn=com.moglix.online&isi=1493763517&ibi=com.moglix.onlineapp";
  isOverlayMode: boolean = true;
  readonly MOBILE_ENVS = {
    IOS: 'iOS',
    WINDOWS: 'Windows Phone',
    ANDROID: 'Android',
    OTHERS: 'unknown',
  }
  public mobile_os = null;

  constructor(
    public commonService: CommonService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.openAppDownloadlink();
  }

  openAppDownloadlink() {
    this.createPlayStoreLink();
    this.mobile_os = this.getMobileOperatingSystem();
  }

  openStore() {
    if (this.mobile_os == this.MOBILE_ENVS.ANDROID) {
      this.openPlayStore();
    } else if (this.mobile_os == this.MOBILE_ENVS.IOS) {
      this.openAppStore();
    }
  }

  openPlayStore() {
    window.open(this.playStoreLink, '_blank');
  }

  openAppStore() {
    window.open(this.appStoreLink, '_blank');
  }

  createPlayStoreLink() {
    const homepageaLink = "https://moglix.page.link/?link=" + this.baseDomain + this.router.url + "&apn=com.moglix.online&isi=1493763517&ibi=com.moglix.onlineapp";
    const pdpLink = "https://moglix.page.link/?link=" + this.baseDomain + this.router.url + "&apn=com.moglix.online&isi=1493763517&ibi=com.moglix.onlineapp"
    this.playStoreLink = (!this.isOverlayMode) ? homepageaLink : pdpLink
  }

  getMobileOperatingSystem(): string {
    if (this.commonService.isBrowser) {
      var userAgent = navigator.userAgent || navigator.vendor || window['opera'];
      // Windows Phone must come first because its UA also contains "Android"
      if (/windows phone/i.test(userAgent)) {
        return this.MOBILE_ENVS.WINDOWS;
      }
      if (/android/i.test(userAgent)) {
        return this.MOBILE_ENVS.ANDROID;
      }
      // iOS detection from: http://stackoverflow.com/a/9039885/177710
      if (/iPad|iPhone|iPod/.test(userAgent) && !window['MSStream']) {
        return this.MOBILE_ENVS.IOS;
      }
    }
    return this.MOBILE_ENVS.OTHERS;
  }

}

@NgModule({
  declarations: [AppInstallWidgetComponent],
  imports: [
    CommonModule,
  ],
  exports: [AppInstallWidgetComponent]
})
export default class AppInstallWidgetModule { }
