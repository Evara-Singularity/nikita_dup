import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';
import { LocalAuthService } from '../../utils/services/auth.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

  @Input() sideMenuOpen: boolean = true;
  reStoreHome: boolean = false;
  @Input('user') user: any = null

  constructor(
    private localStorageService: LocalStorageService,
    private globalAnalyticService: GlobalAnalyticsService,
    private router: Router,
    private _localAuthService: LocalAuthService
  ) { }

  ngOnInit(): void {
    if (this.localStorageService.retrieve('tocd')) {
      this.reStoreHome = true;
    } else {
      this.reStoreHome = false;
    }
    this.localStorageService.observe('tocd').subscribe((value) => this.reStoreHome = true);
  }

  trackAnalyticAndRedirect(url, checkForloggedIn = false, title=null) {
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
    document.getElementById('body').addEventListener('touchmove', this.preventDefault, { passive: false });
    document.getElementById('scrolledUl').addEventListener('touchmove', this.propagation, { passive: false });
  }

  enableScroll() {
    document.getElementById('body').removeEventListener('touchmove', this.preventDefault);
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

}

@NgModule({
  imports: [
    CommonModule, 
    RouterModule,
    AppPromoModule
  ],
  declarations: [SideNavComponent]
})
export class SideNavModule { }