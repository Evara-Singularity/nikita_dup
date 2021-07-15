import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-promo',
  templateUrl: './app-promo.component.html',
  styleUrls: ['./app-promo.component.scss']
})
export class AppPromoComponent implements OnInit {

  readonly assetImgPath: string = CONSTANTS.IMAGE_ASSET_URL;
  readonly key: string = 'user-app-promo-status';
  readonly MOBILE_ENVS = {
    IOS: 'iOS',
    WINDOWS: 'Windows Phone',
    ANDROID: 'Android',
    OTHERS: 'unknown',
  }
  readonly playStoreLink = "https://play.google.com/store/apps/details?id=com.moglix.online";
  readonly appStoreLink = "https://apps.apple.com/in/app/moglix-best-industrial-app/id1493763517";

  @Input() isOverlayMode: boolean = true;
  @Input() showPromoCode: boolean = true;
  @Input() productMsn: string = null;
  @Input() isLazyLoaded: boolean = false;
  @Output() appPromoStatus$: EventEmitter<boolean> = new EventEmitter<boolean>();

  public appPromoStatus: boolean = true;
  public mobile_os = null;
  public isUserAuthenticated: boolean = true;
  public isAppInstalled: boolean = false;

  constructor(
    private _localStorage: LocalStorageService,
    private _localAuthService: LocalAuthService,
    public _commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    this.readStatusFromLocalStorage();
    this.getUserAuthenticationStatus();
    this.getUserAuthenticationStatusChange();
    this.mobile_os = this.getMobileOperatingSystem();
  }

  get productDeepLink() {
    return 'moglix://' + this.productMsn;
  }

  openDeepLink() {
    window.open(this.productDeepLink, '_blank');
  }

  openPlayStore() {
    window.open(this.playStoreLink, '_blank');
  }

  openAppStore() {
    window.open(this.appStoreLink, '_blank');
  }

  removePromo() {
    this.appPromoStatus = false;
    this.appPromoStatus$.emit(false);
    this._localStorage.store(this.key, false);
  }

  readStatusFromLocalStorage() {
    if (this._localStorage.retrieve(this.key) != null) {
      this.appPromoStatus = false;
      this.appPromoStatus$.emit(false);
    } else {
      this.appPromoStatus = true;
    }
  }

  getUserAuthenticationStatus() {
    const user = this._localAuthService.getUserSession();
    this.isUserAuthenticated = user && user.authenticated && user.authenticated === 'true' ? true : false;
  }

  getUserAuthenticationStatusChange() {
    this._localAuthService.login$.subscribe((data) => {
      const user = this._localAuthService.getUserSession();
      this.isUserAuthenticated = user && user.authenticated && user.authenticated === 'true' ? true : false;
    });
  }

  getMobileOperatingSystem(): string {
    var userAgent = navigator.userAgent || navigator.vendor || window['opera'];
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return this.MOBILE_ENVS.WINDOWS;
    }
    if (/android/i.test(userAgent)) {
      return this.MOBILE_ENVS.ANDROID;
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return this.MOBILE_ENVS.IOS;
    }
    return this.MOBILE_ENVS.OTHERS;
  }

}
