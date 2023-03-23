import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { environment } from 'environments/environment';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalAuthService } from '../../utils/services/auth.service';
import { MockLottiePlayerModule } from '../mock-lottie-player/mock-lottie-player.module';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  @Input() sideMenuOpen: boolean = true;
  reStoreHome: boolean = false;
  @Input('user') user: any = null;
  imgAssetPath: string = environment.IMAGE_ASSET_URL

  constructor(
    private localStorageService: LocalStorageService,
    private globalAnalyticService: GlobalAnalyticsService,
    private router: Router,
    public _localAuthService: LocalAuthService,
    public _commonService: CommonService,
  ) { }

  ngOnInit(): void {
    if (this.localStorageService.retrieve('tocd')) {
      this.reStoreHome = true;
    } else {
      this.reStoreHome = false;
    }
    this.localStorageService.observe('tocd').subscribe((value) => this.reStoreHome = true);
  }

  trackAnalyticAndRedirect(url, checkForloggedIn = false, title = null) {
    let PAGE = {
      channel: "menu_hamburger",
      pageName: this.router.url,
      linkName: url,
      subSection: url + ' link click'
    };
    this.globalAnalyticService.sendAdobeCall({ page: PAGE }, "genericClick");
    if (checkForloggedIn) {
      this.checkIfUserLoggedIn(url, title);
    } else {
      this.router.navigate([url]);
    }
  }

  sideMenu() {
    this.sideMenuOpen = !this.sideMenuOpen;
    if (this.sideMenuOpen) {
      this.disableScroll();
      (<HTMLElement>document.getElementById('body')).classList.add('stop-scroll');
    } else {
      this.enableScroll();
      (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
    }
  }

  disableScroll() {
    this._commonService.setBodyScroll(null, false)
  }

  enableScroll() {
    this._commonService.setBodyScroll(null, true)
  }

  preventDefault(e) {
    e.preventDefault();
  }
  propagation(e) {
    e.stopPropagation();
  }

  reStoreCookie() {
    this.sideMenu();
    this.localStorageService.clear('tocd');
    this.reStoreHome = false;
  }

  redirectProfile() {
    this.checkIfUserLoggedIn('/dashboard/info')
  }

  getFirstNameFormName(firstName) {
    if (firstName) {
      return firstName.split(' ')[0];
    }
    return firstName;
  }

  checkIfUserLoggedIn(url, title = "") {
    let user = this.localStorageService.retrieve("user");
    if (user && user.authenticated == "true") {
      this.router.navigate([url]);
    } else {
      this._localAuthService.setBackURLTitle(url, title);
      let navigationExtras: NavigationExtras = {
        queryParams: { 'backurl': url },
      };
      this.router.navigate(['/login'], navigationExtras);
    }
  }

  addLottieScript() {
    this._commonService.addLottieScriptSubject.subscribe(lottieInstance => {
      this._commonService.callLottieScript();
      lottieInstance.next();
    });
  }

  ngAfterViewInit() {
    this._commonService.callLottieScript();
    this.addLottieScript();
  }

  loadBulkRFQ(){
    this.sideMenu();
    this._commonService.initiateBulkRfq(true);
  }

}


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AppPromoModule,
    MockLottiePlayerModule
  ],
  declarations: [SideNavComponent]
})
export class SideNavModule { }