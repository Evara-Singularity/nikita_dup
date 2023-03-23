import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';



@Component({
  selector: 'app-app-banner',
  templateUrl: './app-banner.component.html',
  styleUrls: ['./app-banner.component.scss']
})
export class AppBannerComponent implements OnInit {

  //app download link generation
  playStoreLink = "https://play.google.com/store/apps/details?id=com.moglix.online";
  appStoreLink = "https://apps.apple.com/in/app/moglix-best-industrial-app/id1493763517";
  isOverlayMode: boolean = true;
  readonly MOBILE_ENVS = {
    IOS: 'iOS',
    WINDOWS: 'Windows Phone',
    ANDROID: 'Android',
    OTHERS: 'unknown',
  }
  public mobile_os = null;


  constructor(public commonService: CommonService) { }

  ngOnInit(): void {
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
    const homepageaLink = "https://play.google.com/store/apps/details?id=com.moglix.online&referrer=utm_source%3DPWA%26utm_medium%3Dhomepage%26utm_campaign%3Dapp_download_nudge";
    const pdpLink = "https://play.google.com/store/apps/details?id=com.moglix.online&referrer=utm_source%3DPWA%26utm_medium%3Dproductpage%26utm_campaign%3Dapp_download_nudge"
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
